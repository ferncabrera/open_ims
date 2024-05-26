import React from 'react'
import { Form, InputGroup } from 'react-bootstrap'
import { MdClose } from 'react-icons/md'

import styles from "./DateFilter.module.scss";

interface IDateFilter {
  onSelect: (date: string) => void;
  onClose: (type: string, label:any) => void;
}

export const DateFilter = (props: IDateFilter) => {

  const {onSelect, onClose} = props;

  return (
    <div className={styles.date_wrapper}>
      <InputGroup tabIndex={0} className={styles.input_group}>
        <Form.Control
          type='date'
          placeholder='Select Date'
          className={styles.input_date}
          onChange = {(e) => onSelect(e.target.value)}
        />
        <InputGroup.Text onClick={(label) => onClose('date', label)} className={styles.close}>
            <MdClose />
        </InputGroup.Text>
      </InputGroup>
    </div>

  )
}
