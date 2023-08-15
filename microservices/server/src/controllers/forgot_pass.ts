// server call for forgot password
import { Request, Response } from "express";
import { query } from "../db";
import * as jwt from "jsonwebtoken";
import * as bcrypt from "bcrypt";
import customError from "../utils/customeError";

var Brevo = require("@getbrevo/brevo");
var defaultClient = Brevo.ApiClient.instance;

export const forgot_pass = async (req: Request, res: Response) => {
  const { email } = req.body;
  // console.log("this is the api call: ", email);
  // res.json({"this is the api call: ": email})

  // using the email, find the user in the database
  const userEmail = await query("SELECT * FROM user_table WHERE email = $1", [
    email,
  ]);

  const user = userEmail.rows[0];
  if (!user) {
    throw new customError({ message: "Email does not exist", code: 10 });
  }

  // const secret = process.env.JWT_SECRET_TOKEN;
  // const expirationDate = Math.floor(Date.now() / 1000) + 60 * 10; // expiration is 10 minutes
  // const token = jwt.sign(
  //   { exp: expirationDate, email: user.email, permission: user.permission },
  //   `${secret}`
  // );
  // res.cookie("authToken", token, { httpOnly: true, secure: true });

  // Configure API key authorization: api-key
  var apiKey = defaultClient.authentications["api-key"];
  apiKey.apiKey = "key will go in .env file next push";
  // Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
  // apiKey.apiKeyPrefix["api-key"] = "Token";

  var apiInstance = new Brevo.TransactionalEmailsApi();

  var sendSmtpEmail = new Brevo.SendSmtpEmail(); // SendSmtpEmail | Values to send a transactional email
  sendSmtpEmail.to = [{ email: "joseph_fanous@hotmail.com", name: "John Doe" }];
  sendSmtpEmail.templateId = 1;
  apiInstance.sendTransacEmail(sendSmtpEmail).then(
    function (data: any) {
      console.log("API called successfully. Returned data: " + data.messageId);
      res.json({ message: "Success" });
    },
    function (error: any) {
      console.error(error);
    }
  );

  // api.getAccount().then(
  //   function (data: any) {
  //     res.json({ message: "Success" + data. });
  //     // console.log("API called successfully. Returned data: " + data);
  //   },
  //   function (error: any) {
  //     console.error(error);
  //   }
  // );
};
