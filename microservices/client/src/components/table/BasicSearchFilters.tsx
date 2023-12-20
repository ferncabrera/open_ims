import React, { useState } from 'react';
import { InputGroup, Form } from 'react-bootstrap';
import { MdOutlineSearch } from "react-icons/md";

import styles from "./BasicSearchFilters.module.scss";


export const BasicSearchFilters = () => {

  const [filterQuery, setFilterQuery] = useState('')

  return (
    <div className='py-4 px-4'>

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
          onChange={(e) => setFilterQuery(e.target.value)} // need to handle search filtering from back-end
          value={filterQuery}
          placeholder='Search by parameter'
        />
      </InputGroup>
    </div >
  )
}
