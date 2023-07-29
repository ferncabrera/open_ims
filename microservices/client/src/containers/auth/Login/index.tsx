import React from 'react'
import { Link } from 'react-router-dom';
import { Form, Row, Button } from 'react-bootstrap'
import { Password } from '../../../components/forms/Password';

import styles from './index.module.scss';

export const Login = () => {
    return (
        <>
            <div className='mt-5 mb-5'>
                <h1>Welcome back</h1>
                <div className={`d-flex justify-content-start ${styles.flex_wrapper}`}>
                    <h6>New to CCG Inventory?</h6>
                    <Link className={`ps-1 ${styles.link_header}`} to={'/register'}> Create an account</Link>
                </div>
            </div>
            <Form>
                <Form.Group>
                    <Form.Label>Email:</Form.Label>
                    <Form.Control type="email" placeholder='' />
                </Form.Group>
                <Password onChange={() => {return}}/>
                <Row>
                    <div className={'d-flex justify-content-between' + ` ${styles.flex_wrapper}`}>
                        <Form.Check label='Remember me for 30 days' />
                        <a className='no-underline' href="/">forgot password</a>
                    </div>
                </Row>
                <div className='mt-5'>
                    <Button>Sign in</Button>
                </div>
            </Form>

        </>
    )
}
