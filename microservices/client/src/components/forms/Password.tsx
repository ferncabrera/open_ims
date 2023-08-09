import React, { ChangeEvent, useState } from 'react'
import {MdOutlineVisibilityOff, MdOutlineVisibility} from 'react-icons/md';
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
            <Form.Label htmlFor='password'>Password:</Form.Label>
            <div style={{ marginBottom: "20px" }}>
                <InputGroup style={{ display: "block", marginBottom: "0px" }}>
                    <Form.Control
                        id='password'
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
                        {showPassword ? <MdOutlineVisibilityOff className="font-24" /> : <MdOutlineVisibility className="font-24" />}
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
                    <>
                        <div data-testid="password-error" className='invalid'>
                            {props.errorMessage ? <div className='invalid-feedback'>{props.errorMessage} </div> :
                                <>
                                    <p className='mb-0 invalid-feedback' style={{ fontSize: "14px" }}>Password does not meet password requirements:</p>
                                    <ul className='invalid' style={{ fontSize: "14px" }}>
                                        <li>must contain 8 to 64 characters.</li>
                                        <li>must include one lowercase letter, one uppercase letter, one number, and one special character.</li>
                                    </ul>
                                </>
                            }
                        </div>
                    </>
                }
            </div>
        </>
    )
}
