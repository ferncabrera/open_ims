import React, { ChangeEvent, useState } from 'react'
import { BsEye } from 'react-icons/bs';
import { BsEyeSlash } from 'react-icons/bs';
import { Form, InputGroup } from 'react-bootstrap';
import styles from './Password.module.scss';

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
            <Form.Label>Password:</Form.Label>
            <div style={{ marginBottom: "20px" }}>
                <InputGroup style={{ display: "block", marginBottom: "0px" }}>
                    <Form.Control
                        className={`${styles.password} ${props.className} ${props.isInvalid ? styles.password_invalid : ''}`}
                        name={props.newPassword ? 'newPassword' : 'password'}
                        type={showPassword ? 'text' : 'password'}
                        onChange={props.onChange}
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                        // isInvalid={props.isInvalid}
                        onBlur={(e) => props.onBlur(e)}
                        required={props.required}
                    />
                    <span
                        className={`${styles.password}`}
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? <BsEyeSlash /> : <BsEye />}
                    </span>
                    {/* {error.password?.valid === false &&
                    <Form.Control.Feedback type='invalid'>{error.password.message}</Form.Control.Feedback>
                } */}

                    {/* <InputGroup.Text
                       className={`${styles.password}`}
                    >
                        < div
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <BsEyeSlash /> : <BsEye />}
                        </div>
                    </InputGroup.Text> */}

                </InputGroup>
                {props.isInvalid &&
                    <div style={{ fontSize: "14px" }} className='invalid'>
                        {props.errorMessage ? props.errorMessage :
                            <>
                                <p className='mb-0'>Password does not meet password requirements:</p>
                                <ul>
                                    <li>must be at least 8 - 64 characters long.</li>
                                    <li>must include one lowercase letter, one uppercase letter, one number, and one special character.</li>
                                </ul>
                            </>
                        }
                    </div>
                }
            </div>
        </>
    )
}
