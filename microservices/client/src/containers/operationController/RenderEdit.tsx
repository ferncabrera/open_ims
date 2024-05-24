import React, {useEffect, useState} from 'react';
import { EditCreateCustomer } from '../customers/EditCreateCustomer';
import Error from '../Error';

interface IRenderEditProps {
  entity: IEntityState;
}

export const RenderEdit = (props : IRenderEditProps) => {

  const {entity} = props;

  switch (entity.category) {
    case "customers":
      return (
      <EditCreateCustomer
        customerId = {entity.id}
      />
      )
    
    default:
      return <Error/>
  }
}
