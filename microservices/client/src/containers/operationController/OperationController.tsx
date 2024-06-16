import React, { useEffect } from 'react'
import { entityState, breadcrumbsState } from '../../atoms/atoms';
import { useAtom } from 'jotai';
import { useResetAtom } from 'jotai/utils';
// This file is the interface between our routes and app that determines which crud operation we are showing, and what category type.
import { useLocation, useNavigate } from 'react-router';
import { RenderEdit } from './RenderEdit';
import { RenderRead } from './RenderRead';
import { RenderNew } from './RenderNew';
import Error from '../Error';

export const OperationController = () => {

  const resetEntity = useResetAtom(entityState);
  const [entity, setEntity] = useAtom(entityState);
  const currentUrl = useLocation();
  const navigate = useNavigate();
  
  //? Ideally, any update to the global entity state (entity state contains all info required to get to any path in our application) would trigger this operations controller
  //? that would navigate the user to wherever the current entity is set.
  
  //? In the case that the re-direct to a route on our client does not come from an update to entity state, we should not just abort and go to the base URL, but
  //? since we already have frontend authentication blocking unathorized routes, we should be OK to try a re-direct to the requested url somehow...

  //? Any security concerns we need to consider here?
  useEffect(() => {
    console.log("This is entity !", entity);
    console.log("This is currentURL !", currentUrl);
    const { action, category, path } = entity;
    if (!action || !category || !path) {
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
