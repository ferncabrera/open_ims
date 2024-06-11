import React, { useState, useEffect } from 'react';
import { CrudForm } from '../../components/forms/CrudForm';
import { PillButton } from '../../components/buttons/PillButton';
import { Row, Col } from 'react-bootstrap';

import { MdOutlinePictureAsPdf, MdOutlineEdit } from 'react-icons/md';
import { FaRegTrashAlt } from 'react-icons/fa';

import { getJSONResponse } from '../../utilities/apiHelpers';
import { useRecoilState } from 'recoil';
import { breadcrumbsState, bannerState } from '../../atoms/state';

interface IUserProps {
    userId: number | null;
};

interface IUserData {
    userId: number | null;
    name: string;
    type: string;
    email: string;
    dateCreated: string;
};

const initialUserData: IUserData = {
    userId: null,
    name: '',
    type: '',
    email: '',
    dateCreated: '',
}

export const ReadUser = (props: IUserProps) => {

    const {userId} = props;

    const [userData, setUserData] = useState<IUserData>(initialUserData);


    const handleDelete = (id) => null;
    const handleEdit = (id) => null;

    return (
        <div className='mx-3'>
            <Row className=' mt-3 justify-content-end'>
                <Col className='d-flex align-items-center'>
                    <h2>Users</h2>
                </Col>
                <Col className='d-flex justify-content-end' xs={7} >
                    <PillButton className='me-2' onClick={null} text='Export' color='standard' icon={<MdOutlinePictureAsPdf />} />
                    <PillButton className='me-2' onClick={() => handleDelete(userId)} text='Delete' color='standard' icon={<FaRegTrashAlt />} />
                    <PillButton className='me-1' onClick={() => handleEdit(userId)} text='Edit User' color='blue' icon={<MdOutlineEdit />} />
                </Col>
            </Row>
            <CrudForm
                header="User's name here"
                handleSubmit={null}
            >
                <div>Content</div>
            </CrudForm>
        </div>
    )
}
