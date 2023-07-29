import React, { useEffect, useState } from 'react'
import { Modal } from 'react-bootstrap';

interface IModalProps {
  children: React.ReactNode;
  heading: React.ReactNode;
  footer: JSX.Element;
  size?: 'lg' | null | 'sm' | 'xl';
  show: boolean;
  topCloseFunction: () => void;

}

export const CenteredModal: React.FC<IModalProps> = (props) => {

  const {
    children,
    heading,
    size,
    footer,
    show,
    topCloseFunction,

  } = props;

  const [animate, setAnimate] = useState(true);

  useEffect(() => {
    if (!show) {
      setAnimate(true);
    } else {
      console.log('when do we make it false?')
      setAnimate(false);
    }
  }, [show])

  return (
    <>
      <Modal
        className='open-ims-styling pxy-3'
        size={size}
        centered
        keyboard={false}
        show={show}
        animation={animate}
      >
        <Modal.Header
          closeButton
          onHide={topCloseFunction}
        >
        </Modal.Header>
        <Modal.Body>
          <div className='text-center mb-5'>
            {heading}
          </div>

          {children}
        </Modal.Body>
        {footer &&
          <Modal.Footer className='d-flex justify-content-center'>
            {footer}
          </Modal.Footer>
        }
      </Modal>
    </>
  )
}
