import styles from "./index.module.scss"; // Import the SCSS module
import { Form, Button } from "react-bootstrap";
import { Password } from "../../../components/forms/Password";
import { useState, SyntheticEvent } from "react";
import { IValidate } from "../../../utilities/types/validationTypes";
import { fieldValidation } from "../../../utilities/validation";
import { sendPatchRequest } from "../../../utilities/apiHelpers";
import _ from "lodash";

export const ForgotPass = () => {
  const [showPassword, setShowPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const initialErrorFieldState = {
    password: null,
  };

  let trackErrorList = [];
  const [resetPassword, setPassword] = useState("");
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
    console.log("Password: ", resetPassword);
    const urlSearchParams = new URLSearchParams(window.location.search);
    const token = urlSearchParams.get('token');
  
    if (!token) {
      // Token not found, handle the error or redirect
      console.log("Token not found");
      return;
    }
    
    // Send post request here
    await sendPatchRequest({
      endpoint: "/api/server/update_password",
      data: { email: resetPassword, token: token },
    });
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.title}>Create New Password</div>
      <div className={styles.subtitle}>
        Your new password must be different from your previously used passwords.
      </div>
      <Form noValidate onSubmit={handlePasswordReset}>
        <Password
          isInvalid={error.password?.valid === false}
          onChange={(e) => {
            {
              setPassword(e.target.value);
            }
          }}
          onBlur={(data: SyntheticEvent) => {
            const target = data.target as HTMLTextAreaElement;
            const { value, name, required } = target;
            validate({ value, name, required });
          }}
          required
          errorMessage={_.get(error, "password.message", "")}
        />
        <div className={styles["input-container"]}>
          <label htmlFor="confirmPassword">Confirm Password:</label>
          <input
            type={showConfirmPassword ? "text" : "password"}
            id="confirmPassword"
            className={styles["input-field"]}
            placeholder="Confirm your password"
          />
        </div>
        <div className="mt-5">
          <Button type="submit">Sign in</Button>
        </div>
      </Form>
    </div>
  );
};
