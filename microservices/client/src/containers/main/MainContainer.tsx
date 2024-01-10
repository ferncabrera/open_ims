import React, { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Container, Row, Col } from 'react-bootstrap';
import { Sidebar } from '../../components/mainComponents/Sidebar'
import { isUserAuth } from '../../utilities/helpers/functions';
import { useNavigate } from 'react-router-dom';
import styles from "./index.module.scss";

export const MainContainer = (props: any) => {

    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    // we should use a global state here tbh - but will do this temporarily to show we have access to cookie data
    const [sidebarProps, setSidebarProps] = useState({})

    useEffect(() => {
        isUserAuth().then((response: any) => {
            if (response.authenticated !== true) {
                navigate('/');
                return
            } else {
                console.log(response);
                const { firstName, permission } = response;
                setIsAuthenticated(true);
                setSidebarProps({ firstName, permission })
                return
            }
        }).catch((err) => {
            return
        })
    }, []);


    return (
        <>
            {isAuthenticated &&
                <Container fluid>

                    <Row>

                        <div className={styles.sidebarColumn}>
                            <Sidebar userData={sidebarProps} />
                        </div>
                        {/* !All of your containers will begin in a Bootstrap 5 <Col> </Col> component, so you may use nested <Row></Row> and <Col></Col> mainComponents
                        to style your pages! */}
                        <Col
                            className={styles.contentColumn}
                        >
                            <Outlet />
                        </Col>

                    </Row>

                </Container>
            }
        </>
    );

}
