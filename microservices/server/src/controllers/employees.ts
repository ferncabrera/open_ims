import { Request, Response } from "express";
import { query } from "../db";
import _ from "lodash";

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

export const get_all_employees = async (req: Request, res: Response) => {

  const employee_query = await query("SELECT * FROM employee_table");
  const user_query = await query("SELECT * FROM user_table");

  const employees = employee_query.rows;
  const users = user_query.rows;

  const indexed_users = _.reduce(users, (accumulator: any, current) => {
    accumulator[current.id] = current;

    return accumulator
  }, {});

  const employees_full_data = _.map(employees, (employee) => {
    const id = employee.emp_id;
    const corresponding_user_data = indexed_users[id]

    const full_name = `${corresponding_user_data.first_name} ${corresponding_user_data.last_name}`

    return {fullName: full_name, ...employee}

  } );

  res.status(200).json({message: "Successfully got employee data", data: employees_full_data})

}