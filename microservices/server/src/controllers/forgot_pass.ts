// server call for forgot password
import { Request, Response } from 'express';
import { query } from "../db";
import * as jwt from "jsonwebtoken";
import * as bcrypt from "bcrypt";
import customError from '../utils/customeError';


export const forgot_pass = async (req: Request, res: Response) => {

    const{email} = req.body;

    // using the email, find the user in the database
    const userEmail = await query('SELECT * FROM users WHERE email = $1', [email]);
    // if the user does not exist, return an error

    // this format makes it less susceptible to SQL injection (directly injecting into the query)
    const user = userEmail.rows[0];
    if (!user) {
        throw new customError({message: "Email or Password is Incorrect", code:10});
    }

    const secret = process.env.JWT_SECRET_TOKEN;
    const expirationDate = Math.floor(Date.now() / 1000) + (60 * 5) // expiration is 5 minutes
    const token = jwt.sign({exp: expirationDate, email: user.email, permission: user.permission}, `${secret}`);
    res.cookie('authToken', token, {httpOnly: true, secure: true});
    res.json({message:"Success"})
    // if (user.rows.length === 0) {
    //     return res.status(404).json('User not found');
    // } else {
    //     return res.status(200).json('User found');
    // }
    // if the user exists, send an email with a link to reset the password
    // the link should include a token that will expire after 1 hour
    // the token should be saved in the database
    // the token should be deleted after the password is reset


};