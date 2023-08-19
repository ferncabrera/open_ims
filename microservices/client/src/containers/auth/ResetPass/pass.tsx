import React, { ChangeEvent, useState } from "react";
import { MdOutlineVisibilityOff, MdOutlineVisibility } from "react-icons/md";
import { Form, InputGroup } from "react-bootstrap";
import styles from "./index.module.scss";

interface IPasswordProps {
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  isInvalid?: any;
  onBlur: (e) => void;
  required: boolean;
  errorMessage: string;
  newPassword?: boolean;
}

export const Password: React.FC<IPasswordProps> = (props) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <>
      <Form.Label htmlFor="password">Password:</Form.Label>
      <div style={{ marginBottom: "20px" }}>
        <InputGroup style={{ display: "block", marginBottom: "0px" }}>
          <Form.Control
            id="password"
            className={`${styles.password}`}
            name={props.newPassword ? "newPassword" : "password"}
            type={showPassword ? "text" : "password"}
            onChange={props.onChange}
            onBlur={(e) => props.onBlur(e)}
            required={props.required}
          />
          <span
            className={`${styles.password}`}
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <MdOutlineVisibilityOff className="font-24" />
            ) : (
              <MdOutlineVisibility className="font-24" />
            )}
          </span>
        </InputGroup>
      </div>
    </>
  );
};
