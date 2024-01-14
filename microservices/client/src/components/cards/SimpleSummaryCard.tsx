import Card from 'react-bootstrap/Card';
import styles from './SimpleSummaryCard.module.scss'
import React from 'react';
import { Tooltip, OverlayTrigger, Container } from 'react-bootstrap';
import { MdInfoOutline } from "react-icons/md";

interface OpenIMSChartProps {
    titleContent: string;
    bodyContent: string | React.ReactElement;
    icon?: React.ReactElement;
    info?: React.ReactElement;
    commentMetric: string;
    colorScheme?: string;
    commentContent?: string;
    loadingSummaryData: boolean;
    id: string;
};

export const SimpleSummaryCard: React.FC<OpenIMSChartProps> = ({ id, titleContent, bodyContent, icon = null, commentMetric = null, colorScheme, commentContent, loadingSummaryData, info = false }) => {

    const tooltip = (
        <Tooltip id="tooltip">
            <strong>TBD</strong> Will put comparison metrics here.
        </Tooltip>
    );
    return (
        <OverlayTrigger
            placement="top"
            overlay={
                <Tooltip id="button-tooltip-2">
                    Willl put comparison metrics here.
                </Tooltip>
            }
        >
            {({ ref, ...triggerHandler }) => (
                <Card className={`py-2 px-2 px-xxl-3 px-xl-2 py-xl-2 py-xxl-3 ${styles.simpleSummaryCardBorder}`}>
                    <Card.Body className={`${"p-1"}`}>
                        <div className={`${styles.titleSimpleSummaryCard} text-capitalize`}>{titleContent}</div>
                        <div className={`${styles.mainBodySimpleSummaryCard} ${loadingSummaryData ? styles.floatNumbersInf + " py-2 py-xl-3 m-0" : styles.floatNumbersIntoPos + " py-2 py-xl-3"}`} >{bodyContent}</div>
                        <div>
                            <span className={`${styles.commentIcon} ${loadingSummaryData ? styles.greyIconBackgroundPulse : null}`} style={{ color: colorScheme }}>{icon}</span>
                            <span className='ps-2'>{commentContent}</span>
                            <span className="text-nowrap w-100 h-100" ref={ref} {...triggerHandler}>
                                <span style={{ color: colorScheme }} className={`${styles.commentMetricText} ps-1`}>{commentMetric}</span>
                                {info && !loadingSummaryData &&
                                        <span className={`ms-1`}>
                                            <MdInfoOutline style={{ color: "#0d6efd", width: "20px", height: "25px", margin: "0px 0px .2rem 0px" }} />
                                        </span>
                                }
                            </span>
                        </div>
                    </Card.Body >
                </Card >
            )}
        </OverlayTrigger>
    );
}

