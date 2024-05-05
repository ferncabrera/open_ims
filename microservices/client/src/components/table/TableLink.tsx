import React from 'react'
import { Link } from 'react-router-dom';
import { entityState } from '../../atoms/state';
import { useRecoilState } from 'recoil';

// this component allows you to set custom react components in your table schema cells with default (required support) for entity state via recoil.

interface ITableLinkProps {
    children: React.ReactNode;
    redirectTo: string;
    action: "create" | "update" | "read" | "delete" | null;
    category: string;
    id?: string;
}

export const TableLink = (props: ITableLinkProps) => {

    const [entity, setEntity] = useRecoilState(entityState);

    const handleClick = () => {
        setEntity({
            action: props.action,
            category: props.category,
            path: props.redirectTo,
            id: props.id || null
        });

    };

    return (
        <Link
            to={props.redirectTo}
            onClick={handleClick}
        >
            {props.children}
        </Link>
    )
}
