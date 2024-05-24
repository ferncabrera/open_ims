import React from 'react'
import { EditCreateCustomer } from '../customers/EditCreateCustomer';
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
      )

    default:
      return <Error />
  }
}
