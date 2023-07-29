import React, { useState } from 'react'
import { Link } from 'react-router-dom';
import { Form, Row, Button } from 'react-bootstrap'
import { Password } from '../../../components/forms/Password';
import { CenteredModal } from '../../../components/modals/CenteredModal';

import styles from './index.module.scss';


export const Login = () => {

    const [showResetPassword, setShowResetPassword] = useState(false);

    const modalContent = () => {
        return (
            <div>
                <h6 className='mb-3'>Enter the email associated with you CCG inventory account here:</h6>
                <Form>
                    <Form.Control type="email" placeholder='' />
                    <Button className='mt-2'>Send email</Button>
                </Form>
                <p className='mt-5 text-center'>If we find your email in our records, we'll send you an email with next steps.</p>
            </div>
        )
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
                    <Form.Label>Email:</Form.Label>
                    <Form.Control type="email" placeholder='' />
                </Form.Group>
                <Password onChange={() => { return }} />
                <Row>
                    <div className={'d-flex justify-content-between' + ` ${styles.flex_wrapper}`}>
                        <Form.Check label='Remember me for 30 days' />
                        <a className='no-underline' onClick={() => setShowResetPassword(true)}>forgot password</a>
                    </div>
                </Row>
                <div className='mt-5'>
                    <Button>Sign in</Button>
                </div>
            </Form>
            {/* Display Modal here */}
            <CenteredModal
                heading={<div><h3>Forgot your Password?</h3><h3>No Worries.</h3></div>}
                show={showResetPassword}
                footer={<a>Cancel</a>}
            >
                {modalContent()}
            </CenteredModal>
        </>
    )
}
