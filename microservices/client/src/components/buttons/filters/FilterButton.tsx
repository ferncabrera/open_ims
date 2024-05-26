import React from 'react'
import { Dropdown } from 'react-bootstrap';
import _ from 'lodash';

interface FilterButton {
  className?: string;
  options: {label: string, type: string}[];
  onSelect: (e: any) => void;
}

export const FilterButton = (props: FilterButton) => {
  const { className, options, onSelect } = props;


  return (
    <>
      <Dropdown>
        <Dropdown.Toggle className={className}>
          + Add Filter
        </Dropdown.Toggle>
        <Dropdown.Menu>
          {_.map(options, (option) => {
            return <Dropdown.Item key={option.label} onClick={() => onSelect(option)}>{option.label}</Dropdown.Item>
          })}
        </Dropdown.Menu>
      </Dropdown>
    </>
  )
}
