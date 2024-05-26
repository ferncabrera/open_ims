import React, { useState, useEffect } from 'react'
import { CrudForm } from "../../components/forms/CrudForm";
import { PillButton } from '../../components/buttons/PillButton';
import { getJSONResponse, sendDeleteRequest } from '../../utilities/apiHelpers';
import { Row, Col } from "react-bootstrap";
import { hasEmptyKeys } from '../../utilities/helpers/functions';
import { CCGTable } from '../../components/table/CCGTable';
import { Columns } from "./ReadTableSchema";
import { useRecoilState } from 'recoil';
import { breadcrumbsState, bannerState, entityState } from '../../atoms/state';
import { MdOutlineEdit, MdOutlinePictureAsPdf } from "react-icons/md";
import { FaRegTrashAlt } from "react-icons/fa";
import { useNavigate } from 'react-router';

import _ from 'lodash';
import { response } from 'msw';

interface IReadCustomerProps {
  customerId: number;
}

interface ICustomerData {
  vendor: string;
  id: number;
  companyName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  netTerms: any;
  shipping: {
    address1: string;
    address2: string;
    city: string;
    province: string;
    country: string;
    postalCode: string;
  };
  billing: {
    address1: string;
    address2: string;
    city: string;
    province: string;
    country: string;
    postalCode: string;
  }
}

const initialCustomerData = {
  vendor: '',
  id: null,
  companyName: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  netTerms: '',
  shipping: {
    address1: '',
    address2: '',
    city: '',
    province: '',
    country: '',
    postalCode: '',
  },
  billing: {
    address1: '',
    address2: '',
    city: '',
    province: '',
    country: '',
    postalCode: '',
  }
}

export const ReadCustomer = (props: IReadCustomerProps) => {

  const customerId = props.customerId;
  const basicInfo = ['Customer ID', 'Company Name', 'Contact Name', 'Email', 'Phone', 'Vendor', 'Net Terms'];

  const navigate = useNavigate();
  const [breadcrumbs, setBreadcrumb] = useRecoilState(breadcrumbsState);
  const [banner, setBanner] = useRecoilState(bannerState);
  const [entity, setEntity] = useRecoilState<IEntityState>(entityState);
  const [customerData, setCustomerData] = useState<ICustomerData>(initialCustomerData);
  const [tableData, setTableData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(true);

  useEffect(() => {
    getCustomerData();
    getInvoiceData(10, 0);
  }, []);

  const getCustomerData = async () => {
    const response: IResponse = await getJSONResponse({ endpoint: '/api/server/customer', params: { id: customerId } });
    setCustomerData(response.data);
    setBreadcrumb({pathArr:[...breadcrumbs.pathArr, <span>{response.data.companyName}</span> ]})
    setIsLoading(false);
  };

  const getInvoiceData = async (pagesize, pageindex, searchQuery = '') => {
    const response: IResponse = await getJSONResponse({ endpoint: '/api/server/invoice', params: { id: customerId, pagesize, pageindex, searchQuery } });
    setTableData(response.data);
    setTableLoading(false);
  }

  const handleDelete = async (customerId) => {
      const response: any = await sendDeleteRequest({endpoint: '/api/server/customer', data: {customer_id: customerId}});
      if (response.status === 200) {
        setBanner({message: response.message, variant:'success'});
      } else {
        setBanner({message: 'Something went wrong with deleting customer', variant: 'danger'});
        return
      }
      
    navigate('/ccg/customers');
  };

  const handleEdit = (customerId: number) => {
    setEntity({
      action: 'update',
      category: 'customers',
      path: `/ccg/customers/edit/${customerId}`,
      id: Number(customerId)
    });
  };

  const RenderCustomerBasicInfo = () => {

    const jsxArray = new Array(6).fill(null);

    if (customerData.companyName) {
      const jsxFrame = (label, value) => {
        return (
          <Row className='mb-2' key={label}>
            <Col sm={4}>{label}</Col>
            <Col> {value} </Col>
          </Row>
        )
      };

      _.forEach(basicInfo, info => {
        switch (info) {
          case 'Customer ID':
            jsxArray[0] = jsxFrame(info, customerData.id);
            break;

          case 'Company Name':
            jsxArray[1] = jsxFrame(info, customerData.companyName);
            break;

          case 'Contact Name':
            jsxArray[2] = jsxFrame(info, customerData.firstName + ' ' + customerData.lastName);
            break;

          case 'Email':
            jsxArray[3] = jsxFrame(info, customerData.email);
            break;

          case 'Phone':
            jsxArray[4] = jsxFrame(info, customerData.phone);
            break;

          case 'Net Terms':
            jsxArray[5] = jsxFrame(info, customerData.netTerms);
            break;
        }

      });

      return jsxArray;


    } else {
      return null
    }
  };

  const RenderAddressInfo = (addressType: string) => {
    // address type can be 'Billing' or 'Shipping'

    const jsxFrame = (addressType, addressData) => {
      return (
        <Row>
          <Col sm={4}>{`${addressType} Address:`}</Col>
          <Col className='no-space'>
            {/* <Row> */}
            <p className=''>{addressData.customerAddressName}</p>
            <p className='' >{addressData.address1}</p>
            <p className='' >{addressData.address2}</p>
            <p className='' >{addressData.city}</p>
            <p className='' >{addressData.country}</p>
            <p className='' >{addressData.postalCode}</p>
            <p className='' >{addressData.province}</p>
            {/* </Row> */}
          </Col>
        </Row>
      )
    }

    if (addressType === 'Shipping') {
      return jsxFrame(addressType, customerData.shipping)
    } else {
      return jsxFrame(addressType, customerData.billing)
    }


  }

  return (
    <>
    <Row className=' justify-content-end'>
        <Col className='d-flex justify-content-end' xs={7} >
            <PillButton className='me-2' onClick={null} text='Export' color='standard' icon={<MdOutlinePictureAsPdf />} />
            <PillButton className='me-2' onClick={() => handleDelete(customerData.id)} text='Delete' color='standard' icon={<FaRegTrashAlt />} />
            <PillButton className='me-1' onClick={() => handleEdit(customerData.id)} text='Edit Customer' color='blue' icon={<MdOutlineEdit/>} />
        </Col>
      </Row>
      <CrudForm
        header={customerData.companyName || 'Retrieving...'}
        handleSubmit={() => null}
      >
        {!isLoading &&
          <Row className='mt-5'>
            <Col>
              {RenderCustomerBasicInfo()}
            </Col>
            <Col>
              {!hasEmptyKeys(customerData.shipping) &&
                <div>
                  {RenderAddressInfo('Shipping')}
                  < br />
                </div>
              }
              {!hasEmptyKeys(customerData.billing) &&
                <div>
                  {RenderAddressInfo('Billing')}
                </div>
              }
            </Col>
          </Row>
        }
        <div className='my-4 pt-5' style={{marginTop: "70px"}}>

          <CCGTable
            columns={Columns}
            data={_.get(tableData, 'invoices', [])}
            fetchDataFunction={getInvoiceData}
            totalCount={_.get(tableData, 'totalCount', 0)}
            pageSize={_.get(tableData, 'pagesize', 0)}
            pageIndex={_.get(tableData, 'pageindex', 0)}
            searchPlaceholder='Search'
          />
        </div>
      </CrudForm>
    </>
  )
}
