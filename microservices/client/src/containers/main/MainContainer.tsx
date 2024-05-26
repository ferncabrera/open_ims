import React, { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Container, Row, Col } from 'react-bootstrap';
import { Sidebar } from '../../components/mainComponents/Sidebar'
import { isUserAuth } from '../../utilities/helpers/functions';
import { useNavigate } from 'react-router-dom';
import { OverlaySpinner } from '../../components/modals/OverlaySpinner';
import { useRecoilValue, useResetRecoilState } from 'recoil';
import { overlaySpinnerState, breadcrumbsState } from '../../atoms/state';
import { GoHome } from 'react-icons/go';
import { Link } from 'react-router-dom';
import styles from "./index.module.scss";
import { GlobalBanner } from '../../components/banners/GlobalBanner';
import useWindowDimensions from '../../hooks/useWindowDimensions'
import _ from 'lodash';

export const MainContainer = (props: any) => {

    let i_key = 0;

    const navigate = useNavigate();
    const spinnerState = useRecoilValue(overlaySpinnerState);
    const breadcrumbs = useRecoilValue(breadcrumbsState);
    const resetBreadcrumbs = useResetRecoilState(breadcrumbsState)
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    // we should use a global state here tbh - but will do this temporarily to show we have access to cookie data
    const [sidebarProps, setSidebarProps] = useState({});
    const { height: winHeight, width: winWidth } = useWindowDimensions();

    useEffect(() => {
        isUserAuth().then((response: any) => {
            if (response.authenticated !== true) {
                navigate('/');
                return
            } else {
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
                    {spinnerState && <OverlaySpinner />}


                    <Row>

                        <div className={styles.sidebarColumn}>
                            <Sidebar userData={sidebarProps} />
                        </div>
                        {/* !All of your containers will begin in a Bootstrap 5 <Col> </Col> component, so you may use nested <Row></Row> and <Col></Col> mainComponents
                        to style your pages! */}
                        <Col
                            className={styles.contentColumn}
                        >
                            <GlobalBanner
                                customStyleObject={{ transform: winWidth <= 576 ? "translateX(-50%) translateY(60%)" : "translateX(-20%) translateY(40%)" }}
                            />
                            {!_.isEmpty(breadcrumbs.pathArr) &&
                                <div className='mt-3'>
                                    <span className='pill' onClick={() => resetBreadcrumbs()}>
                                        <Link to='/'><GoHome /></Link>
                                    </span>
                                    {_.map(breadcrumbs.pathArr, (element) => {
                                        const formatBreadcrumb = <span key={i_key}>/<span className='pill'>{element}</span></span>
                                        i_key ++;
                                        return formatBreadcrumb
                                    })}
                                </div>
                            }

                            <Outlet />
                        </Col>

                    </Row>

                </Container>
            }
        </>
    );

}
