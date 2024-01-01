import React, { useEffect } from 'react'
import { entityState } from '../../atoms/state';
import { useRecoilValue, useResetRecoilState } from 'recoil';
// This file is the interface between our routes and app that determines which crud operation we are showing, and what category type.
import { useLocation, useNavigate } from 'react-router';
import { RenderEdit } from './RenderEdit';
import { RenderRead } from './RenderRead';
import { RenderNew } from './RenderNew';

export const OperationController = () => {

  const entity: IEntityState = useRecoilValue(entityState);
  const resetEntity = useResetRecoilState(entityState);
  const currentUrl = useLocation();
  const navigate = useNavigate();


  useEffect(() => {
    const { action, category, path } = entity;
    if (!action || !category || !path) {
      const redirectUrl = getBaseUrl(currentUrl.pathname);
      return navigate(redirectUrl);
    }

    return () => {
      resetEntity();
    };
  }, [entity]);

  const getBaseUrl = (url: string) => {
    const pathSegments = url.split('/').filter(segment => segment.trim() !== '');
    return `/${pathSegments[0]}/${pathSegments[1]}`;
  }

  switch (entity.action) {
    case "create":
      return <RenderNew />

    case "update":
      return (
        <RenderEdit
        
        />
      )

    case "read":
      return <RenderRead />
  }
};
