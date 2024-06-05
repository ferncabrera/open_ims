import React from 'react'
import { EditCreateCustomer } from '../customers/EditCreateCustomer';
import { EditCreateInvoice } from '../invoices/EditCreateInvoice';
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
    case "invoices":
      return (
        <EditCreateInvoice invoiceId={entity.id}/>
      )

    default:
      return <Error />
  }
}
