import React, { useEffect, useState } from 'react'
import { getJSONResponse, sendPostRequest, sendPatchRequest } from '../../utilities/apiHelpers';
import { CrudForm } from '../../components/forms/CrudForm';
import { CCGTable } from '../../components/table/CCGTable';
import { bannerState, breadcrumbsState } from '../../atoms/atoms';
import { Row, Col, Form } from "react-bootstrap";
import { useAtom } from 'jotai';
import { EditColumns } from "./ProductTableSchema";
import _ from 'lodash';

interface IEditInvoiceProps {
    invoiceId: number | null;
}

const initialInvoiceData = {
    invoiceId: null,
    referenceNumber: '',
    invoiceStatus: '',
    invoiceDate: '',
    customer: '',
    salesRep: '',
    paymentStatus: '',
    invoiceAmount: '',
    paymentDue: '',
    datePaid: '',
    deliveryStatus: ''
};

const handleSubmit = async () => {
    console.log('Submitted!')
};

export const EditCreateInvoice = (props: IEditInvoiceProps) => {
    const { invoiceId } = props;

    const [invoiceData, setInvoiceData] = useState(initialInvoiceData);
    const [breadcrumbs, setBreadcrumbs] = useAtom(breadcrumbsState)


    useEffect(() => {
        if (!invoiceId) {
            setBreadcrumbs({ pathArr: [...breadcrumbs.pathArr, <span>New Customer</span>] })
        } else {
            setBreadcrumbs({ pathArr: [...breadcrumbs.pathArr, <span>Edit Customer</span>] })
        }
    }, [])

    return (
        <div className='mx-3'>
            <CrudForm header={invoiceId ? 'Edit Invoice' : 'New Invoice'} handleSubmit={handleSubmit}>
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

                        <Form.Group as={Row} className='mb-4 pb-1'>
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
                                // We will worry about validations later
                                />
                            </Col>
                        </Form.Group>

                        <Form.Group as={Row} className='mb-4 pb-1'>
                            <Form.Label className='fw-normal' column md={2} sm={2} xs={2}>
                                Invoice Status:
                            </Form.Label>
                            <Col className='mrp-50' md={3}>
                                <Form.Select
                                    onChange={(e) => setInvoiceData((prev) => ({ ...prev, invoiceStatus: e.target.value }))}
                                    value={invoiceData.invoiceStatus}
                                >
                                    {!invoiceData.invoiceStatus && <option value=""> </option>}
                                    <option>Confirmed</option>
                                    <option>Draft</option>
                                </Form.Select>
                            </Col>
                        </Form.Group>

                        <Form.Group as={Row} className='mb-4 pb-1'>
                            <Form.Label className='fw-normal' column md={2} sm={2} xs={2}>
                                Invoice Date:
                            </Form.Label>
                            <Col className='mrp-50' md={3}>
                                <Form.Control
                                    type='date'
                                    onChange={(e) => setInvoiceData((prev) => ({ ...prev, invoiceDate: e.target.value }))}
                                    value={invoiceData.invoiceDate}
                                />
                            </Col>
                        </Form.Group>

                        <Form.Group as={Row} className='mb-4 pb-1'>
                            <Form.Label className='fw-normal' column md={2} sm={2} xs={2}>
                                Customer:
                            </Form.Label>
                            <Col className='mrp-50' md={3}>
                                <Form.Select
                                    onChange={(e) => setInvoiceData((prev) => ({ ...prev, customer: e.target.value }))}
                                    value={invoiceData.customer}
                                >
                                    {!invoiceData.customer && <option> </option>}
                                    {/* Will need a customer list here */}
                                </Form.Select>
                            </Col>
                        </Form.Group>

                        <Form.Group as={Row} className='mb-4 pb-1'>
                            <Form.Label className='fw-normal' column md={2} sm={2} xs={2}>
                                Sales Representative:
                            </Form.Label>
                            <Col className='mrp-50' md={3}>
                                <Form.Select
                                    onChange={(e) => setInvoiceData((prev) => ({ ...prev, salesRep: e.target.value }))}
                                    value={invoiceData.salesRep}
                                >
                                    {!invoiceData.salesRep && <option> </option>}
                                    {/* Will need an employees? users? list here */}
                                </Form.Select>
                            </Col>
                        </Form.Group>

                        <strong><p className='mt-3 pb-3 mb-3 fs-5'>Payment Information</p></strong>

                        <Form.Group as={Row} className='mb-4 pb-1'>
                            <Form.Label className='fw-normal' column md={2} sm={2} xs={2}>
                                Payment Status:
                            </Form.Label>
                            <Col className='mrp-50' md={3}>
                                <Form.Select
                                    onChange={(e) => setInvoiceData((prev) => ({ ...prev, paymentStatus: e.target.value }))}
                                    value={invoiceData.paymentStatus}
                                >
                                    {!invoiceData.paymentStatus && <option> </option>}
                                    <option value='Paid'>Paid</option>
                                    <option value="Not paid">Not paid</option>
                                </Form.Select>
                            </Col>
                        </Form.Group>

                        <Form.Group as={Row} className='mb-4 pb-1'>
                            <Form.Label className='fw-normal' column md={2} sm={2} xs={2}>
                                Reference#:
                            </Form.Label>
                            <Col className='mrp-50' md={3}>
                                <Form.Control
                                    name='invoiceAmount'
                                    type='input'
                                    value={invoiceData.invoiceAmount}
                                    onChange={(e) => setInvoiceData((prevData) => ({ ...prevData, invoiceAmount: e.target.value }))}
                                    required
                                // We will worry about validations later
                                />
                            </Col>
                        </Form.Group>

                        <Form.Group as={Row} className='mb-4 pb-1'>
                            <Form.Label className='fw-normal' column md={2} sm={2} xs={2}>
                                Payment Due:
                            </Form.Label>
                            <Col className='mrp-50' md={3}>
                                <Form.Control
                                    type='date'
                                    onChange={(e) => setInvoiceData((prev) => ({ ...prev, paymentDue: e.target.value }))}
                                    value={invoiceData.paymentDue}
                                />
                            </Col>
                        </Form.Group>

                        <Form.Group as={Row} className='mb-4 pb-1'>
                            <Form.Label className='fw-normal' column md={2} sm={2} xs={2}>
                                Date Paid:
                            </Form.Label>
                            <Col className='mrp-50' md={3}>
                                <Form.Control
                                    type='date'
                                    onChange={(e) => setInvoiceData((prev) => ({ ...prev, datePaid: e.target.value }))}
                                    value={invoiceData.datePaid}
                                />
                            </Col>
                        </Form.Group>

                        <strong><p className='mt-3 pb-3 mb-3 fs-5'>Shipping Information</p></strong>

                        <Form.Group as={Row} className='mb-4 pb-1'>
                            <Form.Label className='fw-normal' column md={2} sm={2} xs={2}>
                                Delivery Status:
                            </Form.Label>
                            <Col className='mrp-50' md={3}>
                                <Form.Select
                                    onChange={(e) => setInvoiceData((prev) => ({ ...prev, deliveryStatus: e.target.value }))}
                                    value={invoiceData.deliveryStatus}
                                >
                                    {!invoiceData.deliveryStatus && <option> </option>}
                                    <option value='Shipped'>Shipped</option>
                                    <option value='Not shipped'>Not shipped</option>
                                </Form.Select>
                            </Col>
                        </Form.Group>

                        <div className='mt-5'>
                            <CCGTable
                                columns={EditColumns}
                                data={[]}
                                totalCount={ 0}
                                pageSize={5 }
                                pageIndex={ 0}
                                fetchDataFunction={() => null}
                                searchPlaceholder='Search by Parameter'
                                tableHeader='Invoice Items'
                            />
                        </div>

                    </Form>
                </div>
            </CrudForm >
        </div >
    )
}
