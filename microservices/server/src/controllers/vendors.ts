import { Request, Response } from "express";
import { query } from "../db";

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

  if (!searchquery) {
    vendors_query = await query("SELECT * FROM vendor_table ORDER BY id LIMIT $1 OFFSET $2", [pagesize, offset]);
    count_query = await query("SELECT COUNT(*) FROM vendor_table");
  } else {
    const [firstName, lastName] = searchquery.split(" ");

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
        `, [searchquery, pagesize, offset, firstName, lastName]);
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