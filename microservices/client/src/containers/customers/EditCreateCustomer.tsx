import React, { useEffect, useState } from 'react';
import { getJSONResponse, sendPatchRequest, sendPostRequest } from '../../utilities/apiHelpers';
import { CrudForm } from '../../components/forms/CrudForm';
import { Form, Row, Col, Spinner } from 'react-bootstrap';
import { hasEmptyKeys } from '../../utilities/helpers/functions';
import { IValidate } from "../../utilities/types/validationTypes";
import { fieldValidation } from '../../utilities/validation';
import { bannerState, breadcrumbsState } from '../../atoms/atoms';
import { useAtom } from 'jotai';
import { useNavigate } from 'react-router';
import _ from 'lodash';

interface IEditCustomerProps {
  customerId: number | null;
}

interface ICustomerData {
  vendor: string;
  id: number | null;
  companyName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  netTerms: any;
  shipping?: {
    customerAddressName?: string | undefined;
    address1?: string | undefined;
    address2?: string | undefined;
    city?: string | undefined;
    province?: string | undefined;
    country?: string | undefined;
    postalCode?: string | undefined;
  };
  billing?: {
    customerAddressName?: string | undefined;
    address1?: string | undefined;
    address2?: string | undefined;
    city?: string | undefined;
    province?: string | undefined;
    country?: string | undefined;
    postalCode?: string | undefined;
  }
}

interface IErrorFields {
  companyName: IErrorObject | null;
  firstName: IErrorObject | null;
  lastName: IErrorObject | null;
  email: IErrorObject | null;
  phone: IErrorObject | null;
}

const initialErrorState = {
  companyName: null,
  firstName: null,
  lastName: null,
  email: null,
  phone: null
};

let trackErrorList: (Boolean)[]= [];

export const EditCreateCustomer = (props: IEditCustomerProps) => {

  const { customerId } = props;

  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const [isCheckedBilling, setIsCheckedBilling] = useState(false);
  const [vendorList, setVendorList] = useState <Array<any>>([]);
  const [initialVendor, setInitialVendor] = useState('');
  const [error, setError] = useState<IErrorFields>(initialErrorState);
  const [bannerTextState, setBannerTextState] = useAtom(bannerState)
  const [breadcrumbs, setBreadcrumb] = useAtom(breadcrumbsState);
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
        customerAddressName: '',
        address1: '',
        address2: '',
        city: '',
        province: '',
        country: '',
        postalCode: '',
      },
      billing: {
        customerAddressName: '',
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
    if (!customerId) {
      setBreadcrumb({ pathArr: [...breadcrumbs.pathArr, <span>New Customer</span>] })
      Promise.all([getAllAvailableVendors()])
        .then(() => setIsLoading(false))
        .catch((e) => setBannerTextState({ message: 'Something went wrong retrieving data', variant: 'danger' }))
    } else {
      setIsLoading(true);
      setBreadcrumb({ pathArr: [...breadcrumbs.pathArr, <span>Edit Customer</span>] })
      Promise.all([getCustomerData(), getAllAvailableVendors()])
        .then(() => setIsLoading(false))
        .catch((e) => setBannerTextState({ message: 'Something went wrong retrieving data', variant: 'danger' }));
    }
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

  const validate = (data: IValidate) => {
    const valid = fieldValidation(data)
    const name = valid.fieldName;
    if (!valid.isValid) {
      setError((prevError) => ({ ...prevError, [name]: { valid: valid.isValid, message: valid.message } }));
    } else {
      setError((prevError) => ({ ...prevError, [name]: null }))
    }
    return valid.isValid;
  };

  const handleSave = async () => {
    const requiredArr = [false, false, true, true, true, true, true, false, true, true]
    let index = 0
    _.forIn({ ...customerData }, (value, key: string) => {
      let data = { value, name: key, required: requiredArr[index] }
      if (data.name === 'netTerms') {
        data = { value, name: key, required: false }
      }
      const isValid = validate(data);
      trackErrorList.push(isValid)
      index++;
    });
    if (_.some(trackErrorList, (validEntity) => validEntity === false)) {
      trackErrorList = [];
      return false
    }
    setIsLoadingSubmit(true);
    const data = { ...customerData };
    if (hasEmptyKeys(data.billing)) {
      delete data.billing;
    }
    if (hasEmptyKeys(data.shipping)) {
      delete data.shipping;
    }
    if (!customerId) {
      const res: any = await sendPostRequest({ endpoint: '/api/server/customer', data });
      if (res.status === 200) {
        setBannerTextState({ message: res.message, variant: 'success' })
      } else {
        setBannerTextState({message: res.message, variant: 'danger'});
        return
      }
    } else {
      const res: any = await sendPatchRequest({ endpoint: '/api/server/customer', data });
      if (res.status === 200) {
        setBannerTextState({ message: res.message, variant: 'success' })
      } else {
        setBannerTextState({message: res.message, variant: 'danger'});
        return
      }
    }
    setIsLoadingSubmit(false);
    navigate('/ccg/customers')
    return

  };

  const handleCheck = (isChecked) => {
    if (isChecked) {
      setIsCheckedBilling(true);
      setCustomerData({ ...customerData, billing: { ...customerData.shipping } });
    } else {
      setIsCheckedBilling(false);
      setCustomerData({
        ...customerData, billing: {
          customerAddressName: '',
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
          header={customerId ? 'Edit Customer' : 'New Customer'}
          handleSubmit={handleSave}
          disablePrimary={isLoadingSubmit}
          disableSecondary={isLoadingSubmit}
        >
          <div id='form-content'>
            <Form className='my-5 pt-2'>

              <Form.Group as={Row} className='mb-5' >
                <Form.Label className='fw-normal' column md={2} sm={2} xs={2}>
                  Link to Existing Vendor:
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

              {customerId &&
                <Form.Group as={Row} className='mt-3 mb-2'>
                  <Form.Label className='fw-normal' column lg={2}>
                    Customer ID:
                  </Form.Label>
                  <Col className='mrp-50' md={3}>
                    <strong>{customerId}</strong>
                  </Col>
                </Form.Group>
              }

              <Form.Group as={Row} className='mb-2'>
                <Form.Label className='fw-normal' column lg={2}>
                  Company Name:
                </Form.Label>
                <Col className='mrp-50' md={3}>
                  <Form.Control
                    name='companyName'
                    type='input'
                    value={customerData.companyName}
                    onChange={(e) => setCustomerData({ ...customerData, companyName: e.target.value })}
                    required
                    isInvalid={error.companyName?.valid === false}
                    onBlur={(e) => {
                      const { value, name, required } = e.target;
                      validate({ value, name, required })
                    }}
                  />
                  <div className='d-flex'>
                  {error.companyName?.valid === false &&
                    <Form.Control.Feedback data-testid="email-error" type='invalid'>{error.companyName.message}</Form.Control.Feedback>
                  }
                  {/* THis is so that space is taken up */}
                  <span className='invisible'>filler</span>
                </div>
                </Col>
              </Form.Group>

              <Form.Group as={Row} className='mb-2'>
                <Form.Label className='fw-normal' column lg={2}>
                  First Name:
                </Form.Label>
                <Col className='mrp-50' md={3}>
                  <Form.Control
                    name='firstName'
                    type='input'
                    value={customerData.firstName}
                    onChange={(e) => setCustomerData({ ...customerData, firstName: e.target.value })}
                    required
                    isInvalid={error.firstName?.valid === false}
                    onBlur={(e) => {
                      const { value, name, required } = e.target;
                      validate({ value, name, required })
                    }}
                  />
                  <div className='d-flex'>
                  {error.firstName?.valid === false &&
                    <Form.Control.Feedback data-testid="email-error" type='invalid'>{error.firstName.message}</Form.Control.Feedback>
                  }
                  {/* THis is so that space is taken up */}
                  <span className='invisible'>filler</span>
                </div>
                </Col>
              </Form.Group>

              <Form.Group as={Row} className='mb-2'>
                <Form.Label className='fw-normal' column lg={2}>
                  Last Name:
                </Form.Label>
                <Col className='mrp-50' md={3}>
                  <Form.Control
                    name='lastName'
                    type='input'
                    value={customerData.lastName}
                    onChange={(e) => setCustomerData({ ...customerData, lastName: e.target.value })}
                    required
                    isInvalid={error.lastName?.valid === false}
                    onBlur={(e) => {
                      const { value, name, required } = e.target;
                      validate({ value, name, required })
                    }}
                  />
                  <div className='d-flex'>
                  {error.lastName?.valid === false &&
                    <Form.Control.Feedback data-testid="email-error" type='invalid'>{error.lastName.message}</Form.Control.Feedback>
                  }
                  {/* THis is so that space is taken up */}
                  <span className='invisible'>filler</span>
                </div>
                </Col>
              </Form.Group>

              <Form.Group as={Row} className='mb-2'>
                <Form.Label className='fw-normal' column lg={2}>
                  Email:
                </Form.Label>
                <Col className='mrp-50' md={3}>
                  <Form.Control
                    name='email'
                    type='input'
                    value={customerData.email}
                    onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
                    required
                    isInvalid={error.email?.valid === false}
                    onBlur={(e) => {
                      const { value, name, required } = e.target;
                      validate({ value, name, required })
                    }}
                  />
                  <div className='d-flex'>
                  {error.email?.valid === false &&
                    <Form.Control.Feedback data-testid="email-error" type='invalid'>{error.email.message}</Form.Control.Feedback>
                  }
                  {/* THis is so that space is taken up */}
                  <span className='invisible'>filler</span>
                </div>
                </Col>
              </Form.Group>

              <Form.Group as={Row} className='mb-2'>
                <Form.Label className='fw-normal' column lg={2}>
                  Phone:
                </Form.Label>
                <Col className='mrp-50' md={3}>
                  <Form.Control
                    name='phone'
                    type='input'
                    value={customerData.phone}
                    onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
                    required
                    isInvalid={error.phone?.valid === false}
                    onBlur={(e) => {
                      const { value, name, required } = e.target;
                      validate({ value, name, required })
                    }}
                  />
                  <div className='d-flex'>
                  {error.phone?.valid === false &&
                    <Form.Control.Feedback data-testid="email-error" type='invalid'>{error.phone.message}</Form.Control.Feedback>
                  }
                  {/* THis is so that space is taken up */}
                  <span className='invisible'>filler</span>
                </div>
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
                  <Form.Group as={Row} className='mb-3'>
                    <Form.Label className='fw-normal' column lg={4}>
                      Shipping Contact Name:
                    </Form.Label>
                    <Col className='mr' md={6}>
                      <Form.Control
                        type='input'
                        value={customerData?.shipping?.customerAddressName}
                        onChange={(e) => setCustomerData({ ...customerData, shipping: { ...customerData.shipping, customerAddressName: e.target.value } })}
                      />
                    </Col>
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group as={Row} className='mb-3'>
                    <Form.Label className={'fw-normal'} column sm={4}>
                      Billing Contact Name:
                    </Form.Label>
                    <Col className='mrp-20'>
                      <Form.Control
                        type='input'
                        value={customerData?.billing?.customerAddressName}
                        disabled={isCheckedBilling}
                        onChange={(e) => setCustomerData({ ...customerData, billing: { ...customerData.billing, customerAddressName: e.target.value } })}
                      />
                    </Col>
                  </Form.Group>

                </Col>
              </Row>

              <Row className=''>
                <Col>
                  <Form.Group as={Row} className='mb-3'>
                    <Form.Label className='fw-normal' column lg={4}>
                      Address Line 1:
                    </Form.Label>
                    <Col className='mr' md={6}>
                      <Form.Control
                        type='input'
                        value={customerData?.shipping?.address1}
                        onChange={(e) => setCustomerData({ ...customerData, shipping: { ...customerData.shipping, address1: e.target.value } })}
                      />
                    </Col>
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group as={Row} className='mb-3'>
                    <Form.Label className={'fw-normal'} column sm={4}>
                      Address Line 1:
                    </Form.Label>
                    <Col className='mrp-20'>
                      <Form.Control
                        type='input'
                        value={customerData?.billing?.address1}
                        disabled={isCheckedBilling}
                        onChange={(e) => setCustomerData({ ...customerData, billing: { ...customerData.billing, address1: e.target.value } })}
                      />
                    </Col>
                  </Form.Group>

                </Col>
              </Row>

              <Row className=''>
                <Col>
                  <Form.Group as={Row} className='mb-3'>
                    <Form.Label className='fw-normal' column lg={4}>
                      Address Line 2:
                    </Form.Label>
                    <Col className='mr' md={6}>
                      <Form.Control
                        type='input'
                        value={customerData?.shipping?.address2}
                        onChange={(e) => setCustomerData({ ...customerData, shipping: { ...customerData.shipping, address2: e.target.value } })}
                      />
                    </Col>
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group as={Row} className='mb-3'>
                    <Form.Label className={'fw-normal'} column sm={4}>
                      Address Line 2:
                    </Form.Label>
                    <Col className='mrp-20'>
                      <Form.Control
                        type='input'
                        value={customerData?.billing?.address2}
                        disabled={isCheckedBilling}
                        onChange={(e) => setCustomerData({ ...customerData, billing: { ...customerData.billing, address2: e.target.value } })}
                      />
                    </Col>
                  </Form.Group>

                </Col>
              </Row>

              <Row className=''>
                <Col>
                  <Form.Group as={Row} className='mb-3'>
                    <Form.Label className='fw-normal' column lg={4}>
                      City:
                    </Form.Label>
                    <Col className='mr' md={6}>
                      <Form.Control
                        type='input'
                        value={customerData?.shipping?.city}
                        onChange={(e) => setCustomerData({ ...customerData, shipping: { ...customerData.shipping, city: e.target.value } })}
                      />
                    </Col>
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group as={Row} className='mb-3'>
                    <Form.Label className={'fw-normal'} column sm={4}>
                      City:
                    </Form.Label>
                    <Col className='mrp-20'>
                      <Form.Control
                        type='input'
                        value={customerData?.billing?.city}
                        disabled={isCheckedBilling}
                        onChange={(e) => setCustomerData({ ...customerData, billing: { ...customerData.billing, city: e.target.value } })}
                      />
                    </Col>
                  </Form.Group>

                </Col>
              </Row>

              <Row className=''>
                <Col>
                  <Form.Group as={Row} className='mb-3'>
                    <Form.Label className='fw-normal' column lg={4}>
                      Province:
                    </Form.Label>
                    <Col className='mr' md={6}>
                      <Form.Control
                        type='input'
                        value={customerData?.shipping?.province}
                        onChange={(e) => setCustomerData({ ...customerData, shipping: { ...customerData.shipping, province: e.target.value } })}
                      />
                    </Col>
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group as={Row} className='mb-3'>
                    <Form.Label className={'fw-normal'} column sm={4}>
                      Province:
                    </Form.Label>
                    <Col className='mrp-20'>
                      <Form.Control
                        type='input'
                        value={customerData?.billing?.province}
                        disabled={isCheckedBilling}
                        onChange={(e) => setCustomerData({ ...customerData, billing: { ...customerData.billing, province: e.target.value } })}
                      />
                    </Col>
                  </Form.Group>

                </Col>
              </Row>

              <Row className=''>
                <Col>
                  <Form.Group as={Row} className='mb-3'>
                    <Form.Label className='fw-normal' column lg={4}>
                      Country:
                    </Form.Label>
                    <Col className='mr' md={6}>
                      <Form.Control
                        type='input'
                        value={customerData?.shipping?.country}
                        onChange={(e) => setCustomerData({ ...customerData, shipping: { ...customerData.shipping, country: e.target.value } })}
                      />
                    </Col>
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group as={Row} className=''>
                    <Form.Label className={'fw-normal'} column sm={4}>
                      Country:
                    </Form.Label>
                    <Col className='mrp-20'>
                      <Form.Control
                        type='input'
                        value={customerData?.billing?.country}
                        disabled={isCheckedBilling}
                        onChange={(e) => setCustomerData({ ...customerData, billing: { ...customerData.billing, country: e.target.value } })}
                      />
                    </Col>
                  </Form.Group>
                </Col>
              </Row>

              <Row className=''>
                <Col>
                  <Form.Group as={Row} className=''>
                    <Form.Label className='fw-normal' column lg={4}>
                      Postal Code:
                    </Form.Label>
                    <Col className='mr' md={6}>
                      <Form.Control
                        type='input'
                        value={customerData?.shipping?.postalCode}
                        onChange={(e) => setCustomerData({ ...customerData, shipping: { ...customerData.shipping, postalCode: e.target.value } })}
                      />
                    </Col>
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group as={Row} className='mb-3'>
                    <Form.Label className={'fw-normal'} column sm={4}>
                      Postal Code:
                    </Form.Label>
                    <Col className='mrp-20'>
                      <Form.Control
                        type='input'
                        value={customerData?.billing?.postalCode}
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
