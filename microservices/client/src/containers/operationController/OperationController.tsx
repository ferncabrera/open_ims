import React, { useEffect } from 'react'
import { entityState, breadcrumbsState } from '../../atoms/state';
import { useRecoilValue, useResetRecoilState, useRecoilState, SetterOrUpdater} from 'recoil';
// This file is the interface between our routes and app that determines which crud operation we are showing, and what category type.
import { useLocation, useNavigate } from 'react-router';
import { RenderEdit } from './RenderEdit';
import { RenderRead } from './RenderRead';
import { RenderNew } from './RenderNew';
import Error from '../Error';

export const OperationController = () => {

//   const entity: IEntityState = useRecoilValue(entityState);
  const resetEntity = useResetRecoilState(entityState);
  const [entity, setEntity]: Array<IEntityState|SetterOrUpdater<IEntityState>> = useRecoilState(entityState);
  const currentUrl = useLocation();
  const navigate = useNavigate();
  

  useEffect(() => {
    // This is just a tempfix until we coordinate what the best idea would be here including security concerns......
    console.log("This is entity !", entity);
    console.log("This is currentURL !", currentUrl);
    const { action, category, path } = entity;
    if (!action || !category || !path) {
        // Entity was not set in this case, but currentlUrl could be an external link that an already authorized user (who has cookies in their broweser session)
        // has clicked and followed. We should redirect to the currentURl path in this case.... need to follow up on how logic works here with @polsander
      const redirectUrl = getBaseUrl(currentUrl.pathname);
      console.log("redirect url ", redirectUrl);
      return navigate(redirectUrl);
    } else {
      return navigate(path)
    }
  }, [entity]);

  const getBaseUrl = (url: string) => {
    const pathSegments = url.split('/').filter(segment => segment.trim() !== '');
    return `/${pathSegments[0]}/${pathSegments[1]}`;
  }

  switch (entity.action) {
    case "create":
      return <RenderNew
        entity={entity}
      />

    case "update":
      return (
        <RenderEdit
          entity={entity}
        />
      )

    case "read":
      return <RenderRead 
        entity={entity}
      />
    
    default:
      return <Error/>
  }
};
