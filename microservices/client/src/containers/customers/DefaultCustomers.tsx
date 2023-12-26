import React, {useEffect, useState} from 'react'
import { CCGTable } from '../../components/table/CCGTable';
import { Columns } from "./TableSchema";
import { getJSONResponse } from '../../utilities/apiHelpers';
import _ from 'lodash';

export const DefaultCustomers = () => {

  const [responseData, setResponseData] = useState<any>([]);

  useEffect(() => {
    getData(10, 0).catch((e) => console.log(e))
  }, []);

  const getData = async (pageSize, pageIndex, searchQuery = '') => {
    const response: any = await getJSONResponse({endpoint: '/api/server/customers', params: {pageSize, pageIndex, searchQuery}});
    setResponseData(response);
  };

  return (

    <div className='mt-5 mb-5 mx-3'>
      <CCGTable
        columns={Columns}
        data={_.get(responseData, 'data', [])}
        totalCount={_.get(responseData, 'total', 0)}
        fetchDataFunction={getData}
        pageSize={_.get(responseData, 'pagesize', 0)}
        pageIndex={_.get(responseData, 'pageindex', 0)}
      />
    </div>
  )
}
