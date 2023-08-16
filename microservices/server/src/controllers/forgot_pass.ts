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
  // const key = process.env.BREVO_API_KEY;
  // console.log('this is the key: ', key);

  defaultClient.authentications["api-key"].apiKey = process.env.BREVO_API_KEY;
  var resetLink  = "http://localhost/reset-password?token=your_reset_token_here";
  var apiInstance = new Brevo.TransactionalEmailsApi();
  const emailTemplate = `<p>Click <a href="{reset_link}">here</a> to reset your password.</p>`;
  const emailContent = emailTemplate.replace("%RESET_LINK%", resetLink);

  
  var sendSmtpEmail = new Brevo.SendSmtpEmail(); // SendSmtpEmail | Values to send a transactional email
  sendSmtpEmail.to = [{ email: "joseph_fanous@hotmail.com", name: "John Doe" }];
  sendSmtpEmail.templateId = 1;
  sendSmtpEmail.params = { RESET_LINK: emailContent };

  apiInstance.sendTransacEmail(sendSmtpEmail)
  .then((response: any) => {
    console.log("Email sent:", response);
    res.json({ message: "Success" });
  })
  .catch((error: any) => {
    console.error("Error sending email:", error);
  });

  // apiInstance.sendTransacEmail(sendSmtpEmail).then(
  //   function (data: any) {
  //     console.log("API called successfully. Returned data: " + data.messageId);
  //     res.json({ message: "Success" });
  //   },
  //   function (error: any) {
  //     console.error(error);
  //   }
  // );

};
