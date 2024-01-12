import React, { useEffect, useState } from 'react';
import { getJSONResponse, sendPatchRequest } from '../../utilities/apiHelpers';
import { CrudForm } from '../../components/forms/CrudForm';
import { Form, Row, Col, Spinner } from 'react-bootstrap';
import { hasEmptyKeys } from '../../utilities/helpers/functions';
import _ from 'lodash';

interface IEditCustomerProps {
  customerId: string;
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

export const EditCustomer = (props: IEditCustomerProps) => {

  const { customerId } = props;

  const [isLoading, setIsLoading] = useState(true);
  const [isCheckedBilling, setIsCheckedBilling] = useState(false);
  const [vendorList, setVendorList] = useState([]);
  const [initialVendor, setInitialVendor] = useState('');
  const [customerData, setCustomerData] = useState<ICustomerData>(
    {
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
  );

  useEffect(() => {
    setIsLoading(true);
    Promise.all([getCustomerData(), getAllAvailableVendors()])
      .then(() => setIsLoading(false))
      .catch((e) => console.log(e, 'Error! Have this display in the banner please'));
  }, []);

  useEffect(() => {
    if (isCheckedBilling) {
      handleCheck(isCheckedBilling);
    }
  }, [customerData.shipping]);

  const getCustomerData = async () => {
    const response: IResponse = await getJSONResponse({ endpoint: '/api/server/customer', params: { id: customerId } });
    setInitialVendor(response.data.vendor);
    setCustomerData(response.data);
  };

  const getAllAvailableVendors = async () => {
    const response: IResponse = await getJSONResponse({ endpoint: '/api/server/available-vendors' });
    setVendorList(response.data);
  }

  const handleSave = async () => {
    try {
      const data = { ...customerData };
      if (hasEmptyKeys(data.billing)) {
        delete data.billing;
      }
      if (hasEmptyKeys(data.shipping)) {
        delete data.shipping;
      }
      await sendPatchRequest({ endpoint: '/api/server/customer', data });
    } catch(e) {
      console.log(e, '!Error! we need to display this on banner for the user');
    }
    
  }

  const handleCheck = (isChecked) => {
    if (isChecked) {
      setIsCheckedBilling(true);
      setCustomerData({ ...customerData, billing: { ...customerData.shipping } });
    } else {
      setIsCheckedBilling(false);
      setCustomerData({
        ...customerData, billing: {
          address1: '',
          address2: '',
          city: '',
          province: '',
          country: '',
          postalCode: '',
        }
      })
    }
  }

  return (
    <>
      {isLoading &&
        <div className='center-content-page'>
          <Spinner />
        </div>
      }
      {!isLoading &&
        <CrudForm
          header='Edit Customer'
          handleSave={handleSave}
        >
          <div id='form-content'>
            <Form className='my-5 pt-2'>

              <Form.Group as={Row} className='mb-5' >
                <Form.Label className='fw-normal' column md={2} sm={2} xs={2}>
                  Connect to Existing Vendor:
                </Form.Label>
                <Col className='mrp-50' md={3}>
                  <Form.Select
                    as={Col}
                    value={customerData.vendor}
                    onChange={(e) => setCustomerData({ ...customerData, vendor: e.target.value })}
                  >
                    <option value={''}>Select Available Vendor</option>
                    {initialVendor && <option value={initialVendor}>{initialVendor}</option>}

                    {!_.isEmpty(vendorList) && _.map(vendorList, (vendor) => {
                      return (<option value={vendor.company_name}> {vendor.company_name}</option>)
                    })}
                  </Form.Select>
                </Col>
              </Form.Group>

              <Form.Group as={Row} className='mt-3 mb-3'>
                <Form.Label className='fw-normal' column lg={2}>
                  Customer ID:
                </Form.Label>
                <Col className='mrp-50' md={3}>
                  <strong>{customerId}</strong>
                </Col>
              </Form.Group>

              <Form.Group as={Row} className='mb-3'>
                <Form.Label className='fw-normal' column lg={2}>
                  Company Name:
                </Form.Label>
                <Col className='mrp-50' md={3}>
                  <Form.Control
                    type='input'
                    value={customerData.companyName}
                    onChange={(e) => setCustomerData({ ...customerData, companyName: e.target.value })}
                  />
                </Col>
              </Form.Group>

              <Form.Group as={Row} className='mb-3'>
                <Form.Label className='fw-normal' column lg={2}>
                  First Name:
                </Form.Label>
                <Col className='mrp-50' md={3}>
                  <Form.Control
                    type='input'
                    value={customerData.firstName}
                    onChange={(e) => setCustomerData({ ...customerData, firstName: e.target.value })}
                  />
                </Col>
              </Form.Group>

              <Form.Group as={Row} className='mb-3'>
                <Form.Label className='fw-normal' column lg={2}>
                  Last Name:
                </Form.Label>
                <Col className='mrp-50' md={3}>
                  <Form.Control
                    type='input'
                    value={customerData.lastName}
                    onChange={(e) => setCustomerData({ ...customerData, lastName: e.target.value })}
                  />
                </Col>
              </Form.Group>

              <Form.Group as={Row} className='mb-3'>
                <Form.Label className='fw-normal' column lg={2}>
                  Email:
                </Form.Label>
                <Col className='mrp-50' md={3}>
                  <Form.Control
                    type='input'
                    value={customerData.email}
                    onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
                  />
                </Col>
              </Form.Group>

              <Form.Group as={Row} className='mb-3'>
                <Form.Label className='fw-normal' column lg={2}>
                  Phone:
                </Form.Label>
                <Col className='mrp-50' md={3}>
                  <Form.Control
                    type='input'
                    value={customerData.phone}
                    onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
                  />
                </Col>
              </Form.Group>

              <Form.Group as={Row} className='mb-3'>
                <Form.Label className='fw-normal' column lg={2}>
                  Net Terms:
                </Form.Label>
                <Col className='mrp-50' md={3}>
                  <Form.Control
                    type='input'
                    value={customerData.netTerms}
                    onChange={(e) => setCustomerData({ ...customerData, netTerms: e.target.value })}
                  />
                </Col>
              </Form.Group>

              {/* Shipping address and Billing Address Sections */}
              <Row className='mt-5'>
                <Col>
                  <Form.Group as={Row} className='mb-3'>
                    <Form.Label className='fw-normal' column lg={4}>
                      Shipping Address:
                    </Form.Label>
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group as={Row} className='mb-3'>
                    <Form.Label className={'fw-normal'} column sm={4}>
                      Billing Address:
                    </Form.Label>
                    <Col className='mrp-20 d-flex align-items-end'>
                      <Form.Check
                        label="Same as shipping address"
                        onChange={(e) => handleCheck(e.target.checked)}
                      />
                    </Col>
                  </Form.Group>

                </Col>
              </Row>

              <Row className=''>
                <Col>
                  <Form.Group as={Row} className='mb-1'>
                    <Form.Label className='fw-normal' column lg={4}>
                      Address Line 1:
                    </Form.Label>
                    <Col className='mr' md={6}>
                      <Form.Control
                        type='input'
                        value={customerData.shipping.address1}
                        onChange={(e) => setCustomerData({ ...customerData, shipping: { ...customerData.shipping, address1: e.target.value } })}
                      />
                    </Col>
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group as={Row} className='mb-1'>
                    <Form.Label className={'fw-normal'} column sm={4}>
                      Address Line 1:
                    </Form.Label>
                    <Col className='mrp-20'>
                      <Form.Control
                        type='input'
                        value={customerData.billing.address1}
                        disabled={isCheckedBilling}
                        onChange={(e) => setCustomerData({ ...customerData, billing: { ...customerData.billing, address1: e.target.value } })}
                      />
                    </Col>
                  </Form.Group>

                </Col>
              </Row>

              <Row className=''>
                <Col>
                  <Form.Group as={Row} className='mb-1'>
                    <Form.Label className='fw-normal' column lg={4}>
                      Address Line 2:
                    </Form.Label>
                    <Col className='mr' md={6}>
                      <Form.Control
                        type='input'
                        value={customerData.shipping.address2}
                        onChange={(e) => setCustomerData({ ...customerData, shipping: { ...customerData.shipping, address2: e.target.value } })}
                      />
                    </Col>
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group as={Row} className='mb-1'>
                    <Form.Label className={'fw-normal'} column sm={4}>
                      Address Line 2:
                    </Form.Label>
                    <Col className='mrp-20'>
                      <Form.Control
                        type='input'
                        value={customerData.billing.address2}
                        disabled={isCheckedBilling}
                        onChange={(e) => setCustomerData({ ...customerData, billing: { ...customerData.billing, address2: e.target.value } })}
                      />
                    </Col>
                  </Form.Group>

                </Col>
              </Row>

              <Row className=''>
                <Col>
                  <Form.Group as={Row} className='mb-1'>
                    <Form.Label className='fw-normal' column lg={4}>
                      City:
                    </Form.Label>
                    <Col className='mr' md={6}>
                      <Form.Control
                        type='input'
                        value={customerData.shipping.city}
                        onChange={(e) => setCustomerData({ ...customerData, shipping: { ...customerData.shipping, city: e.target.value } })}
                      />
                    </Col>
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group as={Row} className='mb-1'>
                    <Form.Label className={'fw-normal'} column sm={4}>
                      City:
                    </Form.Label>
                    <Col className='mrp-20'>
                      <Form.Control
                        type='input'
                        value={customerData.billing.city}
                        disabled={isCheckedBilling}
                        onChange={(e) => setCustomerData({ ...customerData, billing: { ...customerData.billing, city: e.target.value } })}
                      />
                    </Col>
                  </Form.Group>

                </Col>
              </Row>

              <Row className=''>
                <Col>
                  <Form.Group as={Row} className='mb-1'>
                    <Form.Label className='fw-normal' column lg={4}>
                      Province:
                    </Form.Label>
                    <Col className='mr' md={6}>
                      <Form.Control
                        type='input'
                        value={customerData.shipping.province}
                        onChange={(e) => setCustomerData({ ...customerData, shipping: { ...customerData.shipping, province: e.target.value } })}
                      />
                    </Col>
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group as={Row} className='mb-1'>
                    <Form.Label className={'fw-normal'} column sm={4}>
                      Province:
                    </Form.Label>
                    <Col className='mrp-20'>
                      <Form.Control
                        type='input'
                        value={customerData.billing.province}
                        disabled={isCheckedBilling}
                        onChange={(e) => setCustomerData({ ...customerData, billing: { ...customerData.billing, province: e.target.value } })}
                      />
                    </Col>
                  </Form.Group>

                </Col>
              </Row>

              <Row className=''>
                <Col>
                  <Form.Group as={Row} className='mb-1'>
                    <Form.Label className='fw-normal' column lg={4}>
                      Country:
                    </Form.Label>
                    <Col className='mr' md={6}>
                      <Form.Control
                        type='input'
                        value={customerData.shipping.country}
                        onChange={(e) => setCustomerData({ ...customerData, shipping: { ...customerData.shipping, country: e.target.value } })}
                      />
                    </Col>
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group as={Row} className='mb-1'>
                    <Form.Label className={'fw-normal'} column sm={4}>
                      Country:
                    </Form.Label>
                    <Col className='mrp-20'>
                      <Form.Control
                        type='input'
                        value={customerData.billing.country}
                        disabled={isCheckedBilling}
                        onChange={(e) => setCustomerData({ ...customerData, billing: { ...customerData.billing, country: e.target.value } })}
                      />
                    </Col>
                  </Form.Group>
                </Col>
              </Row>

              <Row className='mt-3'>
                <Col>
                  <Form.Group as={Row} className='mb-1'>
                    <Form.Label className='fw-normal' column lg={4}>
                      Postal Code:
                    </Form.Label>
                    <Col className='mr' md={6}>
                      <Form.Control
                        type='input'
                        value={customerData.shipping.postalCode}
                        onChange={(e) => setCustomerData({ ...customerData, shipping: { ...customerData.shipping, postalCode: e.target.value } })}
                      />
                    </Col>
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group as={Row} className='mb-1'>
                    <Form.Label className={'fw-normal'} column sm={4}>
                      Postal Code:
                    </Form.Label>
                    <Col className='mrp-20'>
                      <Form.Control
                        type='input'
                        value={customerData.billing.postalCode}
                        disabled={isCheckedBilling}
                        onChange={(e) => setCustomerData({ ...customerData, billing: { ...customerData.billing, postalCode: e.target.value } })}
                      />
                    </Col>
                  </Form.Group>

                </Col>
              </Row>


            </Form>
          </div>
        </CrudForm>
      }
    </>
  )
}
