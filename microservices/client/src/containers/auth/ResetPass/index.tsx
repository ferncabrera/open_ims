import styles from "./index.module.scss"; // Import the SCSS module
import { Form, Button, Image, Col, InputGroup } from "react-bootstrap";
import { Password } from "../../../components/forms/Password";
import React, { useState, SyntheticEvent, ChangeEvent, useEffect } from "react";
import { MdOutlineVisibilityOff, MdOutlineVisibility } from "react-icons/md";
import { IValidate } from "../../../utilities/types/validationTypes";
import { fieldValidation } from "../../../utilities/validation";
import { sendPatchRequest } from "../../../utilities/apiHelpers";
import forgotPassImg from "./../../../assets/public/images/forgotPass.jpg";
import _ from "lodash";

export const ForgotPass = () => {
  let trackErrorList = [];
  const [resetPassword, setPassword] = useState("");
  const [resetPasswordConfirm, setPasswordConfirm] = useState("");

  const formData = {};
  const keyPaths = {
    attributes: "attributes",
    password: "attributes.password",
    newPassword: "attributes.newPassword",
  };
  useEffect(() => {
    _.set(formData, keyPaths.password, "");
    _.set(formData, keyPaths.newPassword, "");
  }, []);

  const initialErrorFieldState = {
    newPassword: null,
    password: null,
  };

  const [error, setError] = useState<IErrorFields>(initialErrorFieldState);
  const validate = (data: IValidate) => {
    const valid = fieldValidation(data);
    const name = valid.fieldName;

    if (!valid.isValid) {
      setError((prevError) => ({
        ...prevError,
        [name]: { valid: valid.isValid, message: valid.message },
      }));
    } else {
      setError((prevError) => ({ ...prevError, [name]: null }));
    }
    return valid.isValid;
  };

  const handlePasswordReset = async (e: SyntheticEvent) => {
    e.preventDefault();
    if (_.some(trackErrorList, (validEntity) => validEntity === false)) {
      trackErrorList = [];
      return;
    }
    // console.log("Password: ", resetPassword);

    //get token from current url, decode it and send it to server
    //server will authenticate user and update password
    const urlSearchParams = new URLSearchParams(window.location.search);
    const token = urlSearchParams.get("token");

    if (!token) {
      // Token not found, handle the error or redirect
      console.log("Token not found");
      // return;
    }

    // if (resetPassword !== resetPasswordConfirm) {
    //   setError((prevError) => ({
    //     ...prevError,
    //     password: {
    //       valid: false,
    //       message: "Passwords do not match",
    //     },
    //   }));
    //   return;
    // }
    // Send post request here
    await sendPatchRequest({
      endpoint: "/api/server/update_password",
      data: { password: resetPassword, token: token },
    });
  };

  const PasswordConfirm = () => {
    return (
      <div className="mt-3" style={{ marginBottom: "20px" }}>
        <Form.Label htmlFor="confirmPassword">Confirm Password:</Form.Label>
        <Form.Control
          id="confirmPassword"
          className={`${styles["input-field"]} ${
            error.password?.valid === false ? styles["password_invalid"] : ""
          }`}
          type="password"
          onChange={(e) => {
            _.set(formData, keyPaths.password, e.target.value);
          }}
          isInvalid={error.password?.valid === false}
          onBlur={(data: SyntheticEvent) => {
            const target = data.target as HTMLTextAreaElement;
            const { value, name, required } = target;
            validate({ value, name, required });
          }}
          required
        />
        {error.password?.valid === false && (
          <div className="invalid-feedback">{error.password.message}</div>
        )}
      </div>
    );
  };

  return (
    <div className={`${styles.overlay} ${styles["forgot-pass-container"]}`}>
      <div className={styles.title}>Create New Password</div>
      <div className={styles.subtitle}>
        Your new password must be different from your previously used passwords.
      </div>
      <Form noValidate onSubmit={handlePasswordReset}>
        <Password
          required
          newPassword
          isInvalid={error.newPassword?.valid === false}
          onChange={(e) => {
            _.set(formData, keyPaths.newPassword, e.target.value);
          }}
          onBlur={(data) => {
            const target = data.target as HTMLTextAreaElement;
            const { value, name, required } = target;
            validate({ value, name, required });
          }}
          errorMessage={_.get(error, "newPassword.message", "")}
        />
        {PasswordConfirm()}
        {/* <div className={styles["input-container"]}>
          <label htmlFor="confirmPassword">Confirm Password:</label>
          <input
            type={showConfirmPassword ? "text" : "password"}
            id="confirmPassword"
            className={styles["input-field"]}
            placeholder="Confirm your password"
          />
        </div> */}
        <div className="mt-5">
          <Button type="submit">Update Password</Button>
        </div>
        {/* <Col
          xs={6}
          md={6}
          lg={6}
          xl={7}
          className={styles.auth_image_container}
        >
          <Image className={styles.auth_image} src={forgotPassImg} />
        </Col> */}
      </Form>
    </div>
  );
};
