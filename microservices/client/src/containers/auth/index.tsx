import React from 'react'
import { Container, Row, Col, Image } from 'react-bootstrap'
import { Login } from './Login';

import createLogin from './../../assets/public/images/createLogin.jpg'
import logoWithText from './../../assets/public/svgs/logoWithText.svg';
import styles from './index.module.scss';

export const Authentication = () => {
  return (
    <>
      <Container fluid className={styles.auth_page_paddings}>
        <Row>
          <Col className={`me-5 ${styles.left_auth_formatting}`}>
            <div className='title-heading d-flex justify-content-center mb-2'>
              <h3><Image src={logoWithText}/> </h3>
            </div>
            <Login />
          </Col>
          <Col xs={6} md={6} lg={6} xl={7} className={styles.auth_image_container}>
            <Image className={styles.auth_image} src={createLogin} />
          </Col>
        </Row>
      </Container>

    </>
  )
}