import React, {useEffect, useState} from 'react';
import { EditCreateCustomer } from '../customers/EditCreateCustomer';

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
  }
}
