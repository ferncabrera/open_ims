import { Request, Response } from "express";
import { query, chained_query } from "../db";
import { get_user_id } from "./users";
import customError from "../utils/customError";
import _ from "lodash";

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

  let customers_query;
  let count_query;

  const filter = JSON.parse(searchquery);

  if (_.isEmpty(filter) || Object.values(filter).every(value => !value)) {
    customers_query = await query("SELECT * FROM customer_table ORDER BY id LIMIT $1 OFFSET $2", [pagesize, offset]);
    count_query = await query("SELECT COUNT(*) FROM customer_table");
  } else {
    const {searchQuery} = filter;
    const [firstName, lastName] = searchQuery.split(" ");

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
          ORDER BY id LIMIT $2 OFFSET $3;
        `, [searchQuery, pagesize, offset, firstName, lastName]);
    count_query = customers_query
  }

  const totalCount: any = count_query.rows[0] ? count_query.rows[0].count : null;

  res.status(200).json({
    pageindex,
    pagesize,
    offset,
    searchquery,
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
        customerAddressName: element.customer_address_name,
        address1: element.street_address_line1,
        address2: element.street_address_line2,
        city: element.city,
        province: element.province,
        country: element.country,
        postalCode: element.postal
      }
    } else if (element.address === "Billing") {
      customer_object.billing = {
        customerAddressName: element.customer_address_name,
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

export const create_customer = async (req: Request, res: Response) => {
  const data = req.body;

  const connected_vendor = data.vendor ? data.vendor : '';
  const queriesList = [] as { text: string; params: any[] }[];
  const { id, firstName, lastName, companyName, email, phone, netTerms } = data;

  const net_terms = netTerms ? netTerms : 0;

  if (!(firstName && lastName && companyName && email && phone)) {
    throw new customError({ message: "Missing required fields!", code: 20 });
  }
  
  const user_id = await get_user_id(req, res)

  const result = await query(`INSERT INTO customer_table (first_name,last_name,company_name,email,phone,net_terms, created_by) 
  VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`, [firstName, lastName, companyName, email, phone, net_terms, user_id]);

  const new_id = result.rows[0].id


  try {

    if (connected_vendor) { // only create new one if we have a passed in vendor

      const vendor_query = await query("SELECT * FROM vendor_table WHERE company_name = $1", [connected_vendor]);
      const new_vendor_id = vendor_query.rows[0].id;

      const create_vendor_customer_query: IChainedQueryProps = {
        text: 'INSERT INTO vendor_and_customer (vendor_id, customer_id) VALUES ($1, $2)',
        params: [new_vendor_id, new_id]
      }
      queriesList.push(create_vendor_customer_query)
    };

    const create_address = async (type: string, address_data: any) => {
      const { customerAddressName, address1, address2, city, province, postalCode, country } = address_data;

      const create_address_query: IChainedQueryProps = {
        text: `
      INSERT INTO customer_addresses 
      (customer_id,
        address, 
        street_address_line1, 
        street_address_line2,
        city,
        province,
        postal,
        country,
        customer_address_name)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9 )`,
        params: [new_id, type, address1, address2, city, province, postalCode, country, customerAddressName]
      };

      queriesList.push(create_address_query)
    }

    if (data.shipping) {
      create_address('Shipping', data.shipping)
    };
    if (data.billing) {
      create_address('Billing', data.billing)
    };

    await chained_query(queriesList)
  } catch (err) {
    await query('DELETE FROM customer_table WHERE id = $1', [new_id])
    throw new customError({message: 'Failed database operation', code:20})
  }


  res.status(200).json({ message: "Successfully created customer" });

};

export const get_available_customers = async (req: Request, res: Response) => {
  const customers_list_query = await query("SELECT * FROM customer_table");
  const unavailable_list_query =  await query("SELECT * FROM vendor_and_customer");

  const customers = customers_list_query.rows;
  const unavailable = unavailable_list_query.rows;

  const available = customers.filter((object) => {
    return !unavailable.some((unavailable_object) => unavailable_object.customer_id === object.id)
  });

  res.status(200).json({message: 'Successfully retrieved available customers', data: available});
};

export const get_all_customers = async (req: Request, res: Response) => {
  const customers_list_query = await query("SELECT * FROM customer_table");
  res.status(200).json({message: 'Successfully retrieved all customers', data: customers_list_query.rows})
};


export const update_customer = async (req: Request, res: Response) => {

  const data = req.body

  const connected_vendor = data.vendor ? data.vendor : '';
  const queriesList = [] as { text: string; params: any[] }[];

  const { id, firstName, lastName, companyName, email, phone, netTerms } = data;
  const net_terms = netTerms ? netTerms : 0;


  if (!(id && firstName && lastName && companyName && email && phone)) {
    throw new customError({ message: "Missing required fields!", code: 20 });
  }

  const create_or_update_address = async (type: string, address_data: any) => {

    const { customerAddressName, address1, address2, city, province, postalCode, country } = address_data;

    // Have to check if shipping or billing already exists. This decides on the user's edit whether we create, read, update, or delete
    const address_query: any = await query(
      "SELECT * FROM customer_addresses WHERE customer_id = $1 AND address = $2"
      , [data.id, type]);

    const address = address_query.rows[0];
    if (address && address.address) {
      // update
      const { id } = address;

      const update_address_query: IChainedQueryProps = {
        text: `
          UPDATE customer_addresses SET
            customer_id = $2,
            customer_address_name = $10,
            address = $3,
            street_address_line1 = $4,
            street_address_line2 = $5,
            city = $6,
            province = $7,
            postal = $8,
            country = $9
          WHERE id = $1`,
        params: [id, data.id, type, address1, address2, city, province, postalCode, country, customerAddressName]
      };
      queriesList.push(update_address_query);

    } else if (!address || !address.address) {
      // create
      const create_address_query: IChainedQueryProps = {
        text: `
          INSERT INTO customer_addresses 
          (customer_id,
            address, 
            street_address_line1, 
            street_address_line2,
            city,
            province,
            postal,
            country,
            customer_address_name)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9 )`,
        params: [data.id, type, address1, address2, city, province, postalCode, country, customerAddressName]
      }

      queriesList.push(create_address_query);
    }


  };

  if (data.shipping) {
    await create_or_update_address('Shipping', data.shipping);
  } else if (!data.shipping) {
    // delete
    const delete_shipping_query: IChainedQueryProps = {
      text: `DELETE FROM customer_addresses WHERE customer_id = $1 AND address = $2`,
      params: [id, 'Shipping']
    };
    queriesList.push(delete_shipping_query);
  };
  if (data.billing) {
    await create_or_update_address('Billing', data.billing);

  } else if (!data.billing) {
    //delete
    const delete_billing_query: IChainedQueryProps = {
      text: `DELETE FROM customer_addresses WHERE customer_id = $1 AND address = $2`,
      params: [id, 'Billing']
    };
    queriesList.push(delete_billing_query);
  };



  //update (this is just basically delete old one and create new one)
  const delete_vendor_customer_query: IChainedQueryProps = {
    text: `DELETE FROM vendor_and_customer WHERE customer_id = $1`,
    params: [id]
  };

  queriesList.push(delete_vendor_customer_query);

  if (connected_vendor) { // only create new one if we have a passed in vendor

    const vendor_query = await query("SELECT * FROM vendor_table WHERE company_name = $1", [connected_vendor]);
    const new_vendor_id = vendor_query.rows[0].id;

    const create_vendor_customer_query: IChainedQueryProps = {
      text: 'INSERT INTO vendor_and_customer (vendor_id, customer_id) VALUES ($1, $2)',
      params: [new_vendor_id, id]
    }
    queriesList.push(create_vendor_customer_query)
  }


  const customer_query = {
    text:
      `UPDATE customer_table SET
        first_name = $2,
        last_name = $3,
        company_name = $4,
        email = $5,
        phone = $6,
        net_terms = $7
      WHERE id = $1`,
    params: [id, firstName, lastName, companyName, email, phone, net_terms]
  };

  queriesList.push(customer_query)


  await chained_query(queriesList)


  res.status(200).json({ message: "Successfully updated customer" });

}

export const delete_customers = async (req: Request, res: Response) => {

  const delete_ids = req.body;

  for (const id of delete_ids) {
    const delete_invoice_query = {
      text: "DELETE FROM invoice_orders WHERE customer_id = $1",
      params: [id]
    };

    const delete_customer_query = {
      text: "DELETE FROM customer_table WHERE id = $1",
      params: [id]
    }

    await chained_query([delete_invoice_query, delete_customer_query]);

  }
  res.status(200).json({ message: 'Successfully Deleted All Customers' });
}

export const delete_customer = async (req: Request, res: Response) => {
  const data = req.body;
  const delete_invoice_query = {
    text: "DELETE FROM invoice_orders WHERE customer_id = $1",
    params: [data.customer_id]
  };
  const delete_customer_query = {
    text: "DELETE FROM customer_table WHERE id = $1",
    params: [data.customer_id]
  };
  await chained_query([delete_invoice_query, delete_customer_query]);
  res.status(200).json({ message: 'Customer Successfully Deleted' });
}