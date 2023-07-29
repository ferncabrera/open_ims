import React from 'react'
import { Form, Row, Col, Button } from 'react-bootstrap'

import styles from './index.module.scss';

export const Login = () => {
    return (
        <>
            <div className='mt-5 mb-5'>
                <h1>Welcome back</h1>
                <div className={`d-flex justify-content-start ${styles.flex_wrapper}`}>
                    <h6>New to CCG Inventory?</h6>
                    <a className={`ps-1 ${styles.link_header}`} href="/"> Create an account</a>
                </div>
            </div>
            <Form>
                <Form.Group>
                    <Form.Label>Email:</Form.Label>
                    <Form.Control type="email" placeholder='' />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Password:</Form.Label>
                    <Form.Control type="password" placeholder='' />
                </Form.Group>
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
