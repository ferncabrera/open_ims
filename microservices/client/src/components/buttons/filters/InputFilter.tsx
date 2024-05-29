import React from 'react'
import { Form, InputGroup } from 'react-bootstrap';
import { MdClose } from 'react-icons/md';
import styles from "./DateFilter.module.scss";

interface IInputFilter {
  placeholder: string;
  onChange: (e, inputId) => void;
  onClose: (id: number) => void;
  inputId: number;
}

export const InputFilter = (props: IInputFilter) => {

  const { placeholder, onChange, onClose, inputId } = props;

  return (
    <div className={styles.date_wrapper}>
      <InputGroup className={styles.input_group}>
        <Form.Control type='text' placeholder={placeholder} onChange={(e) => onChange(e.target.value, inputId)} className={styles.input_date} />
        <InputGroup.Text onClick={(e) => onClose(inputId)} className={styles.close}>
          <MdClose />
        </InputGroup.Text>
      </InputGroup>
    </div>
  )
}
