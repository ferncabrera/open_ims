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
  var resetLink = `http://localhost/forgot_pass?token=${encodeURIComponent(
    token
  )}`;
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

export const update_password = async (req: Request, res: Response) => {
  const { password, token } = req.body;
  console.log("hit the update password route");
  //using the jwt token we passed in the url above, we can decode it and get the user's email
  const secret2 = process.env.JWT_SECRET_KEY_FORGOT;
  // const token2 = req.query.token;
  const decoded = jwt.verify(token as string, `${secret2}`) as any;
  const userEmail = decoded.email;
  console.log("this is the decoded email: ", userEmail);
  // using the email, find the user in the database
  // this format makes it less susceptible to SQL injection (directly injecting into the query)
  const userQuery = await query("SELECT * FROM user_table WHERE email = $1", [
    userEmail,
  ]);
  const user = userQuery.rows[0];
  console.log("this is the user: ", user);
  if (!user) {
    throw new customError({ message: "Something went wrong", code: 10 });
  }
  const validPassword = await bcrypt.compare(password, user.password);
  if (validPassword) {
    throw new customError({
      message: "New password has to be different from your old password",
      code: 101,
    });
  }
  const salt = await bcrypt.genSalt();
  const hash = await bcrypt.hash(password, salt);

  await query("UPDATE user_table SET password = $1 WHERE email = $2", [
    hash,
    userEmail,
  ]);
  //password should be updated
  res.json({ message: "Password successfully updated" });
};

// check if old password is the same as the new password
// if it is, throw an error
export const check_password = async (req: Request, res: Response) => {
  const { password, token } = req.body;
  //using the jwt token we passed in the url above, we can decode it and get the user's email
  const secret2 = process.env.JWT_SECRET_KEY_FORGOT;
  // const token2 = req.query.token;
  const decoded = jwt.verify(token as string, `${secret2}`) as any;
  const userEmail = decoded.email;
  // using the email, find the user in the database
  // this format makes it less susceptible to SQL injection (directly injecting into the query)
  const userQuery = await query("SELECT * FROM user_table WHERE email = $1", [
    userEmail,
  ]);
  const user = userQuery.rows[0];
  console.log("this is the user: ", user);
  if (!user) {
    throw new customError({ message: "Something went wrong", code: 10 });
  }
  //compare passwords
  const validPassword = await bcrypt.compare(password, user.password);

  if (validPassword) {
    res.status(400).json({
      message: "New password has to be different from your old password",
    });
    // throw new customError({
    //   message: "New password has to be different from your old password",
    //   code: 101,
    // });
  } else {
    res.status(200).json({ message: "Lookup complete" });
  }
};
