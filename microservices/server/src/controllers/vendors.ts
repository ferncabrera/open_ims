import { Request, Response } from "express";
import { get_user_id } from "./users";
import { query, chained_query } from "../db";
import customError from "../utils/customError";
import _, { chain } from "lodash";

interface IGetListRequestHeaders {
  pageindex: number;
  pagesize: number;
  searchquery: string;
};

export const get_all_vendors = async (req: Request, res: Response) => {
  const vendors_list_query = await query("SELECT * FROM vendor_table");
  const vendors_list = vendors_list_query.rows;

  res.status(200).json({ message: "Successfully retrieved all vendors", data: vendors_list });
};

export const get_vendors = async (req: Request, res: Response) => {
  const { pageindex, pagesize, searchquery } = req.headers as unknown as IGetListRequestHeaders;
  const offset: number = Number(pageindex) * Number(pagesize);

  let vendors_query;
  let count_query;

  const search_filter = JSON.parse(searchquery)
  const { searchQuery } = search_filter;


  if (_.isEmpty(search_filter) || Object.values(search_filter).every(value => !value)) {
    vendors_query = await query("SELECT * FROM vendor_table ORDER BY id LIMIT $1 OFFSET $2", [pagesize, offset]);
    count_query = await query("SELECT COUNT(*) FROM vendor_table");
  } else {
    console.log('searchQuery', searchQuery)
    const [firstName, lastName] = searchQuery.split(" ");

    vendors_query = await query(`
        WITH filtered_rows AS (
            SELECT
              id,
              email,
              first_name,
              last_name,
              company_name,
              phone
            FROM
              vendor_table
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
    count_query = vendors_query
  }

  const totalCount: any = count_query.rows[0] ? count_query.rows[0].count : null;

  res.status(200).json({
    pageindex,
    pagesize,
    offset,
    searchquery,
    total: totalCount,
    data: vendors_query.rows
  });

};

export const get_available_vendors = async (req: Request, res: Response) => {
  const vendors_list_query = await query("SELECT * FROM vendor_table");
  const unavailable_list_query = await query("SELECT * FROM vendor_and_customer");

  const vendors = vendors_list_query.rows;
  const unavailable = unavailable_list_query.rows;

  const available = vendors.filter((object) => {
    return !unavailable.some((unavailable_object) => unavailable_object.vendor_id === object.id);
  });

  res.status(200).json({ message: "Successfully retrieved all available vendors", data: available })
}

export const get_vendor = async (req: Request, res: Response) => {
  const { id } = req.headers;

  const vendor_query = await query("SELECT * FROM vendor_table WHERE id = $1", [id]);
  const vendor_address_query = await query("SELECT * FROM vendor_addresses WHERE vendor_id = $1", [id]);
  const vendor_and_customer_query = await query("SELECT customer_id FROM vendor_and_customer WHERE vendor_id = $1", [id]);

  let linked_customer = null;
  if (vendor_and_customer_query.rows[0]) {
    const customer_id = vendor_and_customer_query.rows[0].customer_id;
    const customer_query = await query("SELECT company_name FROM customer_table WHERE id = $1", [customer_id])
    linked_customer = customer_query.rows[0].company_name;
  }

  const vendor_addresses = vendor_address_query.rows;

  const vendor_obj: any = {};


  for (const element of vendor_addresses) {
    if (element.address === "Shipping") {
      vendor_obj.shipping = {
        vendorAddressName: element.vendor_address_name,
        address1: element.street_address_line1,
        address2: element.street_address_line2,
        city: element.city,
        province: element.province,
        country: element.country,
        postalCode: element.postal
      }
    } else if (element.address === "Billing") {
      vendor_obj.billing = {
        vendorAddressName: element.vendor_address_name,
        address1: element.street_address_line1,
        address2: element.street_address_line2,
        city: element.city,
        province: element.province,
        country: element.country,
        postalCode: element.postal
      }
    }
  };

  const vendor_data = vendor_query.rows[0];

  if (vendor_data) {
    vendor_obj.connectCustomer = linked_customer
    vendor_obj.companyName = vendor_data.company_name
    vendor_obj.email = vendor_data.email
    vendor_obj.firstName = vendor_data.first_name
    vendor_obj.lastName = vendor_data.last_name
    vendor_obj.phone = vendor_data.phone
  };



  const get_purchase_order_query = await query("SELECT * FROM purchase_orders WHERE vendor_id = $1", [id]);
  const purchase_orders = get_purchase_order_query.rows;

  res.status(200).json({ message: 'Vendor successfully retrieved', data: vendor_obj });
};

export const create_vendor = async (req: Request, res: Response) => {
  const data = req.body;


  const connected_customer = data.connectCustomer ? data.connectCustomer : '';
  const queries_list = [] as { text: string; params: any[] }[];

  const { firstName, lastName, companyName, email, phone, netTerms } = data;
  const net_terms = netTerms ? netTerms : 0;

  if (!(firstName && lastName && companyName && email && phone)) {
    throw new customError({ message: "Missing required fields!", code: 20 });
  }

  const user_id = await get_user_id(req, res);

  const result = await query(`INSERT INTO vendor_table (first_name,last_name,company_name,email,phone,net_terms, created_by) 
  VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`, [firstName, lastName, companyName, email, phone, net_terms, user_id]);

  const new_id = result.rows[0].id;



  try {

    if (connected_customer) {
      const customer_query = await query("SELECT * FROM customer_table WHERE company_name = $1", [connected_customer]);
      const new_customer_id = customer_query.rows[0].id;

      const create_vendor_customer_query: IChainedQueryProps = {
        text: 'INSERT INTO vendor_and_customer (vendor_id, customer_id) VALUES ($1, $2)',
        params: [new_id, new_customer_id]
      }
      queries_list.push(create_vendor_customer_query)
    };


    const create_address = (type: string, address_data: any) => {

      const { vendorAddressName, address1, address2, city, province, postalCode, country } = address_data;
      const address_query: IChainedQueryProps = {
        text: `
        INSERT INTO vendor_addresses
        (vendor_id,
          address, 
          street_address_line1, 
          street_address_line2,
          city,
          province,
          postal,
          country,
          vendor_address_name)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        params: [new_id, type, address1, address2, city, province, postalCode, country, vendorAddressName]
      };

      queries_list.push(address_query)
    }

    if (data.shipping) {
      create_address('Shipping', data.shipping)
    };
    if (data.billing) {
      create_address('Billing', data.billing)
    };



    await chained_query(queries_list)
  } catch (err: any) {
    await query('DELETE FROM vendor_table WHERE id = $1', [new_id])
    // res.status(300).json({message:'debugging', data})
    throw new customError({ message: 'Failed Database Operation', code: 20 })

  }

  res.status(200).json({ message: "Successfully created vendor" });

};

export const update_vendor = async (req: Request, res: Response) => {
  const data = req.body

  const connected_customer = data.connectCustomer ? data.connectCustomer : '';
  const queries_list = [] as { text: string; params: any[] }[];

  const { vendorId, firstName, lastName, companyName, email, phone, netTerms } = data;
  const net_terms = netTerms ? netTerms : 0;

  if (!(vendorId && firstName && lastName && companyName && email && phone)) {
    throw new customError({ message: "Missing required fields!", code: 20 });
  }

  const create_or_update_address = async (type: string, address_data: any) => {

    const { vendorAddressName, address1, address2, city, province, postalCode, country } = address_data;

    // Have to check if shipping or billing already exists. This decides on the user's edit whether we create, read, update, or delete
    const address_query: any = await query(
      "SELECT * FROM vendor_addresses WHERE vendor_id = $1 AND address = $2"
      , [data.id, type]);

    const address = address_query.rows[0];
    if (address && address.address) {
      // update
      const { id } = address;

      const update_address_query: IChainedQueryProps = {
        text: `
          UPDATE vendor_addresses SET
            vendor_id = $2,
            vendor_address_name = $10,
            address = $3,
            street_address_line1 = $4,
            street_address_line2 = $5,
            city = $6,
            province = $7,
            postal = $8,
            country = $9
          WHERE id = $1`,
        params: [id, data.vendorId, type, address1, address2, city, province, postalCode, country, vendorAddressName]
      };
      queries_list.push(update_address_query);

    } else if (!address || !address.address) {
      // create
      const create_address_query: IChainedQueryProps = {
        text: `
          INSERT INTO vendor_addresses 
          (vendor_id,
            address, 
            street_address_line1, 
            street_address_line2,
            city,
            province,
            postal,
            country,
            vendor_address_name)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9 )`,
        params: [data.vendorId, type, address1, address2, city, province, postalCode, country, vendorAddressName]
      }

      queries_list.push(create_address_query);
    }
  };

  if (data.shipping) {
    await create_or_update_address('Shipping', data.shipping);
  } else if (!data.shipping) {
    // delete
    const delete_shipping_query: IChainedQueryProps = {
      text: `DELETE FROM vendor_addresses WHERE vendor_id = $1 AND address = $2`,
      params: [vendorId, 'Shipping']
    };
    queries_list.push(delete_shipping_query);
  };
  if (data.billing) {
    await create_or_update_address('Billing', data.billing);

  } else if (!data.billing) {
    //delete
    const delete_billing_query: IChainedQueryProps = {
      text: `DELETE FROM vendor_addresses WHERE vendor_id = $1 AND address = $2`,
      params: [vendorId, 'Billing']
    };
    queries_list.push(delete_billing_query);
  };

  //update (this is just basically delete old one and create new one)
  const delete_vendor_customer_query: IChainedQueryProps = {
    text: `DELETE FROM vendor_and_customer WHERE vendor_id = $1`,
    params: [vendorId]
  };

  queries_list.push(delete_vendor_customer_query);

  if (connected_customer) { // only create new one if we have a passed in customer

    const customer_query = await query("SELECT * FROM customer_table WHERE company_name = $1", [connected_customer]);
    const new_customer_id = customer_query.rows[0].id;

    const create_vendor_customer_query: IChainedQueryProps = {
      text: 'INSERT INTO vendor_and_customer (vendor_id, customer_id) VALUES ($1, $2)',
      params: [vendorId, new_customer_id]
    }
    queries_list.push(create_vendor_customer_query)
  };

  const vendor_query = {
    text:
      `UPDATE vendor_table SET
        first_name = $2,
        last_name = $3,
        company_name = $4,
        email = $5,
        phone = $6,
        net_terms = $7
      WHERE id = $1`,
    params: [vendorId, firstName, lastName, companyName, email, phone, net_terms]
  };

  queries_list.push(vendor_query)


  await chained_query(queries_list)


  res.status(200).json({ message: "Successfully updated vendor" });
};



export const delete_vendor = async (req: Request, res: Response) => {
  const data = req.body;
  const delete_purchase_order_query = {
    text: "DELETE FROM purchase_orders WHERE vendor_id = $1",
    params: [data.vendor_id]
  };

  const delete_unique_products_query = {
    text: "DELETE FROM unique_products_table WHERE vendor_id = $1",
    params: [data.vendor_id]
  };

  const delete_vendor_query = {
    text: "DELETE FROM vendor_table WHERE id = $1",
    params: [data.vendor_id]
  };

  await chained_query([delete_purchase_order_query, delete_unique_products_query, delete_vendor_query]);
  res.status(200).json({ message: "Deleted vendor" })

};

export const delete_multiple_vendors = async (req: Request, res: Response) => {
  const delete_ids = req.body;

  const queries_list = [];


  for (const id of delete_ids) {

    const delete_purchase_order_query = {
      text: "DELETE FROM purchase_orders WHERE vendor_id = $1",
      params: [id]
    };

    const delete_unique_products_query = {
      text: "DELETE FROM unique_products_table WHERE vendor_id = $1",
      params: [id]
    };

    const delete_vendor_query = {
      text: "DELETE FROM vendor_table WHERE id = $1",
      params: [id]
    };

    queries_list.push(delete_purchase_order_query, delete_unique_products_query, delete_vendor_query)
  }

  await chained_query(queries_list);
  res.status(200).json({message: 'Vendor(s) successfully deleted'});

}