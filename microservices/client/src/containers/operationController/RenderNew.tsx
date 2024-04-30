import React from 'react'
import { EditCustomer } from '../customers/EditCustomer';

interface IRenderNewProps {
  entity: IEntityState;
}

export const RenderNew = (props: IRenderNewProps) => {

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
