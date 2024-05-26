import React, { useState, useCallback } from 'react';
import { InputGroup, Form } from 'react-bootstrap';
import { MdOutlineSearch } from "react-icons/md";

import styles from "./BasicSearchFilters.module.scss";
import _ from 'lodash';

interface IBasicSearchFiltersProps {
  search: (value: string) => void;
  placeHolder: string;
}

export const BasicSearchFilters: React.FC<IBasicSearchFiltersProps> = (props) => {

  const [filterQuery, setFilterQuery] = useState('')

  const {
    search,
    placeHolder,
  } = props

  const debounceFn = useCallback(_.debounce(search, 0), []);

  const handleSearchChange = (e) => {
    setFilterQuery(e.target.value);
    debounceFn(e.target.value)
  }
  

  

  return (
    <div className='py-1 pe-4'>

      <InputGroup>
        <span
          className={`${styles.searchIcon}`}
        >
          {<MdOutlineSearch />}
        </span>
        <Form.Control
          id='password'
          className={styles.searchFilter}
          name="tableSearch"
          onChange={handleSearchChange}
          value={filterQuery}
          placeholder={placeHolder}
        />
      </InputGroup>
    </div >
  )
}
