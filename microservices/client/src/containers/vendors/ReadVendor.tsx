import React, { useEffect, useState } from 'react';

import { CrudForm } from '../../components/forms/CrudForm';
import { Row, Col } from 'react-bootstrap';
import { PillButton } from '../../components/buttons/PillButton';
import { CCGTable } from '../../components/table/CCGTable';
import { Columns } from "./VendorPurchaseTableSchema";

import { MdOutlinePictureAsPdf, MdOutlineEdit } from 'react-icons/md';
import { FaRegTrashAlt } from 'react-icons/fa';

import { getJSONResponse, sendDeleteRequest } from '../../utilities/apiHelpers';
import { useNavigate } from 'react-router';
import { useAtom } from 'jotai';
import { breadcrumbsState, bannerState, entityState } from '../../atoms/atoms';

import _ from 'lodash';

interface IReadVendorProps {
    vendorId: number;
};

interface IVendorData {
    vendorId: number | null;
    companyName: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
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

const initialVendorData: IVendorData = {
    vendorId: null,
    companyName: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
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
};

export const ReadVendor = (props: IReadVendorProps) => {

    const { vendorId } = props;

    const navigate = useNavigate();

    const [vendorData, setVendorData] = useState<IVendorData>(initialVendorData);
    const [purchaseOrderData, setPurchaseOrderData] = useState({});
    const [breadcrumbs, setBreadcrumbs] = useAtom(breadcrumbsState);
    const [banner, setBanner] = useAtom(bannerState);
    const [entity, setEntity] = useAtom(entityState);

    useEffect(() => {
        getVendorData();
        getVendorPurchaseOrders(10, 0, { purchase_vendor_id: vendorId });
    }, []);

    const getVendorData = async () => {
        const response: IResponse = await getJSONResponse({ endpoint: '/api/server/vendor', params: { id: vendorId } });
        if (response.status !== 200) {
            return setBanner({ message: (response?.message ? response.message : global.__APP_DEFAULT_ERROR_MSG__), variant: 'danger' });
        };
        setBreadcrumbs({ pathArr: [...breadcrumbs.pathArr, <span>{response.data.companyName}</span>] })
        setVendorData(response.data);
    }

    const getVendorPurchaseOrders = async (pageSize, pageIndex, searchParams) => {
        const modifiedSearchParams = { ...searchParams, purchase_vendor_id: vendorId }
        const searchQuery = JSON.stringify(modifiedSearchParams);

        const response: IResponse = await getJSONResponse({ endpoint: '/api/server/purchase-orders', params: { pageIndex, pageSize, searchQuery } });
        if (response.status !== 200) {
            return setBanner({ message: (response.message ? response.message : global.__APP_DEFAULT_ERROR_MSG__) , variant: 'danger' })
        };
        setPurchaseOrderData(response);
    }

    const handleDelete = async (id) => {
        const response: any = await sendDeleteRequest({ endpoint: '/api/server/vendor', data: { vendor_id: id } });
        if (response.status === 200) {
            setBanner({ message: response.message, variant: 'success' });
        } else {
            setBanner({ message: 'Something went wrong with deleting vendor', variant: 'danger' });
            return
        }

        navigate('/ccg/vendors');
    };

    const handleEdit = (id) => {
        setEntity({
            action: 'update',
            category: 'vendors',
            path: `/ccg/vendors/edit/${id}`,
            id: Number(id)
        });
    };

    const renderVendorData = () => {
        const data = [
            { label: 'Vendor ID', val: vendorId },
            { label: 'Company Name', val: vendorData.companyName },
            { label: 'Contact Name', val: `${vendorData.firstName} ${vendorData.lastName}` },
            { label: 'Email', val: vendorData.email },
            { label: 'Phone', val: vendorData.phone },
        ];

        const infoArr : (React.ReactElement)[] = [];

        const JSXFrame = (element) => {
            return (
                <Row className='mb-3' key={element.label}>
                    <Col sm={4}>{element.label}:</Col>
                    <Col>{element.val}</Col>
                </Row>
            )
        };

        _.forEach(data, (field) => {
            infoArr.push(JSXFrame(field))
        });

        return infoArr;
    }

    const renderAddressData = (addressType: string) => {
        const jsxFrame = (addressType, addressData) => {
            return (
                <Row>
                    <Col sm={4}>{`${addressType} Address:`}</Col>
                    <Col className='no-space'>
                        {/* <Row> */}
                        <p className=''>{addressData.vendorAddressName}</p>
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
            return jsxFrame(addressType, vendorData.shipping)
        } else {
            return jsxFrame(addressType, vendorData.billing)
        }
    }

    return (
        <div className='mx-3'>
            <Row className=' mt-3 justify-content-end'>
                <Col className='d-flex align-items-center'>
                    <h2>Vendors</h2>
                </Col>
                <Col className='d-flex justify-content-end' xs={7} >
                    <PillButton className='me-2' onClick={() => console.log("todo!")} text='Export' color='standard' icon={<MdOutlinePictureAsPdf />} />
                    <PillButton className='me-2' onClick={() => handleDelete(vendorId)} text='Delete' color='standard' icon={<FaRegTrashAlt />} />
                    <PillButton className='me-1' onClick={() => handleEdit(vendorId)} text='Edit Vendor' color='blue' icon={<MdOutlineEdit />} />
                </Col>
            </Row>
            <CrudForm
                header={vendorData.companyName}
                handleSubmit={async () => false}
            >
                <div className='mt-5'>
                    <Row>
                        <Col>
                            {renderVendorData()}
                        </Col>
                        <Col>
                            <div>
                                {vendorData.shipping ? renderAddressData('Shipping') : null}
                            </div>
                            <div className='mt-4'>
                                {vendorData.billing ? renderAddressData('Billing') : null}
                            </div>

                        </Col>
                    </Row>
                </div>
                <div className='mt-5'>
                    <CCGTable
                        tableHeader={`${vendorData.companyName} Previous Purchase Orders`}
                        columns={Columns}
                        data={_.get(purchaseOrderData, 'purchases', [])}
                        fetchDataFunction={getVendorPurchaseOrders} //Function must accept params of (pageSize, pageIndex, searchQuery) in that order!!
                        totalCount={_.get(purchaseOrderData, 'total', 0)}
                        pageIndex={_.get(purchaseOrderData, 'pageindex', 0)}
                        pageSize={_.get(purchaseOrderData, 'pagesize', 10)}
                        searchPlaceholder='Search by Number, Amount, or Status'
                        filters={[{ label: 'Date', type: 'date', id: 0 }]}
                    />
                </div>
            </CrudForm>
        </div>
    )
};
