import React, { useState } from 'react'

import DateRangePicker from '@wojtekmaj/react-daterange-picker';
import '@wojtekmaj/react-daterange-picker/dist/DateRangePicker.css';
import 'react-calendar/dist/Calendar.css';
import { IoCalendarOutline, IoClose } from "react-icons/io5";
import { GrPowerReset } from "react-icons/gr";
import styles from "./CCGDateRangePicker.module.scss";
import { DateRange } from '../../utilities/types/types';
import { standardizeDateRangeTime } from '../../utilities/helpers/functions';

interface ICCGDateRangePickerProps {
    dateRange: DateRange,
    setDateRange: (value: DateRange) => void;
    maxDetail?: any | undefined
    additionalClasses?: any // This can be passed a custom styles.youCustomClass object! 
};

export const CCGDateRangePicker: React.FC<ICCGDateRangePickerProps> = ({dateRange, setDateRange, maxDetail, additionalClasses}) => {

    // const [dateRange, setDateRange] = useState<DateRange>([new Date(), new Date()]);
    const [isCalendarOpened, setIsCalendarOpened] = useState<Boolean>(false);

    console.log("dateRange to fix :((( => ", dateRange);

    return (
        <>
            <DateRangePicker
                calendarClassName={`${styles.calendarStyling} mt-1`}
                // locale='UTC'
                className={`${styles.dateRangePickerStyling} ${additionalClasses}`}
                onChange={(dr) => {console.log("returned daterange => ", dr);setDateRange(dr)}}
                value={standardizeDateRangeTime(dateRange)}
                tileClassName={`${styles.tileStyling}`}
                // maxDetail={maxDetail}
                rangeDivider="to"
                calendarIcon={
                    <IoCalendarOutline
                        className={`${styles.dateRangePickerCalIcon} ${isCalendarOpened ? styles.ccgIconButtonIsSelected : null}`}
                    />
                }
                clearIcon={
                    <GrPowerReset
                        className={`${styles.dateRangePickerCloseIcon}`}
                    />
                }
                onCalendarClose={() => setIsCalendarOpened(false)}
                onCalendarOpen={() => setIsCalendarOpened(true)}
            // maxDetail='' // TODO set to month or year or (decade) depending on the selection of the chart granularity
            />
        </>
    )
};
