import React, { useState, useEffect } from 'react'
import { CrudForm } from "../../components/forms/CrudForm";
import { getJSONResponse } from '../../utilities/apiHelpers';
import { Row, Col } from "react-bootstrap";
import { hasEmptyKeys } from '../../utilities/helpers/functions';
import _ from 'lodash';

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
  const addressInfo = ['']

  const [customerData, setCustomerData] = useState<ICustomerData>(initialCustomerData);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getCustomerData();
  }, []);

  const getCustomerData = async () => {
    const response: IResponse = await getJSONResponse({ endpoint: '/api/server/customer', params: { id: customerId } });
    setCustomerData(response.data);
    setIsLoading(false);
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
            <p className=''>Name? Need name change here in DB</p>
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
      </CrudForm>
    </>
  )
}
