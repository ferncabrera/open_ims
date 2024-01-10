import { Request, Response } from "express";
import { query } from "../db";
import customError from "../utils/customError";

interface IGetListRequestHeaders {
  pageindex: number;
  pagesize: number;
  searchquery: string;
};

interface IGetCustomerRequestHeaders {
  id: string;
};

export const get_customers = async (req: Request, res: Response) => {

  const { pageindex, pagesize, searchquery } = req.headers as unknown as IGetListRequestHeaders;
  const offset: number = Number(pageindex) * Number(pagesize);
  // !!! should look into sanitizing this.

  let customers_query;
  let count_query;

  if (!searchquery) {
    customers_query = await query("SELECT * FROM customer_table LIMIT $1 OFFSET $2", [pagesize, offset]);
    count_query = await query("SELECT COUNT(*) FROM customer_table");
  } else {
    const [firstName, lastName] = searchquery.split(" ");

    customers_query = await query(`
        WITH filtered_rows AS (
            SELECT
              id,
              email,
              first_name,
              last_name,
              company_name,
              phone
            FROM
              customer_table
            WHERE
              id::text ILIKE '%' || $1 || '%'
              OR email ILIKE '%' || $1 || '%'
              OR first_name ILIKE '%' || $1 || '%'
              OR last_name ILIKE '%' || $1 || '%'
              OR (first_name ILIKE '%' || $4 || '%' AND last_name ILIKE '%' || $5 || '%')
              OR company_name ILIKE '%' || $1 || '%'
              OR phone ILIKE '%' || $1 || '%'
          ),
          total_count AS (
            SELECT COUNT(*) AS count FROM filtered_rows
          )
          SELECT
            id,
            email,
            first_name,
            last_name,
            company_name,
            phone,
            (SELECT count FROM total_count) AS count
          FROM
            filtered_rows
          LIMIT $2 OFFSET $3;
        `, [searchquery, pagesize, offset, firstName, lastName]);
    count_query = customers_query
  }

  const totalCount: any = count_query.rows[0] ? count_query.rows[0].count : null;

  res.status(200).json({
    pageindex,
    pagesize,
    offset,
    total: totalCount,
    data: customers_query.rows
  });
};

export const get_customer = async (req: Request, res: Response) => {
  const { id } = req.headers as unknown as IGetCustomerRequestHeaders
  const customer_object: any = {}

  const customer_vendor_query: any = await query(
    "SELECT * FROM vendor_and_customer WHERE customer_id = $1"
    , [id]);

  if (customer_vendor_query.rows[0]) {
    const vendor_id = customer_vendor_query.rows[0].vendor_id;

    const vendor_query: any = await query("SELECT * FROM vendor_table WHERE id = $1", [vendor_id]);
    const vendor_company_name = vendor_query.rows[0].company_name;
    customer_object.vendor = vendor_company_name;
  }

  const customer_query: any = await query(
    "SELECT * FROM customer_table WHERE id = $1", [id]);

  const customer_data = customer_query.rows[0]

  if (customer_data) {
    customer_object.id = id;
    customer_object.firstName = customer_data.first_name;
    customer_object.lastName = customer_data.last_name;
    customer_object.companyName = customer_data.company_name;
    customer_object.email = customer_data.email;
    customer_object.phone = customer_data.phone;
    customer_object.netTerms = customer_data.net_terms;
  };

  const address_query: any = await query(
    "SELECT * FROM customer_addresses WHERE customer_id = $1"
    , [id]);

  for (const element of address_query.rows) {
    if (element.address === "Shipping") {
      customer_object.shipping = {
        address1: element.street_address_line1,
        address2: element.street_address_line2,
        city: element.city,
        province: element.province,
        country: element.country,
        postalCode: element.postal
      }
    } else if (element.address === "Billing") {
      customer_object.billing = {
        address1: element.street_address_line1,
        address2: element.street_address_line2,
        city: element.city,
        province: element.province,
        country: element.country,
        postalCode: element.postal
      }
    }
  }


  const default_addresses_object = {
    address1: '',
    address2: '',
    city: '',
    province: '',
    country: '',
    postalCode: '',
  };

  if (!customer_object.billing) {
    customer_object.billing = default_addresses_object;
  }
  if (!customer_object.shipping) {
    customer_object.shipping = default_addresses_object;
  };

  res.status(200).json({ id, message: 'Successfully retrieved customer data', data: customer_object });


}