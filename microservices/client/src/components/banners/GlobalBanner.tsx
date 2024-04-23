import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Tooltip, OverlayTrigger } from 'react-bootstrap';
import { useRecoilValue, useRecoilState } from 'recoil';
import { bannerState } from '../../atoms/state';
import _ from 'lodash';

import styles from "./index.module.scss";

interface IBannerState {
    variant?: string;
    message?: string;
    infinite?: number;
    additionalErrorDetails?: string | false | undefined
}

interface IOpenIMSBannerProps {
    customStyleObject?: object

};

export const GlobalBanner : React.FC<IOpenIMSBannerProps>= ({ customStyleObject = {} }) => {

    const bannerStateData: IBannerState = useRecoilValue(bannerState);
    const [bannerTextState, setBannerTextState] = useRecoilState(bannerState);
    const [isSuccess, setIsSuccess] = useState(false);

    const memoizedBannerStateData = useMemo(() => bannerStateData, [bannerStateData]);

    const tooltip = (
        bannerStateData.additionalErrorDetails ?
            <Tooltip id="tooltip">
                <strong>Additional Error Details:</strong> {bannerStateData.additionalErrorDetails}
            </Tooltip>
            :
            <></>
    );

    useEffect(() => {
        if (!_.isEmpty(memoizedBannerStateData)) {
            const closeAfterTimeout = () => { setBannerTextState({}) }

            const timeoutId = setTimeout(closeAfterTimeout, bannerStateData.infinite || 7000) // close after 5 seconds automatically
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
        <div className={styles.loading_bar} style={customStyleObject}>
            {!_.isEmpty(bannerStateData) &&
                <div className={`${isSuccess ? styles.success_bar : styles.invalid_bar}`}>
                    <OverlayTrigger placement="bottom" overlay={tooltip}>
                        <Alert id={'danger'} key='globalBanner' dismissible variant={bannerStateData.variant} onClose={() => setBannerTextState({})}>
                            {bannerStateData.message}
                        </Alert>
                    </OverlayTrigger>

                </div>
            }

        </div>
    )
}
