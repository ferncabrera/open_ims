import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Tooltip, OverlayTrigger } from 'react-bootstrap';
import { bannerState } from '../../atoms/atoms';
import { useResetAtom } from 'jotai/utils';
import { atom, useAtom } from 'jotai';
import _ from 'lodash';

import styles from "./index.module.scss";

interface IOpenIMSBannerProps {
    customStyleObject?: object
};


export const GlobalBanner : React.FC<IOpenIMSBannerProps>= ({ customStyleObject = {} }) => {
    
    const [bannerStateData, ] = useAtom(bannerState);
    //? ^ Note that I tried to make a read-only getter but I was getting a lot of typing issues.... TSC lol
    //? Since the abstraction of this into a read-only atom would only be for performance and we are not really hitting any bottlenecks this pattern of
    //? just using the useAtom and not a use a *********** const readOnlyAtom = atom((get) => get(priceAtom) * 2) ************ if fine for now


    const resetBannerState = useResetAtom(bannerState)

    const [isSuccess, setIsSuccess] = useState(false);

    const memoizedBannerStateData = useMemo(() => bannerStateData, [bannerStateData]);

    const tooltip = (additional) => (
         (bannerStateData?.additionalErrorDetails) ?
            <Tooltip id="tooltip">
                <strong>Additional Error Details:</strong> {bannerStateData.additionalErrorDetails}
            </Tooltip>
            :
            <></>
    );

    useEffect(() => {
        if (!_.isEmpty(memoizedBannerStateData)) {
            const closeAfterTimeout = () => { resetBannerState(); }

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
            {/* {!_.isEmpty(bannerStateData) && */}
            {bannerStateData.message &&
                <div className={`${isSuccess ? styles.success_bar : styles.invalid_bar}`}>
                    <OverlayTrigger placement="bottom" overlay={tooltip}>
                        <Alert id={'danger'} key='globalBanner' dismissible variant={bannerStateData.variant} onClose={resetBannerState}>
                            {bannerStateData.message}
                        </Alert>
                    </OverlayTrigger>

                </div>
            }

        </div>
    )
}
