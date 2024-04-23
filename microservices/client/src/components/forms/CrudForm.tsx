import React, { ReactNode } from 'react';
import { Row, Col, Button, Spinner } from 'react-bootstrap';
import styles from './CrudForm.module.scss';
import { entityState, overlaySpinnerState } from '../../atoms/state';
import { useResetRecoilState, useRecoilState } from 'recoil';

interface ICrudForm {
    children: ReactNode;
    header: string;
    handleSubmit(): Promise<void | boolean>;
    handleCancel?: () => void;
    disablePrimary?: boolean;
    disableSecondary?: boolean;
}

export const CrudForm = (props: ICrudForm) => {

    const resetEntityState = useResetRecoilState(entityState);
    const [overlaySpinner, setOverlaySpinner] = useRecoilState(overlaySpinnerState);

    const {
        handleSubmit,
        header,
        handleCancel = resetEntityState,
        disablePrimary = false,
        disableSecondary = false,
    } = props;


    const handleSubmitClick = async () => {
        setOverlaySpinner(true);
        try {
            const res = await handleSubmit();
            if (!res) {
                setOverlaySpinner(false);
                return
            }
            resetEntityState();
        } catch(err) {} // might not be necessary for error handelling, but we don't want the entity state to reset or continue if the submission did not work
        setOverlaySpinner(false);
    };
    

    return (
        <div className={styles.body}>

            <div className='fs-4' style={{fontWeight: 500}}>
                {header}
            </div>

            {props.children}

            <Row className={styles.footer}>
                <Col>
                    {/* Can add conditional buttons here for future use or something on left-side on footer */}
                </Col>
                <Col>
                    {/* can add conditional buttons here for future use or something centered on footer */}
                </Col>
                <Col className='d-flex' xs={3} sm={4} md={3} lg={3}>
                    <Button 
                    className='mx-1'
                    onClick={handleSubmitClick}
                    disabled={disablePrimary}
                    >
                        Save
                    </Button>
                    <Button
                        className='mx-1'
                        variant='secondary'
                        onClick={handleCancel}
                        disabled={disableSecondary}
                    >
                        Cancel
                    </Button>
                </Col>
            </Row>
        </div>
    )
}
