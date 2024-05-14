import { Request, Response } from "express";
import { query, chained_query } from "../db";

interface IGetListRequestHeaders {
  pageindex: number;
  pagesize: number;
  searchquery: string;
};

export const get_all_purchase_orders = async (req: Request, res: Response) => {

  const { pageindex, pagesize, searchquery } = req.headers as unknown as IGetListRequestHeaders;
  const offset: number = Number(pageindex) * Number(pagesize);

  let purchase_orders_query;
  let count_query;

  if (!searchquery) {
    purchase_orders_query = await query("SELECT * FROM purchase_orders ORDER BY purchase_id LIMIT $1 OFFSET $2", [pagesize, offset]);
    count_query = await query("SELECT COUNT(*) FROM purchase_orders");
  } else {
    const [firstName, lastName] = searchquery.split(" ");

    //!!! This does not support search by vendor_id

    purchase_orders_query = await query(`
        WITH filtered_rows AS (
            SELECT
              purchase_id,
              amount,
              first_name,
              last_name,
              company_name,
              phone
            FROM
              purchase_orders
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
    count_query = purchase_orders_query
  }

  const totalCount: any = count_query.rows[0] ? count_query.rows[0].count : null;

  const purchases = purchase_orders_query.rows

  for (let i = 0; i < purchase_orders_query.rows.length; i++) {
    const vendor_id = purchases[i].vendor_id;
    const vendor_name = await query(`SELECT company_name FROM vendor_table WHERE id = $1`, [vendor_id]);

    purchases[i].vendor_name = vendor_name.rows[0].company_name;
  }

  res.status(200).json({
    pageindex,
    pagesize,
    offset,
    searchquery,
    total: totalCount,
    purchases
  });
}