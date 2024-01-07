import React, { ReactNode } from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import styles from './CrudForm.module.scss';
import { entityState } from '../../atoms/state';
import { useResetRecoilState } from 'recoil';

interface ICrudForm {
    children: ReactNode;
    header: string;
    handleSave: () => void;
    handleCancel?: () => void;
}

export const CrudForm = (props: ICrudForm) => {

    const resetEntityState = useResetRecoilState(entityState);

    const {
        handleSave,
        header,
        handleCancel = resetEntityState
    } = props;

    

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
                    onClick={handleSave}
                    >
                        Save
                    </Button>
                    <Button
                        className='mx-1'
                        variant='secondary'
                        onClick={handleCancel}
                    >
                        Cancel
                    </Button>
                </Col>
            </Row>
        </div>
    )
}
