import React, {useState, useEffect} from 'react'
import { Link } from 'react-router-dom';
import {Form, Button} from 'react-bootstrap';
import { Password } from '../../../components/forms/Password';

import styles from './index.module.scss';

const initialErrorFieldState = {
    name: null,
    email: null,
    newPassword: null,
  }
  
  const formData = {};
  let trackErrorList = [];

export const Register = () => {
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
                    <Form.Label>Name:</Form.Label>
                    <Form.Control type="text" placeholder='' />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Email:</Form.Label>
                    <Form.Control type="email" placeholder='' />
                </Form.Group>
                <Password onChange={() => {return}}/>
                <div className='mt-5'>
                    <Button>Create account</Button>
                </div>
            </Form>

        </>
  )
}
