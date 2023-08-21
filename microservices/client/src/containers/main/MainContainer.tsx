import React from 'react'
import { Outlet } from 'react-router-dom'
import { Container, Row, Col } from 'react-bootstrap';
import { Sidebar } from '../../components/mainComponents/Sidebar'
import styles from "./index.module.scss";

export const MainContainer = () => {
  return (
    <>
     <Container fluid>
            <Row>
                <div  className={styles.sidebarColumn}>      
                  <Sidebar />
                </div>
                <div className={styles.contentColumn}>
                    <Outlet/>
                </div> 
            </Row>

        </Container>
    </>
    );

}
