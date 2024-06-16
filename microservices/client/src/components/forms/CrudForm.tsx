import React, { ReactNode } from 'react';
import { Row, Col, Button, Spinner } from 'react-bootstrap';
import styles from './CrudForm.module.scss';
import { entityState, overlaySpinnerState } from '../../atoms/atoms';
import { useResetAtom } from 'jotai/utils';
import { useAtom } from 'jotai';

interface ICrudForm {
  children: ReactNode;
  header: string;
  handleSubmit(): null | Promise<void | boolean>;
  handleCancel?: () => void;
  disablePrimary?: boolean;
  disableSecondary?: boolean;
}

export const CrudForm = (props: ICrudForm) => {

  const resetEntityState = useResetAtom(entityState);
  const [entity, setEntity] = useAtom(entityState);
  const [overlaySpinner, setOverlaySpinner] = useAtom(overlaySpinnerState);

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
    } catch (err) { } // might not be necessary for error handelling, but we don't want the entity state to reset or continue if the submission did not work
    setOverlaySpinner(false);
  };


  return (
    <div className={styles.body}>

      <div className='fs-3' style={{ fontWeight: 500 }}>
        <strong>{header}</strong>
      </div>

      {props.children}

      {entity.action !== 'read' &&
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
              {entity.action === 'update' ? 'Save' : 'Create'}
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
      }
    </div>
  )
}
