import React, { useEffect, useState } from 'react'
import { getJSONResponse, sendPostRequest, sendPatchRequest } from '../../utilities/apiHelpers';
import { CrudForm } from '../../components/forms/CrudForm';
import { CCGTable } from '../../components/table/CCGTable';
import { Typeahead } from 'react-bootstrap-typeahead';
import { Row, Col, Form } from "react-bootstrap";

import { bannerState, breadcrumbsState, productState, deleteRowState } from '../../atoms/atoms';
import { useAtom, } from 'jotai';
import { useResetAtom } from 'jotai/utils';
import { compareMultipleObjects } from '../../utilities/helpers/functions';
import { fieldValidation, validateFormOnSubmit } from '../../utilities/validation';
import { IValidate } from '../../utilities/types/validationTypes';

import { EditColumns } from "./ProductTableSchema";
import { produce } from 'immer';
import _ from 'lodash';



interface IEditInvoiceProps {
    invoiceId: number | null;
}

interface ITableRowData {
    id: number | null;
    item_number: number | null;
    item_name: string;
    quantity: number | string;
    rate: number | string;
    taxable: boolean;
    discount: number | string;
    amount: number | string;
}

const initialInvoiceData = {
    invoiceId: null,
    referenceNumber: '',
    invoiceStatus: '',
    invoiceDate: '',
    customer: '',
    salesRep: '',
    paymentStatus: '',
    tax: 0,
    invoiceAmount: 0,
    paymentDue: '',
    datePaid: '',
    deliveryStatus: ''
};

const initialErrorState: any = {
    referenceNumber: null,
    invoiceStatus: null,
    invoiceDate: null,
    customer: null,
    salesRep: null,
    paymentStatus: null,
    paymentDue: null,
    datePaid: null,
    deliveryStatus: null,
}

export const EditCreateInvoice = (props: IEditInvoiceProps) => {
    const { invoiceId } = props;

    const [invoiceData, setInvoiceData] = useState(initialInvoiceData);
    const [tableData, setTableData] = useState<ITableRowData[]>([])
    const [customers, setCustomers] = useState([]);
    const [taxValue, setTaxValue] = useState<number>(0);
    const [amount, setAmount] = useState<number>(0);
    const [error, setError] = useState(initialErrorState)
    // Need idNumber to start from 1 because some conditional checks in schema check for id and I am too lazy to change it to include 0
    const [idNumber, setIdNumber] = useState<number>(1);

    const [products, setProducts] = useAtom(productState);
    const [breadcrumbs, setBreadcrumbs] = useAtom(breadcrumbsState);
    const [banner, setBanner] = useAtom(bannerState);
    const [removeRow, setRemoveRow] = useAtom(deleteRowState);
    const resetProducts = useResetAtom(productState);
    const resetRemoveRow = useResetAtom(deleteRowState);

    //State for typeahead functionality 
    const [singleSelectedCustomer, setSingleSelectedCustomer] = useState([invoiceData.customer]);


    useEffect(() => {
        if (!invoiceId) {
            setBreadcrumbs({ pathArr: [...breadcrumbs.pathArr, <span>New Sales-Invoice</span>] })
        } else {
            setBreadcrumbs({ pathArr: [...breadcrumbs.pathArr, <span>Edit Sales-Invoice</span>] })
        }

        Promise.all([getAllProducts(), getAllUniqueProducts(), getCustomers()])
            .then(() => console.log('can set some loader here'))
            .catch((err) => setBanner({ message: "Error loading in product data", variant: 'danger' }))

        const productsArray: ITableRowData[] = Object.values(products.productRows);
        setTableData(productsArray);

        // on component unmount
        return () => {
            resetProducts();
            resetRemoveRow();
        }
    }, []);

    useEffect(() => {

        // FOR VALIDATIONS NEED TO VALIDATE QUANTITIES BEFORE SUBMISSION!


        //TALLY TAX AND AMOUNT VALUES
        const productRows = products.productRows;
        let amountSum = 0;
        let taxSum = 0;
        for (const productIndex in productRows) {
            amountSum += Number(productRows[productIndex].amount)
            if (productRows[productIndex].taxable) {
                taxSum += Number(productRows[productIndex].amount) * (invoiceData.tax) / 100
            };
        };

        setAmount(amountSum);
        setTaxValue(taxSum);

    }, [products.productRows, invoiceData.tax]);

    useEffect(() => {
        //listens for row deletion
        if (!_.isNaN(removeRow.rowId) && _.isNumber(removeRow.rowId)) {
            deleteRow(removeRow.rowId);
            resetRemoveRow();
        }
    }, [removeRow.rowId])

    const getAllProducts = async () => {
        const response: IResponse = await getJSONResponse({ endpoint: "/api/server/products" });
        if (response.status !== 200) {
            setBanner({ message: "Error retrieving products", variant: 'danger' })
            return
        };
        setProducts((prev) => ({ ...prev, getProducts: [...response.data] }));
    };

    const getAllUniqueProducts = async () => {
        const response: IResponse = await getJSONResponse({ endpoint: "/api/server/unique-products" });
        if (response.status !== 200) {
            setBanner({ message: "Error retrieving products", variant: "danger" })
            return
        }
        setProducts((prev) => ({ ...prev, getUniqueProducts: [...response.data] }));
    };

    const getCustomers = async () => {
        const response: IResponse = await getJSONResponse({ endpoint: "/api/server/all-customers" });
        if (response.status !== 200) {
            setBanner({ message: "Error retrieving customers", variant: 'danger' })
            return
        };
        setCustomers(response.data)
    };


    const handleAddRow = () => {
        // Need to ensure on generating a unique ID number - use idNumber in local useState.
        const data = { id: idNumber, item_number: null, item_name: '', quantity: '', rate: '', taxable: false, discount: '', amount: '' }
        const row =
            { [idNumber]: data };
        setProducts((prev) => ({ ...prev, productRows: { ...prev.productRows, ...row } }));
        setTableData((prev) => ([...prev, data]))
        setIdNumber((prev) => prev + 1);
        // UseEffect updates the table and officially handles the row addition.
    };

    const deleteRow = (rowId) => {

        console.log('rowId', rowId);
        const newProductState = produce(products, draft => {
            delete draft.productRows[rowId]
        });
        const data: ITableRowData[] = Object.values(newProductState.productRows);
        setTableData([...data]);
        setProducts(newProductState);



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

    const handleCustomerChange = (optionArr: [data: string]) => {
        let value = optionArr[0];
        if (!value) {
            value = ''
            setSingleSelectedCustomer([value])
        };
        setInvoiceData((prev) => ({ ...prev, customer: value }));
        setSingleSelectedCustomer(optionArr)
    }

    const handleSubmit = async () => {
        // Function that checks if 2 objects are the same
        const ObjectArray: [] = Object.values(products.productRows) as [];
        const isDuplicate = compareMultipleObjects(ObjectArray);
        console.log('isDuplicate?', isDuplicate)
        // Report duplication error here!

        const requiredArr = Object.keys(initialErrorState) //provide keys for which fields need to be validated
        const [errorObject, isSubmissionInvalid] = validateFormOnSubmit(requiredArr, invoiceData);
        if (isSubmissionInvalid) {
            setBanner({ message: "Please check fields", variant: 'danger' });
            setError(errorObject)
            return
          }

        console.log('Submitted!')
    };

    return (
        <div className='mx-3'>
            <CrudForm header={invoiceId ? 'Edit Sales-Invoice' : 'New Sales-Invoice'} handleSubmit={handleSubmit}>
                <div id='form-content'>
                    <Form className='my-5 pt-2'>

                        {invoiceId &&
                            <Form.Group as={Row} className='mb-4 pb-1'>
                                <Form.Label className='fw-normal' column md={2} sm={2} xs={2}>
                                    Invoice#:
                                </Form.Label>
                                <Col>
                                    <strong>{invoiceId}</strong>
                                </Col>
                            </Form.Group>
                        }

                        <Form.Group as={Row} className='mb-2 pb-1'>
                            <Form.Label className='fw-normal' column md={2} sm={2} xs={2}>
                                Reference#:
                            </Form.Label>
                            <Col className='mrp-50' md={3}>
                                <Form.Control
                                    name='referenceNumber'
                                    type='input'
                                    value={invoiceData.referenceNumber}
                                    onChange={(e) => setInvoiceData((prevData) => ({ ...prevData, referenceNumber: e.target.value }))}
                                    required
                                    isInvalid={error.referenceNumber?.valid === false}
                                    onBlur={(e) => {
                                        const { value, name, required } = e.target;
                                        validate({ value, name, required });
                                    }}
                                // We will worry about validations later
                                />
                                <div className='d-flex'>
                                    {error.referenceNumber?.valid === false &&
                                        <Form.Control.Feedback data-testid="referenceNumber-error" type='invalid'>{error.referenceNumber.message}</Form.Control.Feedback>
                                    }
                                    {/* THis is so that space is taken up */}
                                    <span className='invisible'>filler</span>
                                </div>
                            </Col>
                        </Form.Group>

                        <Form.Group as={Row} className='mb-2 pb-1'>
                            <Form.Label className='fw-normal' column md={2} sm={2} xs={2}>
                                Invoice Status:
                            </Form.Label>
                            <Col className='mrp-50' md={3}>
                                <Form.Select
                                    onChange={(e) => setInvoiceData((prev) => ({ ...prev, invoiceStatus: e.target.value }))}
                                    name='invoiceStatus'
                                    value={invoiceData.invoiceStatus}
                                    isInvalid={error.invoiceStatus?.valid === false}
                                    required
                                    onBlur={(e) => {
                                        const { value, name, required } = e.target;
                                        validate({ value, name, required });
                                    }}
                                >
                                    {!invoiceData.invoiceStatus && <option value=""> </option>}
                                    <option>Confirmed</option>
                                    <option>Draft</option>
                                </Form.Select>
                                <div className='d-flex'>
                                    {error.invoiceStatus?.valid === false &&
                                        <Form.Control.Feedback data-testid="invoiceStatus-error" type='invalid'>{error.invoiceStatus.message}</Form.Control.Feedback>
                                    }
                                    {/* THis is so that space is taken up */}
                                    <span className='invisible'>filler</span>
                                </div>
                            </Col>
                        </Form.Group>

                        <Form.Group as={Row} className='mb-2 pb-1'>
                            <Form.Label className='fw-normal' column md={2} sm={2} xs={2}>
                                Invoice Date:
                            </Form.Label>
                            <Col className='mrp-50' md={3}>
                                <Form.Control
                                    name='invoiceDate'
                                    type='invoiceDate'
                                    onChange={(e) => setInvoiceData((prev) => ({ ...prev, invoiceDate: e.target.value }))}
                                    value={invoiceData.invoiceDate}
                                    isInvalid={error.invoiceDate?.valid === false}
                                    required
                                    onBlur={(e) => {
                                        const { value, name, required } = e.target;
                                        validate({ value, name, required });
                                    }}
                                />
                                <div className='d-flex'>
                                    {error.invoiceDate?.valid === false &&
                                        <Form.Control.Feedback data-testid="invoiceDate-error" type='invalid'>{error.invoiceDate.message}</Form.Control.Feedback>
                                    }
                                    {/* THis is so that space is taken up */}
                                    <span className='invisible'>filler</span>
                                </div>
                            </Col>
                        </Form.Group>

                        <Form.Group as={Row} className='mb-2 pb-1'>
                            <Form.Label className='fw-normal' column md={2} sm={2} xs={2}>
                                Customer:
                            </Form.Label>
                            <Col className='mrp-50' md={3}>

                                <Typeahead
                                    id='customer'
                                    onChange={handleCustomerChange}
                                    labelKey={'company_name'}
                                    options={customers}
                                    selected={singleSelectedCustomer}
                                    positionFixed
                                    maxHeight="200px"
                                    isInvalid={error.customer?.valid === false}
                                    onBlur={(e) => {
                                        const { value, id, required } = e.target;
                                        validate({ value, name: 'customer', required: true });
                                    }}

                                />
                                <div className='d-flex'>
                                    {error.customer?.valid === false &&
                                        <Form.Control.Feedback data-testid="customer-error" type='invalid'>{error.customer.message}</Form.Control.Feedback>
                                    }
                                    {/* THis is so that space is taken up */}
                                    <span className='invisible'>filler</span>
                                </div>
                            </Col>
                        </Form.Group>

                        <Form.Group as={Row} className='mb-2 pb-1'>
                            <Form.Label className='fw-normal' column md={2} sm={2} xs={2}>
                                Sales Representative:
                            </Form.Label>
                            <Col className='mrp-50' md={3}>
                                <Typeahead
                                    id='salesRep'
                                    onChange={() => null}
                                    // labelKey={'company_name'}
                                    options={[]}
                                    selected={[""]}
                                    positionFixed
                                    maxHeight="200px"
                                    isInvalid={error.salesRep?.valid === false}
                                    onBlur={(e) => {
                                        const { value, id, required } = e.target;
                                        validate({ value, name: 'salesRep', required: true });
                                    }}

                                />
                                <div className='d-flex'>
                                    {error.salesRep?.valid === false &&
                                        <Form.Control.Feedback data-testid="salesRep-error" type='invalid'>{error.salesRep.message}</Form.Control.Feedback>
                                    }
                                    {/* THis is so that space is taken up */}
                                    <span className='invisible'>filler</span>
                                </div>
                            </Col>
                        </Form.Group>

                        <strong><p className='mt-3 pb-3 mb-3 fs-5'>Payment Information</p></strong>

                        <Form.Group as={Row} className='mb-2 pb-1'>
                            <Form.Label className='fw-normal' column md={2} sm={2} xs={2}>
                                Payment Status:
                            </Form.Label>
                            <Col className='mrp-50' md={3}>
                                <Form.Select
                                    name='paymentStatus'
                                    onChange={(e) => setInvoiceData((prev) => ({ ...prev, paymentStatus: e.target.value }))}
                                    value={invoiceData.paymentStatus}
                                    isInvalid={error.paymentStatus?.valid === false}
                                    onBlur={(e) => {
                                        const { value, name, required } = e.target;
                                        validate({ value, name, required });
                                    }}
                                    required
                                >
                                    {!invoiceData.paymentStatus && <option> </option>}
                                    <option value='Paid'>Paid</option>
                                    <option value="Not paid">Not paid</option>
                                </Form.Select>
                                <div className='d-flex'>
                                    {error.paymentStatus?.valid === false &&
                                        <Form.Control.Feedback data-testid="paymentStatus-error" type='invalid'>{error.paymentStatus.message}</Form.Control.Feedback>
                                    }
                                    {/* THis is so that space is taken up */}
                                    <span className='invisible'>filler</span>
                                </div>
                            </Col>
                        </Form.Group>

                        <Form.Group as={Row} className='mb-4 pb-1'>
                            <Form.Label className='fw-normal' column md={2} sm={2} xs={2}>
                                {`Tax (%):`}
                            </Form.Label>
                            <Col className='mrp-50' md={3}>
                                <Form.Control
                                    name='invoiceAmount'
                                    type='input'
                                    value={invoiceData.tax}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (_.isNumber(Number(value)) && !_.isNaN(Number(value)) && (Number(value) <= 100) && (Number(value) >= 0)) {
                                            setInvoiceData((prevData) => ({ ...prevData, tax: Number(value) }))
                                        }
                                    }}
                                // We will worry about validations later
                                />
                            </Col>
                        </Form.Group>

                        <Form.Group as={Row} className='mb-2 pb-1'>
                            <Form.Label className='fw-normal' column md={2} sm={2} xs={2}>
                                Payment Due:
                            </Form.Label>
                            <Col className='mrp-50' md={3}>
                                <Form.Control
                                    name='paymentDue'
                                    type='date'
                                    onChange={(e) => setInvoiceData((prev) => ({ ...prev, paymentDue: e.target.value }))}
                                    value={invoiceData.paymentDue}
                                    isInvalid={error.paymentDue?.valid === false}
                                    onBlur={(e) => {
                                        const { value, name, required } = e.target;
                                        validate({ value, name, required });
                                    }}
                                    required
                                />
                                <div className='d-flex'>
                                    {error.paymentDue?.valid === false &&
                                        <Form.Control.Feedback data-testid="paymentDue-error" type='invalid'>{error.paymentDue.message}</Form.Control.Feedback>
                                    }
                                    {/* THis is so that space is taken up */}
                                    <span className='invisible'>filler</span>
                                </div>
                            </Col>
                        </Form.Group>

                        <Form.Group as={Row} className='mb-2 pb-1'>
                            <Form.Label className='fw-normal' column md={2} sm={2} xs={2}>
                                Date Paid:
                            </Form.Label>
                            <Col className='mrp-50' md={3}>
                                <Form.Control
                                    name='datePaid'
                                    type='date'
                                    onChange={(e) => setInvoiceData((prev) => ({ ...prev, datePaid: e.target.value }))}
                                    value={invoiceData.datePaid}
                                    isInvalid={error.datePaid?.valid === false}
                                    onBlur={(e) => {
                                        const { value, name, required } = e.target;
                                        validate({ value, name, required });
                                    }}
                                    required
                                />
                                <div className='d-flex'>
                                    {error.datePaid?.valid === false &&
                                        <Form.Control.Feedback data-testid="datePaid-error" type='invalid'>{error.datePaid.message}</Form.Control.Feedback>
                                    }
                                    {/* THis is so that space is taken up */}
                                    <span className='invisible'>filler</span>
                                </div>
                            </Col>

                        </Form.Group>

                        <strong><p className='mt-3 pb-3 mb-3 fs-5'>Shipping Information</p></strong>

                        <Form.Group as={Row} className='mb-2 pb-1'>
                            <Form.Label className='fw-normal' column md={2} sm={2} xs={2}>
                                Delivery Status:
                            </Form.Label>
                            <Col className='mrp-50' md={3}>
                                <Form.Select
                                    name='deliveryStatus'
                                    onChange={(e) => setInvoiceData((prev) => ({ ...prev, deliveryStatus: e.target.value }))}
                                    value={invoiceData.deliveryStatus}
                                    isInvalid={error.deliveryStatus?.valid === false}
                                    onBlur={(e) => {
                                        const { value, name, required } = e.target;
                                        validate({ value, name, required });
                                    }}
                                    required
                                >
                                    {!invoiceData.deliveryStatus && <option> </option>}
                                    <option value='Shipped'>Shipped</option>
                                    <option value='Not shipped'>Not shipped</option>
                                </Form.Select>
                                <div className='d-flex'>
                                    {error.deliveryStatus?.valid === false &&
                                        <Form.Control.Feedback data-testid="deliveryStatus-error" type='invalid'>{error.deliveryStatus.message}</Form.Control.Feedback>
                                    }
                                    {/* THis is so that space is taken up */}
                                    <span className='invisible'>filler</span>
                                </div>
                            </Col>
                        </Form.Group>

                        <div>
                            <Row className='d-flex mx-3 me-4 pe-3 justify-content-end'>
                                <div className='d-flex justify-content-end'>
                                    <h3 className='pe-3'>Amount:</h3>  <h3><strong>${amount.toFixed(2)}</strong></h3>
                                </div>
                                <div className='d-flex justify-content-end'>
                                    <h3 className='pe-3'>+ Tax:</h3>  <h3><strong>${taxValue.toFixed(2)}</strong></h3>
                                </div>
                                <span style={{ borderBottom: "solid", width: "25em", height: "7px" }}></span>
                                <div className='d-flex justify-content-end'>
                                    <h3 className='pe-3'>Total Amount:</h3>  <h3><strong>${(amount + taxValue).toFixed(2)}</strong></h3>
                                </div>

                            </Row>
                        </div>

                        <div className='mt-5'>
                            <CCGTable
                                columns={EditColumns}
                                data={tableData}
                                totalCount={0}
                                pageSize={5}
                                pageIndex={0}
                                fetchDataFunction={() => null}
                                searchPlaceholder='Search by Parameter'
                                tableHeader='Products'
                                frontEndPagination={true}
                                addRowButton={true}
                                onAddRow={handleAddRow}
                            />
                        </div>

                    </Form>
                </div>
            </CrudForm >
        </div >
    )
}
