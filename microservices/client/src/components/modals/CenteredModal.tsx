import React from 'react'
import { Modal } from 'react-bootstrap';

interface IModalProps {
  children: React.ReactNode;
  heading: React.ReactNode;
  footer: React.ReactNode;
  size?: 'lg' | null | 'sm' | 'xl';
  show: boolean;

}

export const CenteredModal: React.FC<IModalProps> = (props) => {

  const {
    children,
    heading,
    size,
    footer,
    show,

  } = props;

  return (
    <>
      <Modal
        className='open-ims-styling pxy-3'
        size={size}
        centered
        keyboard={false}
        show={show}
      >
        <Modal.Header closeButton>
        </Modal.Header>
        <Modal.Body>
          <div className='text-center mb-5'>
            {heading}
          </div>

          {children}
        </Modal.Body>
        <Modal.Footer>
          {footer}
        </Modal.Footer>
      </Modal>
    </>
  )
}
