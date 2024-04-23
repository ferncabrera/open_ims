import React from 'react'
import { Button } from 'react-bootstrap';

interface IPillButton {
  className?: string;
  text: string;
  color: 'standard' | 'blue';
  disabled? : boolean;
  icon?: any;
}

export const PillButton = (props: IPillButton) => {

  const { text, color, disabled= false, className = '' } = props;

  const colorType = color === 'standard' ? 'btn-white' : 'btn-primary';
  return (
    <>
      <Button 
      className={`${colorType} ${className} btn-auto px-4`}
      disabled = {disabled}
      >
        {props.icon}
        <span className={props.icon ? 'ps-2' : ''}>
          {text}
        </span>
      </Button>
    </>
  )
}
