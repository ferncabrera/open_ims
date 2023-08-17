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

  // using the email, find the user in the database
  const userEmail = await query("SELECT * FROM user_table WHERE email = $1", [
    email,
  ]);

  const user = userEmail.rows[0];
  if (!user) {
    throw new customError({ message: "Email does not exist", code: 10 });
  }

  const secret = process.env.JWT_SECRET_KEY_FORGOT;
  const expirationDate = Math.floor(Date.now() / 1000) + 60 * 10; // expiration is 10 minutes
  const token = jwt.sign(
    { exp: expirationDate, email: user.email, permission: user.permission },
    `${secret}`
  );
  // res.cookie("authToken", token, { httpOnly: true, secure: true });

  // Configure API key authorization: api-key
  // const key = process.env.BREVO_API_KEY;
  // console.log('this is the key: ', key);

  defaultClient.authentications["api-key"].apiKey = process.env.BREVO_API_KEY;
  var resetLink = `http://localhost/reset-password?token=${encodeURIComponent(token)}`;
  var apiInstance = new Brevo.TransactionalEmailsApi();
  // const emailTemplate = `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`;
  // const emailContent = emailTemplate.replace("%RESET_LINK%", resetLink);
  const emailTemplate = `
  <!DOCTYPE html>
<html>
<head>
  <title>Password Reset</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #ffffff;
      border-radius: 5px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    }
    h1 {
      color: #333333;
    }
    p {
      color: #777777;
    }
    a {
      color: #007bff;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Password Reset</h1>
    <p>You've requested to reset your password. Click the link below to proceed:</p>
    <p>Click <a href="${resetLink}">here</a> to reset your password.</p>
    <p>If you didn't request this reset, you can ignore this email.</p>
    <p>Best regards,<br>Your Website Team</p>
  </div>
</body>
</html>  
  `;

  var sendSmtpEmail = new Brevo.SendSmtpEmail(); // SendSmtpEmail | Values to send a transactional email
  sendSmtpEmail.to = [
    { email: "joseph_fanous@hotmail.com", name: "Joseph Fanous" },
  ];
  sendSmtpEmail.sender = {
    email: "joseph.fanous.01@gmail.com",
    name: "Joseph Fanous",
  };
  sendSmtpEmail.subject = "Reset Password";
  // sendSmtpEmail.templateId = 2;
  // sendSmtpEmail.params = { RESET_LINK: resetLink };
  sendSmtpEmail.htmlContent = emailTemplate;

  apiInstance
    .sendTransacEmail(sendSmtpEmail)
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
