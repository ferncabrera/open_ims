import React, { useEffect, useState } from 'react';
import { CrudForm } from '../../components/forms/CrudForm';
import { PillButton } from '../../components/buttons/PillButton';
import { StatusPill } from '../../components/graphics/StatusPill';
import { CCGTable } from '../../components/table/CCGTable';
import { useRecoilState } from 'recoil';
import { breadcrumbsState, bannerState, entityState } from '../../atoms/state';
import { getJSONResponse, sendDeleteRequest } from '../../utilities/apiHelpers';
import { useNavigate } from 'react-router';
import { Row, Col } from 'react-bootstrap';
import { MdOutlineEdit, MdOutlinePictureAsPdf } from "react-icons/md";
import { FaRegTrashAlt } from "react-icons/fa";
import { hasEmptyKeys, convertDateISO } from '../../utilities/helpers/functions';
import _ from 'lodash';


interface IReadInvoiceProps {
    invoiceId: number;
}

interface IInvoiceData {

    invoiceStatus: string;
    invoiceId: number;
    referenceNumber: string;
    invoiceDate: string;
    customer: string;
    salesRepresentative: string;
    paymentStatus: string;
    invoiceAmount: number;
    paymentDueDate: string;
    datePaid: string;
    deliveryStatus: string;
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
    };
};

const initialInvoiceData = {

    invoiceStatus: '',
    invoiceId: null,
    referenceNumber: '',
    invoiceDate: '',
    customer: '',
    salesRepresentative: '',
    paymentStatus: '',
    invoiceAmount: null,
    paymentDueDate: '',
    datePaid: '',
    deliveryStatus: '',
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

export const ReadInvoice = (props: IReadInvoiceProps) => {

    const invoiceId = props.invoiceId;
    const navigate = useNavigate();

    const [breadcrumbs, setBreadcrumb] = useRecoilState(breadcrumbsState);
    const [banner, setBanner] = useRecoilState(bannerState);
    const [entity, setEntity] = useRecoilState<IEntityState>(entityState);
    const [invoiceData, setInvoiceData] = useState<IInvoiceData>(initialInvoiceData);
    const [tableData, setTableData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [tableLoading, setTableLoading] = useState(true);

    useEffect(() => {
        getInvoiceData();
        setBreadcrumb({ pathArr: [...breadcrumbs.pathArr, <span>{`Invoice #${invoiceId}`}</span>] })
        // We need this product stuff figured out for the product table
        // getProductData(10, 0);
    }, []);

    const getInvoiceData = async () => {
        const response: IResponse = await getJSONResponse({ endpoint: '/api/server/single-invoice', params: { id: props.invoiceId } });
        if (response.status !== 200) {
            setBanner({ message: response.message, variant: 'danger' });
            return
        }
        if (!_.isEmpty(response.data)) {
            setInvoiceData(response.data);
            setIsLoading(false);
        }

    };

    const handleDelete = async (invoiceId: number) => {
        const response: any = await sendDeleteRequest({ endpoint: '/api/server/single-invoice', data: { id: invoiceId } });
        if (response.status === 200) {
            setBanner({ message: response.message, variant: 'success' });
        } else {
            setBanner({ message: 'Something went wrong with deleting invoice', variant: 'danger' });
            return
        }

        navigate('/ccg/invoices');
    };

    const handleEdit = (invoiceId: number) => {
        setEntity({
            action: 'update',
            category: 'invoices',
            path: `/ccg/invoices/edit/${invoiceId}`,
            id: Number(invoiceId)
        });
    };

    const getPillColor = (fieldLabel: string) => {
        if ((fieldLabel === 'Paid') || (fieldLabel === 'Confirmed') || (fieldLabel === 'Delivered') || (fieldLabel === 'Shipped')) {
            return 'green'
        } else if (fieldLabel === 'Draft') {
            return 'yellow'
        } else {
            return 'red'
        }
    };

    const renderInvoiceData = () => {

        const infoSection = [
            { label: 'Invoice Status', val: invoiceData.invoiceStatus },
            { label: 'Invoice#', val: invoiceData.invoiceId },
            { label: 'Reference#', val: invoiceData.referenceNumber },
            { label: 'Invoice Date', val: convertDateISO(invoiceData.invoiceDate) },
            { label: 'Customer', val: invoiceData.customer },
            { label: 'Sales Representative', val: invoiceData.salesRepresentative }
        ];
        const paymentSection = [
            { label: 'Payment Status', val: invoiceData.paymentStatus },
            { label: 'Invoice Amount', val: `$${invoiceData.invoiceAmount}` },
            { label: 'Payment Due', val: convertDateISO(invoiceData.paymentDueDate) },
            { label: 'Date Paid', val: convertDateISO(invoiceData.datePaid) }
        ];

        const JSXInfoFieldArray = [];
        const JSXPaymentFieldArray = [];


        const JSXFrame = (label: string, value: any) => (
            <Row className='mb-3' key={label}>
                <Col sm={2}> {label}:</Col>
                <Col>{value}</Col>
            </Row>
        );

        const JSXFrameBold = (label: string, value: any) => (
            <Row className='mb-3' key={label}>
                <Col sm={2}> {label}:</Col>
                <Col><strong>{value}</strong></Col>
            </Row>
        );

        const JSXPillFrame = (label: string, value: any, color: "green" | "yellow" | "red") => (
            <Row className='mb-3' key={label}>
                <Col sm={2}>{label}:</Col>
                <Col><StatusPill text={value} color={color} /></Col>
            </Row>
        );


        _.forEach(infoSection, (field) => {
            if ((field.label === 'Invoice Status') && (!_.isNumber(field.val))) {
                const color = getPillColor(field.val);
                JSXInfoFieldArray.push(JSXPillFrame(field.label, field.val, color));
                return
            }
            if ((field.label === 'Invoice#') || (field.label === 'Reference#')) {
                JSXInfoFieldArray.push(JSXFrameBold(field.label, field.val))
                return
            }
            JSXInfoFieldArray.push(JSXFrame(field.label, field.val))
        });

        _.forEach(paymentSection, (field) => {
            if ((field.label === 'Payment Status') && (!_.isNumber(field.val))) {
                const color = getPillColor(field.val);
                JSXPaymentFieldArray.push(JSXPillFrame(field.label, field.val, color));
                return
            }
            JSXPaymentFieldArray.push(JSXFrame(field.label, field.val));
        })

        return (
            <div>
                <div>
                    {JSXInfoFieldArray}
                </div>

                <div className='mt-4 pt-2'>
                    <strong><p className='mb-3 fs-5'>Payment Information</p></strong>
                    {JSXPaymentFieldArray}
                </div>
            </div>

        )
    };

    const RenderAddressInfo = (addressType: string) => {
        // address type can be 'Billing' or 'Shipping'

        const jsxFrame = (addressType, addressData) => {
            return (
                <Row className='mb-3'>
                    <Col sm={2}>{`${addressType} Address:`}</Col>
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
            return jsxFrame(addressType, invoiceData.shipping)
        } else {
            return jsxFrame(addressType, invoiceData.billing)
        }


    }

    return (
        <div>
            <Row className=' mt-3 justify-content-end'>
                <Col className='d-flex align-items-center'>
                    <h2>Customers</h2>
                </Col>
                <Col className='d-flex justify-content-end' xs={7} >
                    <PillButton className='me-2' onClick={null} text='Export' color='standard' icon={<MdOutlinePictureAsPdf />} />
                    <PillButton className='me-2' onClick={() => handleDelete(invoiceId)} text='Delete' color='standard' icon={<FaRegTrashAlt />} />
                    <PillButton className='me-1' onClick={() => handleEdit(invoiceId)} text='Edit Customer' color='blue' icon={<MdOutlineEdit />} />
                </Col>
            </Row>
            <CrudForm
                header={invoiceId ? `Invoice #${invoiceId}` : 'Retrieving...'}
                handleSubmit={() => null}
            >
                {!isLoading &&
                    <>
                        <Row className='mt-5'>
                            {renderInvoiceData()}
                        </Row>
                        <Row>
                            <strong><p className='mt-3 pb-1 mb-3 fs-5'>Shipping Information</p></strong>

                            <Row className='mb-1'>
                                <Col sm={2}>
                                    Delivery Status:
                                </Col>
                                <Col>
                                    <p><StatusPill text={invoiceData.deliveryStatus} color={getPillColor(invoiceData.deliveryStatus)} /></p>
                                </Col>

                            </Row>

                            {!hasEmptyKeys(invoiceData.shipping) && RenderAddressInfo('Shipping')}
                            <br />
                            {!hasEmptyKeys(invoiceData.billing) && RenderAddressInfo('Billing')}
                        </Row>
                    </>
                }
                <div className='my-4 pt-5' style={{ marginTop: "70px" }}>

                    {/* <CCGTable
                        columns={Columns}
                        data={_.get(tableData, 'invoices', [])}
                        fetchDataFunction={getInvoiceData}
                        totalCount={_.get(tableData, 'totalCount', 0)}
                        pageSize={_.get(tableData, 'pagesize', 0)}
                        pageIndex={_.get(tableData, 'pageindex', 0)}
                        searchPlaceholder='Search Order Number, Amount, or Status'
                        filters={[{ type: 'date', label: 'Date', id: 0 }]}
                    /> */}
                </div>
            </CrudForm>
        </div>
    )
}
