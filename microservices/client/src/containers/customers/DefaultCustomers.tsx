import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { CCGTable } from '../../components/table/CCGTable';
import { PillButton } from '../../components/buttons/PillButton';
import { MdOutlinePictureAsPdf } from 'react-icons/md';
import { FaRegTrashAlt } from "react-icons/fa";
import { Row, Col } from 'react-bootstrap';
import { Columns } from "./TableSchema";
import { getJSONResponse, sendDeleteRequest } from '../../utilities/apiHelpers';
import { breadcrumbsState, bannerState, entityState } from '../../atoms/atoms';
import { useAtom } from 'jotai';
import { Link } from 'react-router-dom';
import _ from 'lodash';

export const DefaultCustomers = () => {

  const [responseData, setResponseData] = useState<any>([]);
  const [selectedIds, setSelectedIds] = useState <Array<any>>([]);
  const [disableDelete, setDisableDelete] = useState(true);
  const [breadcrumbState, setBreadcrumb] = useAtom(breadcrumbsState);
  const [banner, setBannerState] = useAtom(bannerState);
  const [entity, setEntity] = useAtom(entityState);

  const navigate = useNavigate();

  useEffect(() => {
    setBreadcrumb({ pathArr: [<Link to='/ccg/customers'>Customers</Link>] })
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

    if (Math.ceil(Number(responseData.total) / Number(responseData.pagesize)) < ((Number(responseData.pageindex) + 1))
      && (responseData.total !== null) && Number(responseData.pageindex > 0)) {
      const searchQuery = JSON.parse(responseData.searchquery)
      getDataList(responseData.pagesize, 0, searchQuery).catch((e) => console.log(e))
    }
  }, [responseData])

  const getDataList = async (pageSize, pageIndex, searchQuery = {}) => {
    const search = JSON.stringify(searchQuery);
    const response: any = await getJSONResponse({ endpoint: '/api/server/customers', params: { pageSize, pageIndex, searchQuery: search } });
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
    const prevParams = [_.get(responseData, 'pagesize', 0), _.get(responseData, 'pageindex', 0), _.get(responseData, 'searchquery', "{}")]
    const [pageSize, pageIndex, searchQuery] = prevParams;
    const res1: any = await sendDeleteRequest({ endpoint: '/api/server/customers', data: selectedIds });
    await getDataList(pageSize, pageIndex, JSON.parse(searchQuery));
    if (res1.status === 200) {
      setBannerState({ message: 'Selected Customer(s) deleted', variant: 'success' });
    } else {
      setBannerState({ message: 'Failed to delete Customer(s)', variant: 'danger' });
      return
    }
    setSelectedIds([]);
  }

  const createCustomer = () => {
    setEntity({
      action: "create",
      category: "customers",
      path: `/ccg/customers/create/new`,
      id: null
    });
    navigate('/ccg/customers/create/new')
  }

  return (

    <div className='mt-3 mb-5 mx-3'>
      <Row className='mb-2 justify-content-end'>
        <Col>
          <h2>Customers</h2>
        </Col>
        <Col className='d-flex justify-content-end' xs={7} >
          <PillButton onClick={() => console.log("todo")} className='me-2' text='Export' color='standard' icon={<MdOutlinePictureAsPdf />} />
          <PillButton onClick={deleteMultiple} disabled={disableDelete} className='me-2' text='Delete' color='standard' icon={<FaRegTrashAlt />} />
          <PillButton onClick={createCustomer} className='me-1' text='+ Create Customer' color='blue' />
        </Col>
      </Row>
      <CCGTable
        columns={Columns}
        data={_.get(responseData, 'data', [])}
        totalCount={_.get(responseData, 'total', 0)}
        fetchDataFunction={getDataList}
        pageSize={_.get(responseData, 'pagesize', 0)}
        pageIndex={_.get(responseData, 'pageindex', 0)}
        handleSelectedRows={handleSelectedRows}
        searchPlaceholder='Search by parameter'
      />
    </div>
  )
}
