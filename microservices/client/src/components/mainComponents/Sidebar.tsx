import React from 'react'
import { Nav, Image, Row, Col } from 'react-bootstrap';
import logoWithText from "../../assets/public/svgs/logoWithText.svg"
import {
    MdOutlineHome,
    MdOutlineFace,
    MdOutlineSell,
    MdOutlineStorefront,
    MdOutlineLocalMall,
    MdOutlineCategory,
    MdOutlineSupervisedUserCircle
} from "react-icons/md"
import { ProfileIcon } from './ProfileIcon';
import _ from 'lodash';
import styles from "./sidebar.module.scss";

interface ISidebarProps {
    userData?: object;
}

export const Sidebar: React.FC<ISidebarProps> = (props) => {
    return (
        <>

            <Nav className={`col-md-12 d-none d-md-block ${styles.sidebar}`}
                defaultActiveKey="/ccg/dashboard"
                onSelect={selectedKey => alert(`selected ${selectedKey}`)}
            >
                <div className='mt-2 mb-4 pb-1 ps-3 pe-5'>
                    <Image className={styles.logo} src={logoWithText} />
                </div>
                <Nav.Item>
                    <Nav.Link href="/ccg/dashboard"><span><MdOutlineHome /></span>Dashboard</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey="customers"><span><MdOutlineFace /></span>Customers</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey="salesOrders"><span><MdOutlineSell /></span>Sales Orders</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey="vendors"><span><MdOutlineStorefront /></span>Vendors</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey="purchaseOrders"><span><MdOutlineLocalMall /></span>Purchase Orders</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey="products"><span><MdOutlineCategory /></span>Products</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey="users"><span><MdOutlineSupervisedUserCircle /></span>Users</Nav.Link>
                </Nav.Item>

                <div className={styles.profileIcon}>
                    <ProfileIcon />
                    <div className='d-flex flex-column'>
                        <div>

                            <strong>{_.get(props.userData, 'firstName', '[null]')}</strong>
                        </div>
                        <div>
                            {_.get(props.userData, 'permission', '[null]')}
                        </div>
                    </div>


                </div>

            </Nav>

        </>
    );
}
