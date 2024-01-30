import { Request, Response } from "express";
import { query } from "../db";
import customError from "../utils/customError";

interface IGetRequestHeaders {
    id: number;
    pagesize: number;
    pageindex: number;
    searchquery: string;
}

export const get_invoice = async (req: Request, res: Response) => {
    // retrieve invoices based on customer id.
    let count_query;
    let invoice_query;

    const {id, pagesize, pageindex, searchquery} =  req.headers as unknown as IGetRequestHeaders;
    const offset: number = Number(pageindex) * Number(pagesize);

    if (!searchquery) {
        invoice_query = await query("SELECT * FROM invoice_orders WHERE customer_id = $1 ORDER BY invoice_id LIMIT $2 OFFSET $3", [id, pagesize, offset]);
        count_query = await query("SELECT COUNT(*) FROM invoice_orders WHERE customer_id = $1", [id]);
    } else {
        invoice_query = await query(`
            WITH filtered_rows AS (
                SELECT
                  invoice_date,
                  reference_number,
                  amount_due,
                  order_status
                FROM
                  invoice_orders
                WHERE
                  reference_number::text ILIKE '%' || $1 || '%'
                  OR amount_due::text ILIKE '%' || $1 || '%'
                  OR order_status::text ILIKE '%' || $1 || '%'
            ),
            total_count AS (
              SELECT COUNT(*) AS count FROM filtered_rows
            )
            SELECT
              reference_number,
              amount_due,
              order_status,
              invoice_date,
            (SELECT count FROM total_count) AS count
            FROM
              filtered_rows
            LIMIT $2 OFFSET $3

        `, [searchquery, pagesize, offset ]);
        count_query = invoice_query
    }

    const totalCount: any = count_query.rows[0] ? count_query.rows[0].count : null;


    const data = {
        invoices: invoice_query.rows,
        pageindex,
        pagesize,
        offset,
        totalCount,
    }


    res.status(200).json({message: 'Invoice successfully retrieved', data});
};