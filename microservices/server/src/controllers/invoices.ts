import { Request, Response } from "express";
import { query } from "../db";
import customError from "../utils/customError";
import _ from "lodash";

interface IGetRequestHeaders {
  id?: number;
  pagesize: number;
  pageindex: number;
  searchquery: string;
}

export const get_invoice = async (req: Request, res: Response) => {
  // retrieve invoices based on customer id.
  let count_query;
  let invoice_query;

  const { id, pagesize, pageindex, searchquery } = req.headers as unknown as IGetRequestHeaders;
  const offset: number = Number(pageindex) * Number(pagesize);

  const filters = JSON.parse(searchquery)
  const { date, input1, searchQuery } = filters;

  if (_.isEmpty(filters) || Object.values(filters).every(value => !value)) {
    invoice_query = await query("SELECT * FROM invoice_orders WHERE customer_id = $1 ORDER BY invoice_id LIMIT $2 OFFSET $3", [id, pagesize, offset]);
    count_query = await query("SELECT COUNT(*) FROM invoice_orders WHERE customer_id = $1", [id]);
  } else {

    const filterConditions = [];
    const queryParams = [id];

    // Add filter conditions dynamically based on the provided filters
    if (date) {
      filterConditions.push(`DATE(invoice_date) = $${queryParams.length + 1}`);
      queryParams.push(date);
    }
    if (searchQuery) {
      filterConditions.push(
        `(reference_number::text ILIKE '%' || $${queryParams.length + 1} || '%' OR amount_due::text ILIKE '%' || $${queryParams.length + 1} 
        || '%' OR order_status::text ILIKE '%' || $${queryParams.length + 1} || '%')`
      );
      queryParams.push(searchQuery);
    }

    // Construct the WHERE clause based on filter conditions
    const whereClause = filterConditions.length > 0 ? `WHERE customer_id = $1 AND ${filterConditions.join(' AND ')}` : '';

    // Execute the query to get invoices with pagination
    invoice_query = await query(` SELECT * FROM invoice_orders ${whereClause} LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2} `
      , queryParams.concat([pagesize, offset]));

    // Execute the query to get total count of invoices without pagination
    count_query = await query(` SELECT COUNT(*) AS count FROM invoice_orders ${whereClause}`, queryParams);
  }

  const totalCount: any = count_query.rows[0] ? count_query.rows[0].count : null;


  const data = {
    invoices: invoice_query.rows,
    pageindex,
    pagesize,
    offset,
    totalCount,
  }


  res.status(200).json({ message: 'Invoice successfully retrieved', data });
};

export const get_all_invoices = async (req: Request, res: Response) => {

  const { pagesize, pageindex, searchquery } = req.headers as unknown as IGetRequestHeaders;
  const offset: number = Number(pageindex) * Number(pagesize);

  let count_query;
  let invoice_query;

  const filters = JSON.parse(searchquery)
  const { date, input1, searchQuery } = filters;

  if (_.isEmpty(filters) || Object.values(filters).every(value => !value)) { // No filters or all filters are falsey values
    invoice_query = await query("SELECT * FROM invoice_orders LIMIT $1 OFFSET $2", [pagesize, offset]);
    count_query = await query("SELECT COUNT(*) FROM invoice_orders");
  } else {

    const filterConditions = [];
    const queryParams = [];

    // Add filter conditions dynamically based on the provided filters
    if (date) {
      filterConditions.push(`DATE(invoice_date) = $${queryParams.length + 1}`);
      queryParams.push(date);
    }
    if (input1) { // customer search
      const customer_id_query = await query("SELECT id FROM customer_table WHERE company_name ILIKE '%' || $1 || '%'", [input1]);
      const customer_id = customer_id_query.rows[0].id;
      if (customer_id) {
        filterConditions.push(`customer_id = $${queryParams.length + 1}`);
        queryParams.push(customer_id);
      }
    }
    if (searchQuery) {
      filterConditions.push(
        `(invoice_id::text ILIKE '%' || $${queryParams.length + 1} || '%' OR amount_due::text ILIKE '%' || $${queryParams.length + 1} 
        || '%' OR order_status::text ILIKE '%' || $${queryParams.length + 1} || '%')`
      );
      queryParams.push(searchQuery);
    }

    // Construct the WHERE clause based on filter conditions
    const whereClause = filterConditions.length > 0 ? `WHERE ${filterConditions.join(' AND ')}` : '';

    // Execute the query to get invoices with pagination
    invoice_query = await query(` SELECT * FROM invoice_orders ${whereClause} LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2} `
      , queryParams.concat([pagesize, offset]));

    // Execute the query to get total count of invoices without pagination
    count_query = await query(` SELECT COUNT(*) AS count FROM invoice_orders ${whereClause}`, queryParams);

  }

  const invoices = invoice_query.rows

  for (let i = 0; i < invoice_query.rows.length; i++) {
    const customer_id = invoices[i].customer_id;
    const company_name_data = await query(`SELECT company_name FROM customer_table WHERE id = $1`, [customer_id]);

    invoices[i].company_name = company_name_data.rows[0].company_name;
  }
  const totalCount: any = count_query.rows[0] ? count_query.rows[0].count : null;
  const data = {
    invoices,
    pageindex,
    pagesize,
    offset,
    totalCount,
  }


  res.status(200).json({ message: 'Invoices successfully retrieved', data });


}