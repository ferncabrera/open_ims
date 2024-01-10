import { Request, Response } from "express";
import { query } from "../db";
import customError from "../utils/customError";

interface IGetRequestHeaders {
    pageindex: number;
    pagesize: number;
    searchquery: string;
}

export const get_customers = async (req: Request, res: Response) => {

    const { pageindex, pagesize, searchquery } = req.headers as unknown as IGetRequestHeaders;
    const offset: number = Number(pageindex) * Number(pagesize);
    // !!! should look into sanitizing this.

    let customers_query;
    let count_query

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