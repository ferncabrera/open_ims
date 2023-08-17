import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { query } from "../db";
import customError from "../utils/customError";
import * as jwt from "jsonwebtoken";

export const login = async (req: Request, res: Response) => {
    const {email, password} = req.body;

    // this format makes it less susceptible to SQL injection (directly injecting into the query)
    const userQuery = await query("SELECT * FROM user_table WHERE email = $1", [email]);
    const user = userQuery.rows[0];
    if (!user) {
        throw new customError({message: "Email or Password is Incorrect", code:10});
    }
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
        throw new customError({message: "Email or Password is incorrect", code:10});
    }

    const secret = process.env.JWT_SECRET_TOKEN;
    const expirationDate = Math.floor(Date.now() / 1000) + (60 * 5) // expiration is 5 minutes
    const token = jwt.sign({exp: expirationDate, email: user.email, permission: user.permission}, `${secret}`);
    res.cookie('authToken', token, {httpOnly: false, secure: false});
    res.json({message:"Success", token:token})
}

export const register = async (req: Request, res: Response) => {
    const {firstName, lastName, email, newPassword} = req.body;
    // we need validations here!!!!

    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(newPassword, salt);

    // Now we just need to store this information.
    const values = [firstName, lastName, email, hash];
    await query("INSERT INTO user_table(first_name, last_name, email, password) VALUES($1, $2, $3, $4)", values);
    // User created!

    res.json({message: "registration successful!"});


}