import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom';
import { Form, Button } from 'react-bootstrap';
import { Password } from '../../../components/forms/Password';
import { IValidate } from '../../../utilities/types/validationTypes';
import { fieldValidation } from '../../../utilities/validation';
import _ from 'lodash';

import styles from './index.module.scss';

const initialErrorFieldState = {
    firstName: null,
    lastName: null,
    email: null,
    newPassword: null,
}

const formData = {};
let trackErrorList = [];

export const Register = () => {

    const keyPaths = {
        attributes: 'attributes',
        email: 'attributes.email',
        newPassword: 'attributes.newPassword',
        firstName: 'attributes.firstName',
        lastName: 'attributes.lastName',
    }

    const [error, setError] = useState<IErrorFields>(initialErrorFieldState);

    useEffect(() => {
        _.set(formData, keyPaths.email, "");
        _.set(formData, keyPaths.newPassword, "");
        _.set(formData, keyPaths.firstName, "");
        _.set(formData, keyPaths.lastName, "");
    }, []);

    

    const validate = (data: IValidate) => {
        const valid = fieldValidation(data)
        const name = valid.fieldName;
        if (!valid.isValid) {
            setError((prevError) => ({ ...prevError, [name]: { valid: valid.isValid, message: valid.message } }));
        } else {
            setError((prevError) => ({ ...prevError, [name]: null }))
        }
        return valid.isValid;
    };

    const handleSignIn = () => {
        const loginData = _.get(formData, keyPaths.attributes);
        _.forIn(loginData, (value, key: string) => {
            const data = { value, name: key, required: true }
            const isValid = validate(data);
            trackErrorList.push(isValid)
        });
        if (_.some(trackErrorList, (validEntity) => validEntity === false)) {
            trackErrorList = [];
            return
        }
        // Send post request here
        console.log('We send the POST request here if no errors!')

    }

    return (
        <>
            <div className='mt-5 mb-5'>
                <h1>Create an account</h1>
                <div className={`d-flex justify-content-start ${styles.flex_wrapper}`}>
                    <h6 className='d-flex align-items-center'>Already have an account?</h6>
                    <Link className={`ps-1 ${styles.link_header}`} to={'/'}> Log in</Link>
                </div>
            </div>
            <Form>
                <Form.Group>
                    <Form.Label>First Name:</Form.Label>
                    <Form.Control
                        name='firstName'
                        type="text"
                        placeholder=''
                        isInvalid={error.firstName?.valid === false}
                        required
                        onChange={(e) => { _.set(formData, keyPaths.firstName, e.target.value) }}
                        onBlur={(data) => {
                            const target = data.target as HTMLTextAreaElement;
                            const { value, name, required } = target;
                            validate({ value, name, required })
                        }}

                    />
                    {error.firstName?.valid === false &&
                        <Form.Control.Feedback type='invalid'>{error.firstName.message}</Form.Control.Feedback>
                    }
                </Form.Group>
                <Form.Group>
                    <Form.Label>Last Name:</Form.Label>
                    <Form.Control
                        name='lastName'
                        type="text"
                        placeholder=''
                        isInvalid={error.lastName?.valid === false}
                        required
                        onChange={(e) => { _.set(formData, keyPaths.lastName, e.target.value) }}
                        onBlur={(data) => {
                            const target = data.target as HTMLTextAreaElement;
                            const { value, name, required } = target;
                            validate({ value, name, required })
                        }}

                    />
                    {error.lastName?.valid === false &&
                        <Form.Control.Feedback type='invalid'>{error.lastName.message}</Form.Control.Feedback>
                    }
                </Form.Group>
                <Form.Group>
                    <Form.Label>Email:</Form.Label>
                    <Form.Control
                        name='email'
                        type="email"
                        placeholder=''
                        isInvalid={error.email?.valid === false}
                        required
                        onChange={(e) => { _.set(formData, keyPaths.email, e.target.value) }}
                        onBlur={(data) => {
                            const target = data.target as HTMLTextAreaElement;
                            const { value, name, required } = target;
                            validate({ value, name, required })
                        }}
                    />
                    {error.email?.valid === false &&
                        <Form.Control.Feedback type='invalid'>{error.email.message}</Form.Control.Feedback>
                    }
                </Form.Group>
                <Password
                    required
                    newPassword
                    isInvalid={error.newPassword?.valid === false}
                    onChange={(e) => { _.set(formData, keyPaths.newPassword, e.target.value) }}
                    onBlur={(data) => {
                        const target = data.target as HTMLTextAreaElement;
                        const { value, name, required } = target;
                        validate({ value, name, required })
                    }}
                    errorMessage={_.get(error, "newPassword.message", '')}

                />
                <div className='mt-5'>
                    <Button onClick={handleSignIn}>Create account</Button>
                </div>
            </Form>

        </>
    )
}
