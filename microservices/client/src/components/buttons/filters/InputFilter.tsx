import React from 'react'
import { Form, InputGroup } from 'react-bootstrap';
import { MdClose } from 'react-icons/md';

interface IInputFilter {
  placeholder: string;
  onChange: (e) => void;
  onClose: (id: number) => void;
  inputId: number;
}

export const InputFilter = (props: IInputFilter) => {

  const { placeholder, onChange, onClose, inputId } = props;

  return (
    <InputGroup>
      <Form.Control type='text' placeholder={placeholder} onChange={onChange} />
      <InputGroup.Text onClick={(e) => onClose(inputId)}>
        <MdClose />
      </InputGroup.Text>
    </InputGroup>
  )
}
