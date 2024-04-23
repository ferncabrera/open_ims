import React, {useEffect, useState} from 'react';
import { EditCustomer } from '../customers/EditCustomer';

interface IRenderEditProps {
  entity: IEntityState;
}

export const RenderEdit = (props : IRenderEditProps) => {

  const {entity} = props;

  switch (entity.category) {
    case "customers":
      return (
      <EditCustomer
        customerId = {entity.id}
      />
      )
  }
}
