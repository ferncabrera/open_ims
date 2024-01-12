import Card from 'react-bootstrap/Card';
import styles from './SimpleSummaryCard.module.scss'
import React from 'react';

interface OpenIMSChartProps {
    titleContent: string;
    bodyContent: string;
    icon?: React.ReactElement;
    commentMetric: string;
    colorScheme?: string;
    commentContent?: string;
};

export const SimpleSummaryCard: React.FC<OpenIMSChartProps> = ({titleContent, bodyContent, icon = null, commentMetric = null, colorScheme, commentContent}) => {

    return (
    <Card className={`py-2 px-2 px-xxl-3 px-xl-2 py-xl-2 py-xxl-3`}>
      <Card.Body className={`${"p-1"}`}>
        <div className={`${styles.titleSimpleSummaryCard} text-capitalize`}>{titleContent}</div>
        <div className={`${styles.mainBodySimpleSummaryCard} py-2 py-xl-3`} >{bodyContent}</div>
        <div>
        <span className={`${styles.commentIcon}`} style={{color: colorScheme}}>{icon}</span><span className='ps-2'>{commentContent}</span><span style={{color: colorScheme}} className={`${styles.commentMetricText} ps-1`}>{commentMetric}</span>
        </div>
        </Card.Body>
    </Card>
  );
}

