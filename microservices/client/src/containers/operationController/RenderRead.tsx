import React from 'react'
import { ReadCustomer } from '../customers/ReadCustomer';

interface IRenderReadProps {
  entity: IEntityState;
}

export const RenderRead = (props: IRenderReadProps) => {
  const {entity} = props;

  switch(entity.category) {
    case "customers":
      return(
        <ReadCustomer customerId={entity.id}/>
      )
  }
  
}
