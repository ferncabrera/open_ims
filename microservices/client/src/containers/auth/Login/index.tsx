import React, { SyntheticEvent, useState, useEffect } from 'react'
import { Link } from 'react-router-dom';
import { Form, Row, Button } from 'react-bootstrap'
import { Password } from '../../../components/forms/Password';
import { CenteredModal } from '../../../components/modals/CenteredModal';
import { MdOutlineEmail } from 'react-icons/md';
import { fieldValidation } from '../../../utilities/validation';
import { IValidate } from '../../../utilities/types/validationTypes';
import _ from 'lodash';

import styles from './index.module.scss';

const initialErrorFieldState = {
    email: null,
    password: null,
}

const formData = {};
let trackErrorList = [];


export const Login = () => {


    const keyPaths = {
        attributes: 'attributes',
        email: 'attributes.email',
        password: 'attributes.password',
    }

    const [showResetPassword, setShowResetPassword] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [error, setError] = useState<IErrorFields>(initialErrorFieldState);

    useEffect(() => {
        _.set(formData, keyPaths.email, "");
        _.set(formData, keyPaths.password, "");
    }, []);

    const modalFooter = emailSent ? null : <a
        onClick={() => {
            setShowResetPassword(false);
            setEmailSent(false);
        }}
    >
        Cancel
    </a>

    const resetPasswordContent = () => {
        return (
            <div>
                <h6 className='mb-3'>Enter the email associated with you CCG inventory account here:</h6>
                <Form>
                    <Form.Control type="email" placeholder='' />
                    <Button
                        id="send-email"
                        className='mt-2'
                        onClick={() => setEmailSent(true)}
                    >
                        Send email
                    </Button>
                </Form>
                <p className='mt-5 text-center'>If we find your email in our records, we'll send you an email with next steps.</p>
            </div>
        )
    };

    const resetPasswordSentContent = () => {
        return (
            <div>
                <h2 className='mb-5 pb-5 d-flex justify-content-center'>Email Sent!</h2>
                <div className='mt-5'>
                    <span className='d-flex justify-content-center'>
                        <MdOutlineEmail className="font-24" />
                    </span>
                    <p className='text-center'>Keep an eye out for an incoming email with your next steps.</p>
                </div>
            </div>
        )
    };

    const validate = (data: IValidate) => {
        const valid = fieldValidation(data)
        const name = valid.fieldName;
        if (!valid.isValid) {
            setError((prevError) => ({ ...prevError, [name]: { valid: valid.isValid, message: valid.message } }));
        } else {
            setError((prevError) => ({ ...prevError, [name]: null }))
        }
        return valid.isValid;
    }

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
                <h1>Welcome back</h1>
                <div className={`d-flex justify-content-start ${styles.flex_wrapper}`}>
                    <h6 className='d-flex align-items-center'>New to CCG Inventory?</h6>
                    <Link className={`ps-1 ${styles.link_header}`} to={'/register'}> Create an account</Link>
                </div>
            </div>
            <Form>
                <Form.Group>
                    <Form.Label htmlFor='email'>Email:</Form.Label>
                    <Form.Control
                        name="email"
                        id='email'
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
                        <Form.Control.Feedback data-testid="email-error" type='invalid'>{error.email.message}</Form.Control.Feedback>
                    }
                </Form.Group>
                <Password
                    isInvalid={error.password?.valid === false}
                    onChange={(e) => { _.set(formData, keyPaths.password, e.target.value) }}
                    onBlur={(data: SyntheticEvent) => {
                        const target = data.target as HTMLTextAreaElement;
                        const { value, name, required } = target;
                        validate({ value, name, required });
                    }}
                    required
                    errorMessage={_.get(error, "password.message", '')}
                />

                <Row>
                    <div className={'d-flex justify-content-between' + ` ${styles.flex_wrapper}`}>
                        <Form.Check label='Remember me for 30 days' />
                        <a className='no-underline' onClick={() => setShowResetPassword(true)}>forgott password</a>
                    </div>
                </Row>
                <div className='mt-5'>
                    <Button onClick={handleSignIn}>Sign in</Button>
                </div>
            </Form>
            {/* Display Modal here */}
            <CenteredModal
                heading={<div><h3>Forgot your Password?</h3><h3>No Worries.</h3></div>}
                show={showResetPassword}
                footer={modalFooter}
                topCloseFunction={() => {
                    setShowResetPassword(false)
                    setEmailSent(false)
                }}
            >
                {!emailSent ? resetPasswordContent() : resetPasswordSentContent()}
            </CenteredModal>
        </>
    )
}
