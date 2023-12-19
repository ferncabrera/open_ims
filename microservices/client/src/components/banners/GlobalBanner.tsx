import React, { useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-bootstrap';
import { useRecoilValue, useRecoilState } from 'recoil';
import { bannerState } from '../../atoms/state';
import _ from 'lodash';

import styles from "./index.module.scss";

interface IBannerState {
  variant?: string;
  message?: string;
  infinite?: number;
}

export const GlobalBanner = () => {

  const bannerStateData: IBannerState = useRecoilValue(bannerState);
  const [bannerTextState, setBannerTextState] = useRecoilState(bannerState);
  const [isSuccess, setIsSuccess] = useState(false);

  const memoizedBannerStateData = useMemo(() => bannerStateData, [bannerStateData]);


  useEffect(() => {
    if (!_.isEmpty(memoizedBannerStateData)) {
      const closeAfterTimeout = () => { setBannerTextState({}) }

      const timeoutId = setTimeout(closeAfterTimeout, bannerStateData.infinite || 5000) // close after 10 seconds automatically
      return () => clearTimeout(timeoutId)
    }
  }, [memoizedBannerStateData]);

  useEffect(() => {
    if (bannerStateData.variant === "success") {
      setIsSuccess(true)
    } else {
      setIsSuccess(false)
    }
  }, [memoizedBannerStateData])


  return (
    <div className={styles.loading_bar}>
      {!_.isEmpty(bannerStateData) &&
        <div className={isSuccess? styles.success_bar : styles.invalid_bar}>
          <Alert id={'danger'} key='globalBanner' dismissible variant={bannerStateData.variant} onClose={() => setBannerTextState({})}>
            {bannerStateData.message}
          </Alert>
        </div>
      }

    </div>
  )
}
