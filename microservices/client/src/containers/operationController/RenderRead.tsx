import React from 'react'
import { ReadCustomer } from '../customers/ReadCustomer';
import { ReadInvoice } from '../invoices/ReadInvoice';
import { ReadVendor } from '../vendors/ReadVendor';
import Error from '../Error';

interface IRenderReadProps {
  entity: IEntityState;
}

export const RenderRead = (props: IRenderReadProps) => {
  const { entity } = props;

  switch (entity.category) {
    case "customers":
      return (
        <ReadCustomer customerId={entity.id} />
      )

    case "invoices":
        return (
          <ReadInvoice invoiceId={entity.id} />
        )
    
    case "vendors":
      return (
        <ReadVendor vendorId={entity.id} />
      )

    default:
      return <Error />
  }

}
