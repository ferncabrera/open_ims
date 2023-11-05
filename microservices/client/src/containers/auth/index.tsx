import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Image } from 'react-bootstrap'
import { Login } from './Login';
import { Register } from './Register';

import { isUserAuth } from '../../utilities/helpers/functions';
import { useNavigate } from 'react-router';

import createLogin from './../../assets/public/images/createLogin.jpg';
import registerImg from './../../assets/public/images/register.jpg';
import logoWithText from './../../assets/public/svgs/logoWithText.svg';
import styles from './index.module.scss';

interface IAuthenticationProps {
  isLogin?: boolean;
}

export const Authentication: React.FC<IAuthenticationProps> = (props) => {

  const {
    isLogin = true,
  } = props

  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    isUserAuth().then((response: any) => {
      if (response.authenticated === true) {
        navigate('/ccg/dashboard');
        return
      } else {
        setIsAuthenticated(true);
        return
      }
    })
  }, []);


  return (
    <>
      {isAuthenticated &&
        <Container fluid className={styles.auth_page_paddings}>
          <Row>
            <Col className={`me-5 ${!isLogin ? styles.left_auth_formatting_register : styles.left_auth_formatting}`}>
              <div className='title-heading d-flex justify-content-center mb-2'>
                <h3><Image src={logoWithText} /> </h3>
              </div>
              {isLogin ? <Login /> : <Register />}
            </Col>
            <Col xs={6} md={6} lg={6} xl={7} className={styles.auth_image_container}>
              <Image className={styles.auth_image} src={isLogin ? createLogin : registerImg} />
            </Col>
          </Row>
        </Container>
      }
    </>
  )
}