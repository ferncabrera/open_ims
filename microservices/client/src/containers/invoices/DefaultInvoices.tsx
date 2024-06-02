import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { CCGTable } from '../../components/table/CCGTable';
import { PillButton } from '../../components/buttons/PillButton';
import { MdOutlinePictureAsPdf } from 'react-icons/md';
import { FaRegTrashAlt } from "react-icons/fa";
import { Row, Col } from 'react-bootstrap';
import {Columns} from './TableSchema'
import { getJSONResponse, sendDeleteRequest } from '../../utilities/apiHelpers';
import { breadcrumbsState, bannerState, entityState } from '../../atoms/state';
import { useRecoilState } from 'recoil';
import { Link } from 'react-router-dom';
import _ from 'lodash';

export const DefaultInvoices = () => {

  const [responseData, setResponseData] = useState<any>([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [disableDelete, setDisableDelete] = useState(true);
  const [breadcrumbState, setBreadcrumb] = useRecoilState(breadcrumbsState);
  const [banner, setBannerState] = useRecoilState(bannerState);
  const [entity, setEntity] = useRecoilState(entityState);

  const navigate = useNavigate();

  useEffect(() => {
    setBreadcrumb({ pathArr: [<Link to='/ccg/invoices'>Invoices</Link>] })
    getDataList(10, 0).catch((e) => console.log(e))
  }, []);

  useEffect(() => {
    if (!_.isEmpty(selectedIds)) {
      setDisableDelete(false)
    } else {
      setDisableDelete(true)
    }
  }, [selectedIds]);

  useEffect(() => {

    if (Math.ceil(Number(responseData.total)/Number(responseData.pagesize)) < ((Number(responseData.pageindex) + 1))) {
      getDataList(responseData.pagesize, 0, responseData.searchquery).catch((e)=> console.log(e))
    }
  }, [responseData])

  const getDataList = async (pageSize, pageIndex, searchParams = {}) => {
    const searchQuery = JSON.stringify(searchParams)
    const response: any = await getJSONResponse({ endpoint: '/api/server/invoices', params: { pageSize, pageIndex, searchQuery } });
    if (response.status !== 200) {
      setBannerState({message: response.message, variant: 'danger'})
    }
    setResponseData(response);
  };

  const handleSelectedRows = (selectedRows) => {
    const id_keys = Object.keys(selectedRows);
    if (!_.isEmpty(id_keys)) {
      setDisableDelete(false)
    } else {
      setDisableDelete(true)
    }
    setSelectedIds(id_keys)
  }

  const deleteMultiple = async () => {
    const prevParams = [_.get(responseData, 'pagesize', 0), _.get(responseData, 'pageindex', 0), _.get(responseData, 'searchquery', '')]
    const [pageSize, pageIndex, searchQuery] = prevParams;
      const res1: any = await sendDeleteRequest({endpoint: '/api/server/invoices', data: selectedIds});
      const searchParams = JSON.stringify(searchQuery);
      await getDataList(pageSize, pageIndex, searchParams);
      if (res1.status === 200) {
        setBannerState({message: 'Selected Invoice(s) deleted', variant: 'success'});
      } else {
        setBannerState({message: 'Failed to delete Invoice(s)', variant: 'danger'});
        return
      }
    setSelectedIds(null);
  }

  const createInvoice = () => {
    setEntity({
      action: "create",
      category: "invoices",
      path: `/ccg/invoices/create/new`,
      id: null
    });
    navigate('/ccg/invoices/create/new')
  }

  return (

    <div className='mt-5 mb-5 mx-3'>
      <Row className='mb-2 justify-content-end'>
        <Col className='d-flex justify-content-end' xs={7} >
            <PillButton onClick={null} className='me-2' text='Export' color='standard' icon={<MdOutlinePictureAsPdf />} />
            <PillButton onClick={deleteMultiple} disabled={disableDelete} className='me-2' text='Delete' color='standard' icon={<FaRegTrashAlt />} />
            <PillButton onClick={createInvoice} className='me-1' text='+ Create Invoice' color='blue' />
        </Col>
      </Row>
      <CCGTable
        columns={Columns}
        data={_.get(responseData, 'data.invoices', [])}
        totalCount={_.get(responseData, 'data.totalCount', 0)}
        fetchDataFunction={getDataList}
        pageSize={_.get(responseData, 'data.pagesize', 0)}
        pageIndex={_.get(responseData, 'data.pageindex', 0)}
        handleSelectedRows={handleSelectedRows}
        searchPlaceholder='Search by Number, Status, or Amount'
        filters={[{label: 'Date', type: 'date', id: 0}, {label: 'Company Name', type: 'input', id: 1}]}
      />
    </div>
  )
}
