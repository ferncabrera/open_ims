import React from 'react'
import { Container, Row, Col } from 'react-bootstrap';
import { MdNotificationsNone } from 'react-icons/md';

import styles from "./profileIcon.module.scss";

export const ProfileIcon = () => {
    return (
        <>
                <div className={styles.circleContainer}>

                    <div className={styles.profileImage}>
                        <div className={styles.notificationIcon}>
                            <MdNotificationsNone />
                        </div>

                    </div>
                </div>
        </>
    )
}
