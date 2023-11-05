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
    console.log('this is our secret', secret)
    const currentDate = new Date();
    const expirationDate = new Date(currentDate.getTime() + 300000); //expires in 5 minutes

    const token = jwt.sign({ email: user.email, first_name: user.first_name, permission: user.permission }, `${secret}`);
    res.cookie('authToken', token, { httpOnly: false, secure: false, expires: expirationDate });
    res.json({ message: "Success", token: token })
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

    res.json({ message: "registration successful!" });


}

export const isAuthenticated = async (req: Request, res: Response) => {

    // later we can make permission checks in this API as well.
    // Adding it as a note here for later ^^
    const userCookie = req.cookies.authToken;
    if (!userCookie) {
        res.status(401).json({ authenticated: false });
    } else {
        const secret: any = process.env.JWT_SECRET_KEY; // We need to check our keys here, they are not working!!
        const tokenData: token = jwt.verify(userCookie, secret) as token
        const permission = tokenData.permission;
        const first_name = tokenData.first_name;
        res.status(200).json({ authenticated: true, permission, firstName: first_name});
    }
}