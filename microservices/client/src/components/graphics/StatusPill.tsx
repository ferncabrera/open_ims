import React from 'react'
import { useEffect, useState } from 'react';
import styles from "./StatusPill.module.scss";

interface IStatusPill {
  text: string;
  color: 'green' | 'yellow' | 'red';
}

export const StatusPill = (props: IStatusPill) => {

  const { text, color } = props;
  
  const [colorStyle, setColorStyle] = useState<string>()

  useEffect(() => {
    switch (color) {
      case 'green':
        setColorStyle(styles.green);
        break;
      case 'yellow':
        setColorStyle(styles.yellow);
        break;
      case 'red':
        setColorStyle(styles.red);
        break;
    }
  }, [color])

  return (
    <div className={`${colorStyle} ${styles.format}`}>
      {text}
    </div>
  )
}
