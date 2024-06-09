import React, { useEffect, useState } from 'react';
import { EditCreateCustomer } from '../customers/EditCreateCustomer';
import { EditCreateInvoice } from '../invoices/EditCreateInvoice';
import { EditCreateVendor } from '../vendors/EditCreateVendor';
import Error from '../Error';

interface IRenderEditProps {
  entity: IEntityState;
}

export const RenderEdit = (props: IRenderEditProps) => {

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
        <EditCreateInvoice invoiceId={entity.id} />
      );
    
    case "vendors":
      return (
        <EditCreateVendor vendorId={entity.id} />
      )

    default:
      return <Error />
  }
}
