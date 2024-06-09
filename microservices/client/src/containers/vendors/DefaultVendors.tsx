import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { CCGTable } from '../../components/table/CCGTable';
import { PillButton } from '../../components/buttons/PillButton';
import { MdOutlinePictureAsPdf } from 'react-icons/md';
import { FaRegTrashAlt } from "react-icons/fa";
import { Row, Col } from 'react-bootstrap';
import { Columns } from './TableSchema'
import { getJSONResponse, sendDeleteRequest } from '../../utilities/apiHelpers';
import { breadcrumbsState, bannerState, entityState } from '../../atoms/state';
import { useRecoilState } from 'recoil';
import { Link } from 'react-router-dom';
import _ from 'lodash';

export const DefaultVendors = () => {

  const [responseData, setResponseData] = useState<any>([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [disableDelete, setDisableDelete] = useState(true);
  const [breadcrumbState, setBreadcrumb] = useRecoilState(breadcrumbsState);
  const [banner, setBannerState] = useRecoilState(bannerState);
  const [entity, setEntity] = useRecoilState(entityState);

  const navigate = useNavigate();

  useEffect(() => {
    setBreadcrumb({ pathArr: [<Link to='/ccg/vendors'>Vendors</Link>] })
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
  }, [responseData]);

  const getDataList = async (pageSize, pageIndex, searchFilter = {}) => {
    const searchQuery = JSON.stringify(searchFilter);
    const response: any = await getJSONResponse({ endpoint: '/api/server/vendors', params: { pageSize, pageIndex, searchQuery } });
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
    const res1: any = await sendDeleteRequest({ endpoint: '/api/server/vendors', data: selectedIds });
    await getDataList(pageSize, pageIndex, JSON.parse(searchQuery));
    if (res1.status === 200) {
      setBannerState({ message: 'Selected Vendor(s) deleted', variant: 'success' });
    } else {
      setBannerState({ message: 'Failed to delete Vendor(s)', variant: 'danger' });
      return
    }
    setSelectedIds(null);
  }

  const createVendor = () => {
    setEntity({
      action: "create",
      category: "vendors",
      path: `/ccg/vendors/create/new`,
      id: null
    });
    navigate('/ccg/vendors/create/new')
  }

  return (

    <div className='mt-3 mb-5 mx-3'>
      <Row className='mb-2 justify-content-end'>
        <Col>
          <h2>Vendors</h2>
        </Col>
        <Col className='d-flex justify-content-end' xs={7} >
          <PillButton onClick={null} className='me-2' text='Export' color='standard' icon={<MdOutlinePictureAsPdf />} />
          <PillButton onClick={deleteMultiple} disabled={disableDelete} className='me-2' text='Delete' color='standard' icon={<FaRegTrashAlt />} />
          <PillButton onClick={createVendor} className='me-1' text='+ Create Vendor' color='blue' />
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
        searchPlaceholder='Search by Parameter'
      />
    </div>
  )
}
