import React from 'react';
import { Spinner } from 'react-bootstrap';

import styles from "./OverlaySpinner.module.scss";

export const OverlaySpinner = () => {
    return (
        <div className={styles.overlay}>
            <div className='center-content-page'>
                <Spinner />
            </div>
        </div>
    )
}
