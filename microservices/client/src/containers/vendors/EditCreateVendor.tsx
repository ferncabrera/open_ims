import React, { useEffect, useState, version } from 'react';
import { CrudForm } from '../../components/forms/CrudForm';
import { Form, Row, Col } from 'react-bootstrap';

import { useAtom } from 'jotai';
import { bannerState, breadcrumbsState } from '../../atoms/atoms';
import { useNavigate } from 'react-router';

import { getJSONResponse, sendPostRequest, sendPatchRequest } from '../../utilities/apiHelpers';
import { fieldValidation, validateFormOnSubmit } from '../../utilities/validation';
import { hasEmptyKeys } from '../../utilities/helpers/functions';
import { IValidate } from '../../utilities/types/validationTypes';

import _ from 'lodash';
import { IoNavigateCircleOutline } from 'react-icons/io5';

interface IEditCreateVendorProps {
  vendorId: number | null;
};

interface IErrorFields {
  companyName: IErrorObject | null;
  firstName: IErrorObject | null;
  lastName: IErrorObject | null;
  email: IErrorObject | null;
  phone: IErrorObject | null;

};

interface VendorData {
    connectCustomer: string | null;
    vendorId: null | number;
    companyName: string;
    firstName: string;
lastName: string;
    email: string;
    phone: string;
    netTerms: any;
    shipping?: {
      vendorAddressName?: string | undefined;
      address1?: string | undefined;
      address2?: string | undefined;
      city?: string | undefined;
      province?: string | undefined;
      country?: string | undefined;
      postalCode?: string | undefined;
    };
    billing?: {
      vendorAddressName?: string | undefined;
      address1?: string | undefined;
      address2?: string | undefined;
      city?: string | undefined;
      province?: string | undefined;
      country?: string | undefined;
      postalCode?: string | undefined;
    };
}

const initialVendorData: VendorData = {
  connectCustomer: null,
  vendorId: null,
  companyName: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  netTerms: '',
  shipping: {
    vendorAddressName: '',
    address1: '',
    address2: '',
    city: '',
    province: '',
    country: '',
    postalCode: '',
  },
  billing: {
    vendorAddressName: '',
    address1: '',
    address2: '',
    city: '',
    province: '',
    country: '',
    postalCode: '',
  }

}

const initialErrorState: IErrorFields = {
  companyName: null,
  firstName: null,
  lastName: null,
  email: null,
  phone: null
};

export const EditCreateVendor = (props: IEditCreateVendorProps) => {

  const { vendorId } = props;

  const [vendorData, setVendorData] = useState <VendorData>(initialVendorData);
  const [customerList, setCustomerList] = useState <Array<any>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const [isCheckedBilling, setIsCheckedBilling] = useState(false);
  const [error, setError] = useState<IErrorFields>(initialErrorState)
  const [banner, setBanner] = useAtom(bannerState);
  const [breadcrumbs, setBreadcrumbs] = useAtom(breadcrumbsState);

  const navigate = useNavigate();

  useEffect(() => {
    if (vendorId) {
      setBreadcrumbs({ pathArr: [...breadcrumbs.pathArr, <span>Edit Vendor</span>] });
      setVendorData((prev) => ({...prev, vendorId}))
      Promise.all([getVendorData(), getAllAvailableCustomers()])
        .then(() => setIsLoading(false))
        .catch((e) => setBanner({ message: "Something went wrong retrieving data", variant: 'danger' }))
    } else {
      setBreadcrumbs({ pathArr: [...breadcrumbs.pathArr, <span>New Vendor</span>] });
      Promise.all([getAllAvailableCustomers()])
        .then(() => setIsLoading(false))
        .catch((e) => setBanner({ message: "Something went wrong retrieving data", variant: 'danger' }))
    }
  }, []);

  useEffect(() => {
    if (isCheckedBilling) {
      handleCheck(isCheckedBilling);
    }
  }, [vendorData.shipping]);

  const getAllAvailableCustomers = async () => {
    const response: IResponse = await getJSONResponse({ endpoint: "/api/server/available-customers" });
    setCustomerList(response.data);
  };

  const getVendorData = async () => {
    const response: IResponse = await getJSONResponse({ endpoint: "/api/server/vendor", params: { id: vendorId } });
    setVendorData((prev) => ({ ...prev, ...response.data }));
  };

  const validate = (data: IValidate) => {
    const valid = fieldValidation(data);
    const fieldName = valid.fieldName;
    if (!valid.isValid) {
      setError((prevError) => ({ ...prevError, [fieldName]: { valid: valid.isValid, message: valid.message } }))
    } else {
      setError((prevError) => ({ ...prevError, [fieldName]: null }))
    }
    return valid.isValid;
  };

  const handleCheck = (isChecked) => {
    if (isChecked) {
      setIsCheckedBilling(true);
      setVendorData((prev) => ({ ...prev, billing: { ...prev.shipping } }));
    } else {
      setIsCheckedBilling(false);
      setVendorData((prev) => ({ ...prev, billing: initialVendorData.billing }));
    }
  };

  const handleSave = async () => {
    const requiredArr = ['companyName', 'firstName', 'lastName', 'email', 'phone'] //provide keys for which fields need to be validated
    const [errorObject, isSubmissionInvalid] = validateFormOnSubmit(requiredArr, vendorData);

    if (isSubmissionInvalid) {
      setBanner({ message: "Please check fields", variant: 'danger' });
      setError(errorObject)
      return
    }

    setIsLoadingSubmit(true);
    const data = { ...vendorData };
    if (hasEmptyKeys(data.billing)) {
      delete data.billing;
    }
    if (hasEmptyKeys(data.shipping)) {
      delete data.shipping;
    }
    if (!vendorId) {
      const res: any = await sendPostRequest({ endpoint: '/api/server/vendor', data });
      setIsLoadingSubmit(false);
      if (res.status === 200) {
        setBanner({ message: res.message, variant: 'success' });
        navigate('/ccg/vendors');
      } else {
        setBanner({ message: res.message, variant: 'danger' });
        return
      }
    } else {
      const res: any = await sendPatchRequest({ endpoint: '/api/server/vendor', data });
      if (res.status === 200) {
        setBanner({ message: res.message, variant: 'success' });
        navigate('/ccg/vendors');
      } else {
        setBanner({ message: res.message, variant: 'danger' });
        return
      }
    }
    return

  };

  return (
    <div className='mx-3'>
      <CrudForm
        header={vendorId ? 'Edit Vendor' : 'New Vendor'}
        handleSubmit={handleSave}
      >
        <div id='form-content'>
          <Form className='my-5 pt-2'>

            <Form.Group as={Row} className='mb-4 pb-1'>
              <Form.Label className='fw-normal' column md={2} sm={2} xs={2}>
                Connect to Existing Customer:
              </Form.Label>
              <Col className='mrp-50' md={2}>
                <Form.Select
                  value={vendorData?.connectCustomer ? vendorData?.connectCustomer : undefined}
                  onChange={(e) => setVendorData((prev) => ({ ...prev, connectCustomer: e.target.value }))}
                >
                  <option value={''}>Select Available Customer</option>
                  {vendorData.connectCustomer && <option value={vendorData.connectCustomer}>{vendorData.connectCustomer}</option>}

                  {!_.isEmpty(customerList) && _.map(customerList, (customer) => {
                    return (<option key={customer.company_name} value={customer.company_name}> {customer.company_name}</option>)
                  })}
                </Form.Select>
              </Col>
            </Form.Group>

            {vendorId &&
              <Form.Group as={Row} className='mb-4 pb-1'>
                <Form.Label className='fw-normal' column md={2} sm={2} xs={2}>
                  Vendor ID:
                </Form.Label>
                <Col>
                  <strong>{vendorId}</strong>
                </Col>
              </Form.Group>
            }

            <Form.Group as={Row} className='mb-2'>
              <Form.Label className='fw-normal' column md={2} sm={2} xs={2}>
                Company Name:
              </Form.Label>
              <Col className='mrp-50' md={3}>
                <Form.Control
                  name='companyName'
                  type='input'
                  value={vendorData.companyName}
                  onChange={(e) => setVendorData((prevData) => ({ ...prevData, companyName: e.target.value }))}
                  isInvalid={error.companyName?.valid === false}
                  required
                  onBlur={(e) => {
                    const { value, name, required } = e.target;
                    validate({ value, name, required });
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
              <Form.Label className='fw-normal' column md={2} sm={2} xs={2}>
                Contact First Name:
              </Form.Label>
              <Col className='mrp-50' md={3}>
                <Form.Control
                  name='firstName'
                  type='input'
                  value={vendorData.firstName}
                  onChange={(e) => setVendorData((prevData) => ({ ...prevData, firstName: e.target.value }))}
                  isInvalid={error.firstName?.valid === false}
                  required
                  onBlur={(e) => {
                    const { value, name, required } = e.target;
                    validate({ value, name, required });
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
              <Form.Label className='fw-normal' column md={2} sm={2} xs={2}>
                Contact Last Name:
              </Form.Label>
              <Col className='mrp-50' md={3}>
                <Form.Control
                  name='lastName'
                  type='input'
                  value={vendorData.lastName}
                  onChange={(e) => setVendorData((prevData) => ({ ...prevData, lastName: e.target.value }))}
                  isInvalid={error.lastName?.valid === false}
                  required
                  onBlur={(e) => {
                    const { value, name, required } = e.target;
                    validate({ value, name, required });
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
              <Form.Label className='fw-normal' column md={2} sm={2} xs={2}>
                Email:
              </Form.Label>
              <Col className='mrp-50' md={3}>
                <Form.Control
                  name='email'
                  type='input'
                  value={vendorData.email}
                  onChange={(e) => setVendorData((prevData) => ({ ...prevData, email: e.target.value }))}
                  isInvalid={error.email?.valid === false}
                  required
                  onBlur={(e) => {
                    const { value, name, required } = e.target;
                    validate({ value, name, required });
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
              <Form.Label className='fw-normal' column md={2} sm={2} xs={2}>
                Phone:
              </Form.Label>
              <Col className='mrp-50' md={3}>
                <Form.Control
                  name='phone'
                  type='input'
                  value={vendorData.phone}
                  onChange={(e) => setVendorData((prevData) => ({ ...prevData, phone: e.target.value }))}
                  required
                  isInvalid={error.phone?.valid === false}
                  onBlur={(e) => {
                    const { value, name, required } = e.target;
                    validate({ value, name, required });
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

            <Form.Group as={Row} className='mb-4 pb-1'>
              <Form.Label className='fw-normal' column md={2} sm={2} xs={2}>
                Net Terms:
              </Form.Label>
              <Col className='mrp-50' md={3}>
                <Form.Control
                  name='netTerms'
                  type='input'
                  value={vendorData.netTerms}
                  onChange={(e) => setVendorData((prevData) => ({ ...prevData, netTerms: e.target.value }))}
                />
              </Col>
            </Form.Group>

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
                      value={vendorData?.shipping?.vendorAddressName ? vendorData?.shipping?.vendorAddressName : undefined}
                      onChange={(e) => setVendorData((prev) => ({ ...prev, shipping: { ...prev.shipping, vendorAddressName: e.target.value } }))}
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
                      value={vendorData?.billing?.vendorAddressName ? vendorData.billing.vendorAddressName : undefined}
                      disabled={isCheckedBilling}
                      onChange={(e) => setVendorData((prev) => ({ ...prev, billing: { ...prev.billing, vendorAddressName: e.target.value } }))}
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
                      value={vendorData?.shipping?.address1}
                      onChange={(e) => setVendorData((prev) => ({ ...prev, shipping: { ...prev.shipping, address1: e.target.value } }))}
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
                      value={vendorData?.billing?.address1}
                      disabled={isCheckedBilling}
                      onChange={(e) => setVendorData((prev) => ({ ...prev, billing: { ...prev.billing, address1: e.target.value } }))}
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
                      value={vendorData?.shipping?.address2}
                      onChange={(e) => setVendorData((prev) => ({ ...prev, shipping: { ...prev.shipping, address2: e.target.value } }))}
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
                      value={vendorData?.billing?.address2}
                      disabled={isCheckedBilling}
                      onChange={(e) => setVendorData((prev) => ({ ...prev, billing: { ...prev.billing, address2: e.target.value } }))}
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
                      value={vendorData?.shipping?.city}
                      onChange={(e) => setVendorData((prev) => ({ ...prev, shipping: { ...prev.shipping, city: e.target.value } }))}
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
                      value={vendorData?.billing?.city}
                      disabled={isCheckedBilling}
                      onChange={(e) => setVendorData((prev) => ({ ...prev, billing: { ...prev.billing, city: e.target.value } }))}
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
                      value={vendorData?.shipping?.province}
                      onChange={(e) => setVendorData((prev) => ({ ...prev, shipping: { ...prev.shipping, province: e.target.value } }))}
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
                      value={vendorData?.billing?.province}
                      disabled={isCheckedBilling}
                      onChange={(e) => setVendorData((prev) => ({ ...prev, billing: { ...prev.billing, province: e.target.value } }))}
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
                      value={vendorData?.shipping?.country}
                      onChange={(e) => setVendorData((prev) => ({ ...prev, shipping: { ...prev.shipping, country: e.target.value } }))}
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
                      value={vendorData?.billing?.country}
                      disabled={isCheckedBilling}
                      onChange={(e) => setVendorData((prev) => ({ ...prev, billing: { ...prev.billing, country: e.target.value } }))}
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
                      value={vendorData?.shipping?.postalCode}
                      onChange={(e) => setVendorData((prev) => ({ ...prev, shipping: { ...prev.shipping, postalCode: e.target.value } }))}
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
                      value={vendorData?.billing?.postalCode}
                      disabled={isCheckedBilling}
                      onChange={(e) => setVendorData((prev) => ({ ...prev, billing: { ...prev.billing, postalCode: e.target.value } }))}
                    />
                  </Col>
                </Form.Group>

              </Col>
            </Row>

          </Form>
        </div>
      </CrudForm>
    </div>
  )
}
