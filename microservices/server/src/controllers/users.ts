import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { query } from "../db";
import customError from "../utils/customError";
import * as jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

interface token {
    email: string;
    first_name: string;
    permission: string;
    iat: number;
}

interface IGetRequestHeaders {
    id?: number;
    pagesize: number;
    pageindex: number;
    searchquery: string;
  }

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    // this format makes it less susceptible to SQL injection (directly injecting into the query)
    const userQuery = await query("SELECT * FROM user_table WHERE email = $1", [email]);
    const user = userQuery.rows[0];
    if (!user) {
        throw new customError({ message: "Email or Password is Incorrect", code: 10 });
    }
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
        throw new customError({ message: "Email or Password is incorrect", code: 10 });
    }

    const secret = process.env.JWT_SECRET_KEY;
    const currentDate = new Date();
    const expirationDate = new Date(currentDate.getTime() + 3.6e6); //expires in 60 minutes

    const token = jwt.sign({ email: user.email, first_name: user.first_name, permission: user.permission }, `${secret}`);
    res.cookie('authToken', token, { httpOnly: false, secure: false, expires: expirationDate });
    res.json({ message: "Success", token: token });
}

export const register = async (req: Request, res: Response) => {
    const { firstName, lastName, email, newPassword } = req.body;
    // we need validations here!!!!

    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(newPassword, salt);

    // Now we just need to store this information.
    const values = [firstName, lastName, email, hash];
    await query("INSERT INTO user_table(first_name, last_name, email, password) VALUES($1, $2, $3, $4)", values);
    // User created!

    res.status(201).json({ message: "registration successful!" });


}

export const isAuthenticated = async (req: Request, res: Response) => {

    // TODO: later we can make permission checks in this API as well.
    // Adding it as a note here for later ^^
    const userCookie = req.cookies.authToken;
    if (!userCookie) {
        res.status(401).json({ authenticated: false });
    } else {
        const secret: any = process.env.JWT_SECRET_KEY;
        const tokenData: token = jwt.verify(userCookie, secret) as token
        const permission = tokenData.permission;
        const first_name = tokenData.first_name;
        const email = tokenData.email;
        res.status(200).json({ authenticated: true, permission, firstName: first_name, email});
    }
}

export const get_user_id = async (req: Request, res: Response) => {
    const userCookie = req.cookies.authToken;
    if (!userCookie) {
        throw new customError({message: 'No authorized user', code:30})
    } else {
        const secret: any = process.env.JWT_SECRET_KEY;
        const tokenData: token = jwt.verify(userCookie, secret) as token;
        const email = tokenData.email;

        const response = await query("SELECT id FROM user_table WHERE email = $1", [email])
        const user_id = response.rows[0].id
        return user_id
    }
};

export const get_all_users = async ( req: Request, res: Response) => {
    const { pagesize, pageindex, searchquery } = req.headers as unknown as IGetRequestHeaders;
  const offset: number = Number(pageindex) * Number(pagesize);

  let count_query;
  let user_query;

  if (!searchquery) {
    user_query = await query("SELECT * FROM user_table LIMIT $1 OFFSET $2", [pagesize, offset]);
    count_query = await query("SELECT COUNT(*) FROM user_table");
  } else {
    user_query = await query(`
            WITH filtered_rows AS (
                SELECT
                  invoice_date,
                  reference_number,
                  amount_due,
                  order_status
                FROM
                  user_table
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

        `, [searchquery, pagesize, offset]);
    count_query = user_query
  }

  const users = user_query.rows


  const totalCount: any = count_query.rows[0] ? count_query.rows[0].count : null;
  const data = {
    users,
    pageindex,
    pagesize,
    offset,
    totalCount,
  }


  res.status(200).json({ message: 'Users successfully retrieved', ...data });
}