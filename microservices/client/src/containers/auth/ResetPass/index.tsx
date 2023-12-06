import styles from "./index.module.scss";
import { Form, Button, Image, Col } from "react-bootstrap";
import React, { useState, SyntheticEvent, ChangeEvent, useEffect } from "react";
import { IValidate } from "../../../utilities/types/validationTypes";
import { fieldValidation } from "../../../utilities/validation";
import {
  sendPatchRequest,
  sendPostRequest,
} from "../../../utilities/apiHelpers";
import forgotPassImg from "./../../../assets/public/images/forgotPass.jpg";
import _ from "lodash";
import { Password } from "./pass";
import { MdOutlineCheckCircleOutline } from "react-icons/md";
import { useParams, useNavigate } from "react-router";

interface InvalidProp {
  isInvalid?: any;
  errorMessage: string;
  children?: React.ReactNode;
}

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

  const { token } = useParams();
  const navigate = useNavigate();

  const [passwordUpdated, setPasswordUpdated] = useState(false);
  const [error, setError] = useState<IErrorFields>(initialErrorFieldState);
  const [isTokenValid, setIsTokenValid] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate('/')
    } else {
      validateToken(token)
    }
  })

  useEffect(() => {
    _.set(formData, keyPaths.password, "");
    _.set(formData, keyPaths.newPassword, "");
  }, []);

  let validateNewPassword = false;
  let validatePassword = false;

  const validateToken = async (token) => {
    const isValid: any = await sendPostRequest({ endpoint: '/api/server/validate_token', data: { token } });
    if (isValid.status !== 200) {
      return navigate('/')
    }
    setIsTokenValid(true);
    return
  }

  const validate = (data: IValidate) => {
    const valid = fieldValidation(data);
    const name = valid.fieldName;
    // console.log("name: ", name);
    // console.log("valid: ", valid);
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

    const newPassword = _.get(formData, keyPaths.newPassword);
    const password = _.get(formData, keyPaths.password);
    // log both passwords
    // console.log("New Password:", newPassword);
    // console.log("Password:", password);

    const passwordsMatch = newPassword === password;
    //check if password is valid
    const isValidNewPass = validate({
      value: newPassword,
      name: "newPassword",
      required: true,
    });
    const isValidConfirmPass = validate({
      value: password,
      name: "password",
      required: true,
    });

    //check if passwords match and output error if they dont to the ErrorBox component
    if (!passwordsMatch) {
      // console.log("Passwords do not match");
      setError((prevError) => ({
        ...prevError,
        newPassword: {
          valid: false,
          message: "Passwords do not match",
        },
      }));
      return false;
    } else if (!isValidNewPass || !isValidConfirmPass) {
      setError((prevError) => ({
        ...prevError,
        [newPassword]: { valid: false, message: "valid.message" },
      }));
    } else {
      //send post request to /api/server/get_password to check if new password is different from old password
      //if it is different then send patch request to /api/server/update_password
      //if it is not different then output error to ErrorBox component
      await sendPostRequest({
        endpoint: "/api/server/check_password",
        data: { password: _.get(formData, keyPaths.newPassword), token: token },
      }).then(
        //check status code
        async (response: Response) => {
          if (response.status === 200) {
            // Send patch request here
            await sendPatchRequest({
              endpoint: "/api/server/update_password",
              data: {
                password: _.get(formData, keyPaths.newPassword),
                token: token,
              },
            }).then(
              // redirect to login page
              (response) => {
                // console.log("Response: ", response);
                setPasswordUpdated(true); // Set passwordUpdated to true
                // window.location.href = "/";
              }
            );
          } else {
            // Passwords are the same, output error to ErrorBox component
            setError((prevError) => ({
              ...prevError,
              newPassword: {
                valid: false,
                message: "New password must be different from old password",
              },
            }));
          }
        }
      );
    }
  };

  const handleNewPasswordBlur = (e: SyntheticEvent) => {
    const target = e.target as HTMLTextAreaElement;
    const { value, name, required } = target;
    validate({ value, name, required });

    // Update the flag based on validation
    validateNewPassword = error.newPassword?.valid === true;
  };

  const handlePasswordBlur = (e: SyntheticEvent) => {
    const target = e.target as HTMLTextAreaElement;
    const { value, name, required } = target;
    validate({ value, name, required });

    // Update the flag based on validation
    validatePassword = error.password?.valid === true;
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
          onBlur={handlePasswordBlur}
          required
        />
        {/* {error.password?.valid === false && (
          <div className="invalid-feedback">{error.password.message}</div>
        )} */}
      </>
    );
  };

  const ErrorBox: React.FC<InvalidProp> = (props) => {
    return (
      <>
        {props.isInvalid && (
          <>
            <div data-testid="password-error" className="invalid">
              {props.errorMessage ? (
                <div className="invalid-feedback">{props.errorMessage} </div>
              ) : (
                <>
                  <p className={styles.invalidPassword}>
                    Password does not meet password requirements:
                  </p>
                  <ul className={styles.invalidPassword}>
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
    isTokenValid &&
    <div className={`${styles.overlay} ${styles["forgot-pass-container"]}`}>
      {passwordUpdated ? (
        <div className={styles.inputBox}>
          <div className={styles.successContainer}>
            <div className={styles.checkOutline}>
              <MdOutlineCheckCircleOutline className={styles.checkIcon} />
            </div>
            <div className={styles.successMessage}>
              Password Updated Successfully
            </div>
            <div className="mt-5">
              <a href="/" className={styles.buttonLink}>
                <Button type="submit">
                  <div className={styles.buttonText}>Return to login</div>
                </Button>
              </a>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className={styles.inputBox}>
            <div className={styles.title}>Create New Password</div>
            <div className={styles.subtitle}>
              Your new password must be different from your previously used
              passwords.
            </div>
            <Form noValidate onSubmit={handlePasswordReset}>
              <Password
                required
                newPassword
                isInvalid={error.newPassword?.valid === false}
                onChange={(e) => {
                  _.set(formData, keyPaths.newPassword, e.target.value);
                }}
                onBlur={handleNewPasswordBlur}
                errorMessage={_.get(error, "newPassword.message", "")}
              />
              {PasswordConfirm()}
              {/* <div className="mt-5">
                <Button type="submit">Update Password</Button>
              </div> */}
              <div>
                <Button className={styles.submitButton} type="submit">
                  Update Password
                </Button>
              </div>
              <ErrorBox
                isInvalid={error.newPassword?.valid === false}
                errorMessage={_.get(error, "newPassword.message", "")}
              />
            </Form>
          </div>
        </>
      )}
    </div>

  );
};

{
  /* <Col
xs={6}
md={6}
lg={6}
xl={7}
className={styles.auth_image_container}
>
<Image className={styles.auth_image} src={forgotPassImg} />
</Col> */
}
// <div className="auth_image_container">
//   <img
//     className={styles.auth_image}
//     src={forgotPassImg} /* Replace with your image URL */
//     // alt="Background"
//     />
//   </div>
