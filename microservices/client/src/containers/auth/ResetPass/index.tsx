import styles from "./index.module.scss"; // Import the SCSS module
import { Form, Button, Image, Col } from "react-bootstrap";
import React, { useState, SyntheticEvent, ChangeEvent, useEffect } from "react";
import { IValidate } from "../../../utilities/types/validationTypes";
import { fieldValidation } from "../../../utilities/validation";
import { sendPatchRequest } from "../../../utilities/apiHelpers";
import forgotPassImg from "./../../../assets/public/images/forgotPass.jpg";
import _ from "lodash";
import { Password } from "./pass";

/*
  ! make button work with backend
  // ! make new custom password component
  // ! make text box to display error under both input boxes
  ! make scss work better and page look good
  ! make the image appear behind the form
  ! make sure the error message also shows if the password is different from the old password, I check in the serve call
  ! fix all bugs, such as having to blur the input box to make the password error appear, the error prioritizing one error over another and once that one error is fixed it ignores the other error
  ! remove all console logs once done
  ! make it redirect to login page once password is reset successfully
  ! good luck :')
  */
let trackErrorList = [];
const formData = {};
const initialErrorFieldState = {
  newPassword: null,
  password: null,
};

export const ForgotPass = () => {
  const keyPaths = {
    attributes: "attributes",
    password: "attributes.password",
    newPassword: "attributes.newPassword",
  };
  useEffect(() => {
    _.set(formData, keyPaths.password, "");
    _.set(formData, keyPaths.newPassword, "");
  }, []);

  const [error, setError] = useState<IErrorFields>(initialErrorFieldState);

  const validate = (data: IValidate) => {
    const valid = fieldValidation(data);
    const name = valid.fieldName;
    console.log("name: ", name);
    console.log("valid: ", valid);
    //if the error is "Required" then override the error message
    if (valid.message === "Required") {
      valid.message = "";
    }
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
    // log both passwords
    console.log("New Password:", _.get(formData, keyPaths.newPassword));
    console.log("Password:", _.get(formData, keyPaths.password));

    //check if passwords match and output error if they dont to the ErrorBox component
    if (
      _.get(formData, keyPaths.newPassword) !==
      _.get(formData, keyPaths.password)
    ) {
      console.log("Passwords do not match");
      setError((prevError) => ({
        ...prevError,
        newPassword: {
          valid: false,
          message: "Passwords do not match",
        },
      }));
      return false;
    }
    // Send patch request here
    await sendPatchRequest({
      endpoint: "/api/server/update_password",
      data: { password: _.get(formData, keyPaths.newPassword), token: token },
    });
  };

  const PasswordConfirm = () => {
    return (
      <>
        <Form.Label htmlFor="confirmPassword">Confirm Password:</Form.Label>
        <Form.Control
          id="confirmPassword"
          className={`${styles.password}`}
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
        {/* {error.password?.valid === false && (
          <div className="invalid-feedback">{error.password.message}</div>
        )} */}
      </>
    );
  };
  interface InvalidProp {
    isInvalid?: any;
    errorMessage: string;
    children?: React.ReactNode;
  }

  const ErrorBox: React.FC<InvalidProp> = (props) => {
    // const passwordMismatchError = "Passwords do not match";
    // return (
    //   <>
    //     {props.isInvalid && (
    //       <div data-testid="password-error" className="invalid">
    //         <div className="invalid-feedback">
    //           {props.errorMessage}
    //           {props.children} {/* Display additional error messages */}
    //         </div>
    //         {props.errorMessage === passwordMismatchError && (
    //           <div className="invalid-feedback">{passwordMismatchError}</div>
    //         )}
    //       </div>
    //     )}
    //   </>
    // );
    return (
      <>
        {props.isInvalid && (
          <>
            <div data-testid="password-error" className="invalid">
              {props.errorMessage ? (
                <div className="invalid-feedback">{props.errorMessage} </div>
              ) : (
                <>
                  <p
                    className="mb-0 invalid-feedback"
                    style={{ fontSize: "14px" }}
                  >
                    Password does not meet password requirements:
                  </p>
                  <ul className="invalid" style={{ fontSize: "14px" }}>
                    <li>must contain 8 to 64 characters.</li>
                    <li>
                      must include one lowercase letter, one uppercase letter,
                      one number, and one special character.
                    </li>
                  </ul>
                </>
              )}
            </div>
          </>
        )}
      </>
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
        <div className="mt-5">
          <Button type="submit">Update Password</Button>
        </div>
        <ErrorBox
          isInvalid={error.newPassword?.valid === false}
          errorMessage={_.get(error, "newPassword.message", "")}
        />
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
