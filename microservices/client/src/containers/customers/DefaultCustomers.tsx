import React, { useEffect, useState } from 'react'
import { CCGTable } from '../../components/table/CCGTable';
import { PillButton } from '../../components/buttons/PillButton';
import { MdOutlinePictureAsPdf } from 'react-icons/md';
import { FaRegTrashAlt } from "react-icons/fa";
import { Row, Col } from 'react-bootstrap';
import { Columns } from "./TableSchema";
import { getJSONResponse } from '../../utilities/apiHelpers';
import { breadcrumbsState } from '../../atoms/state';
import { useRecoilState } from 'recoil';
import { Link } from 'react-router-dom';
import _ from 'lodash';

export const DefaultCustomers = () => {

  const [responseData, setResponseData] = useState<any>([]);
  const [breadcrumbState, setBreadcrumb] = useRecoilState(breadcrumbsState)

  useEffect(() => {
    setBreadcrumb({ pathArr: [<Link to='/ccg/customers'>Customers</Link>] })
    getDataList(10, 0).catch((e) => console.log(e))
  }, []);

  const getDataList = async (pageSize, pageIndex, searchQuery = '') => {
    const response: any = await getJSONResponse({ endpoint: '/api/server/customers', params: { pageSize, pageIndex, searchQuery } });
    setResponseData(response);
  };

  return (

    <div className='mt-5 mb-5 mx-3'>
      <Row className='mb-2 justify-content-end'>
        <Col className='d-flex justify-content-end' xs={7} >
            <PillButton className='me-2' text='Export' color='standard' icon={<MdOutlinePictureAsPdf />} />
            <PillButton className='me-2' text='Delete' color='standard' icon={<FaRegTrashAlt />} />
            <PillButton className='me-1' text='+ Create Customer' color='blue' />
        </Col>
      </Row>
      <CCGTable
        columns={Columns}
        data={_.get(responseData, 'data', [])}
        totalCount={_.get(responseData, 'total', 0)}
        fetchDataFunction={getDataList}
        pageSize={_.get(responseData, 'pagesize', 0)}
        pageIndex={_.get(responseData, 'pageindex', 0)}
      />
    </div>
  )
}
