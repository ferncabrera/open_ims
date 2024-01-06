import React from 'react'
import { IconType } from 'react-icons';



interface PillButtonProps {
    label: string;
    icon: IconType;
    onClick: () => void;
}

export const PillButtons1 = ({ label, icon: Icon, onClick }) => {
    return (
        <button className='pill-button1' onClick={onClick}>
            <span className='icon-container'>
                <Icon />
            </span>
            <span className='label1'>{label}</span>
        </button>
    )
}
export const PillButtons2 = ({ label, onClick }) => {
    return (
        <button className='pill-button2' onClick={onClick}>
            <span className='label2'>{label}</span>
        </button>
    )
}
