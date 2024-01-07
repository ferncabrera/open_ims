import React, { useEffect, useState } from 'react';
import { getJSONResponse } from '../../utilities/apiHelpers';
import { CrudForm } from '../../components/forms/CrudForm';
import { Form, Row, Col, FormGroup } from 'react-bootstrap';

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

  const [customerData, setCustomerData] = useState<ICustomerData>();

  useEffect(() => {
    getCustomerData().catch((e) => null);
  }, []);

  const getCustomerData = async () => {
    const response: IResponse = await getJSONResponse({ endpoint: '/api/server/customer', params: { id: customerId } });
    setCustomerData(response.data);
  }

  const handleSave = () => {
    console.log('handling save function');
  }

  return (
    <>
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
                <Form.Select as={Col}>
                  <option value={''}>Select Vendor</option>
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
                <Form.Control type='input' />
              </Col>
            </Form.Group>

            <Form.Group as={Row} className='mb-3'>
              <Form.Label className='fw-normal' column lg={2}>
                First Name:
              </Form.Label>
              <Col className='mrp-50' md={3}>
                <Form.Control type='input' />
              </Col>
            </Form.Group>

            <Form.Group as={Row} className='mb-3'>
              <Form.Label className='fw-normal' column lg={2}>
                Last Name:
              </Form.Label>
              <Col className='mrp-50' md={3}>
                <Form.Control type='input' />
              </Col>
            </Form.Group>

            <Form.Group as={Row} className='mb-3'>
              <Form.Label className='fw-normal' column lg={2}>
                Email:
              </Form.Label>
              <Col className='mrp-50' md={3}>
                <Form.Control type='input' />
              </Col>
            </Form.Group>

            <Form.Group as={Row} className='mb-3'>
              <Form.Label className='fw-normal' column lg={2}>
                Phone:
              </Form.Label>
              <Col className='mrp-50' md={3}>
                <Form.Control type='input' />
              </Col>
            </Form.Group>

            <Form.Group as={Row} className='mb-3'>
              <Form.Label className='fw-normal' column lg={2}>
                Net Terms:
              </Form.Label>
              <Col className='mrp-50' md={3}>
                <Form.Control type='input' />
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
                    <Form.Check label="Same as shipping address" />
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
                    <Form.Control type='input' />
                  </Col>
                </Form.Group>
              </Col>
              <Col>
                <Form.Group as={Row} className='mb-1'>
                  <Form.Label className={'fw-normal'} column sm={4}>
                    Address Line 1:
                  </Form.Label>
                  <Col className='mrp-20'>
                  <Form.Control type='input' />
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
                    <Form.Control type='input' />
                  </Col>
                </Form.Group>
              </Col>
              <Col>
                <Form.Group as={Row} className='mb-1'>
                  <Form.Label className={'fw-normal'} column sm={4}>
                    Address Line 2:
                  </Form.Label>
                  <Col className='mrp-20'>
                  <Form.Control type='input' />
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
                    <Form.Control type='input' />
                  </Col>
                </Form.Group>
              </Col>
              <Col>
                <Form.Group as={Row} className='mb-1'>
                  <Form.Label className={'fw-normal'} column sm={4}>
                   City:
                  </Form.Label>
                  <Col className='mrp-20'>
                  <Form.Control type='input' />
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
                    <Form.Control type='input' />
                  </Col>
                </Form.Group>
              </Col>
              <Col>
                <Form.Group as={Row} className='mb-1'>
                  <Form.Label className={'fw-normal'} column sm={4}>
                    Province:
                  </Form.Label>
                  <Col className='mrp-20'>
                  <Form.Control type='input' />
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
                    <Form.Control type='input' />
                  </Col>
                </Form.Group>
              </Col>
              <Col>
                <Form.Group as={Row} className='mb-1'>
                  <Form.Label className={'fw-normal'} column sm={4}>
                    Country:
                  </Form.Label>
                  <Col className='mrp-20'>
                  <Form.Control type='input' />
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
                    <Form.Control type='input' />
                  </Col>
                </Form.Group>
              </Col>
              <Col>
                <Form.Group as={Row} className='mb-1'>
                  <Form.Label className={'fw-normal'} column sm={4}>
                    Postal Code:
                  </Form.Label>
                  <Col className='mrp-20'>
                  <Form.Control type='input' />
                  </Col>
                </Form.Group>

              </Col>
            </Row>


          </Form>
        </div>
      </CrudForm>
    </>
  )
}
