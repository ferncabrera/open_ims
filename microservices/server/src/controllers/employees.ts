import { Request, Response } from "express";
import { query } from "../db";

interface IGetRequestHeaders {
  id?: number;
  pagesize: number;
  pageindex: number;
  searchquery: string;
}

export const get_employees = async (req: Request, res: Response) => {

  let employee_query;
  let count_query;

  const { id, pagesize, pageindex, searchquery } = req.headers as unknown as IGetRequestHeaders;
  const offset: number = Number(pageindex) * Number(pagesize);

  if (!searchquery) {
    employee_query = await query("SELECT * FROM employee_table LIMIT $1 OFFSET $2", [pagesize, offset]);
    count_query = await query("SELECT COUNT(*) FROM employee_table");
  } else {
    employee_query = await query(`
            WITH filtered_rows AS (
                SELECT
                  emp_sin,
                  emp_hourly_rate,
                  emp_comission,
                  emp_address,
                FROM
                  employee_table
                  WHERE
                  id::text ILIKE '%' || $1 || '%'
                  OR emp_sin ILIKE '%' || $1 || '%'
                  OR emp_hourly_rate ILIKE '%' || $1 || '%'
                  OR emp_comission ILIKE '%' || $1 || '%'
                  OR emp_address ILIKE '%' || $1 || '%'
              ),
            total_count AS (
              SELECT COUNT(*) AS count FROM filtered_rows
            )
            SELECT
              emp_sin,
              emp_hourly_rate,
              emp_comission,
              emp_address,
            (SELECT count FROM total_count) AS count
            FROM
              filtered_rows
            LIMIT $2 OFFSET $3

        `, [searchquery, pagesize, offset]);
    count_query = employee_query
  }
  const totalCount: any = count_query.rows[0] ? count_query.rows[0].count : null;

  res.status(200).json({
    pageindex,
    pagesize,
    offset,
    searchquery,
    total: totalCount,
    employees: employee_query.rows
  });
}