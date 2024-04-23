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
                        <div className='w-100'>
                            <span className={`${styles.titleSimpleSummaryCard} text-capitalize`}>
                                {titleContent}
                            </span>
                            <span className={`${styles.topRightIcon} float-end m-1`} style={{ color: colorScheme, backgroundColor: loadingSummaryData? styles.pageGrey: "inherit" }}>
                                {icon}
                                </span>
                        </div>
                        <div className={`${styles.mainBodySimpleSummaryCard} ${loadingSummaryData ? styles.floatNumbersInf : styles.floatNumbersIntoPos} py-2`} style={{ fontSize: "calc(.65vw + 2.75vh)" }}>{bodyContent}</div>
                        <div>
                            <span style={{ fontSize: "calc(5px + 1.15vh)" }}>{commentContent}</span>
                            <span className="text-nowrap w-100 h-75" ref={ref} {...triggerHandler}>
                                <span style={{ color: colorScheme, fontSize: "calc(6px + 1.25vh)", transition: "all 2s" }} className={`${styles.commentMetricText} ps-1`}>{commentMetric}</span>
                                {info && !loadingSummaryData &&
                                    <span className={`ms-1`}>
                                        <MdInfoOutline style={{ fontSize: "calc(.4vw + .1.25vh)", color: "#0d6efd" }} />
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

