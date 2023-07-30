import React, { ChangeEvent, useState } from 'react'
import { BsEye } from 'react-icons/bs';
import { BsEyeSlash } from 'react-icons/bs';
import { Form, InputGroup } from 'react-bootstrap';
import styles from './Password.module.scss';

interface IPasswordProps {
    onChange: (event: ChangeEvent) => void;
    className?: string;
}

export const Password: React.FC<IPasswordProps> = (props) => {

    const [showPassword, setShowPassword] = useState(false);

    return (
        <>
            <Form.Label>Password:</Form.Label>
            <InputGroup>
                <Form.Control
                    className={`${styles.password} ${props.className}`}
                    type={showPassword ? 'text' : 'password'}
                    onChange={props.onChange}
                />
                <span 
                className={`${styles.password}`}
                onClick={() => setShowPassword(!showPassword)}
                >
                    {showPassword ? <BsEyeSlash /> : <BsEye />}
                </span>
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
        </>
    )
}
