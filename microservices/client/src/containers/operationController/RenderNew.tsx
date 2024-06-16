import React from 'react'
import { EditCreateCustomer } from '../customers/EditCreateCustomer';
import { EditCreateInvoice } from '../invoices/EditCreateInvoice';
import { EditCreateVendor } from '../vendors/EditCreateVendor';
import Error from '../Error';

interface IRenderNewProps {
  entity: IEntityState;
}

export const RenderNew = (props: IRenderNewProps) => {

  const { entity } = props;

  switch (entity.category) {
    case "customers":
      return (
        <EditCreateCustomer
          customerId={entity.id}
        />
      );
    case "sales":
      return (
        <EditCreateInvoice invoiceId={entity.id}/>
      )
    case "vendors":
      return (
        <EditCreateVendor vendorId={entity.id}/>
      )

    default:
      return <Error />
  }
}
