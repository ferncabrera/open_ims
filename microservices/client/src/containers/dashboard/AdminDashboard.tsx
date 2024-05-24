import React, { useEffect, useState } from 'react'
import { getJSONResponse } from '../../utilities/apiHelpers';
import { isUserAuth } from '../../utilities/helpers/functions';
import { CCGChart } from '../../components/charts/CCGChart';
import _, { stubFalse } from 'lodash';
import { CCGDateRangePicker } from '../../components/calendars/CCGDateRangePicker';
import { Container, Row, Col, Dropdown } from 'react-bootstrap';
import { DateRange } from '../../utilities/types/types';
import styles from "./index.module.scss";
import { SimpleSummaryCard } from '../../components/cards/SimpleSummaryCard';
import { MdMoving, MdInfoOutline } from "react-icons/md";
import { bannerState } from '../../atoms/state';
import { useRecoilState } from 'recoil';

const delay = ms => new Promise(res => setTimeout(res, ms));

let USDollar = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});

const standardMetricDateRanges = [
    "week",
    "month",
    // "quarter",
    "year",
    "all",
    "custom"
];

function getSummaryOfTimePeriod(data: any[]) {
    let filteredForYears = data.filter(item => item.granularity === "year");

    if (filteredForYears.length === 0) {
        return {}; // Return an empty object if the input array is empty
    }

    // Initialize the aggregated object with the first entry in the array
    let aggregatedData = { ...filteredForYears[0] };

    // Loop through the remaining entries and sum up the values
    for (let i = 1; i < filteredForYears.length; i++) {
        aggregatedData.projected_expenses += filteredForYears[i].projected_expenses;
        aggregatedData.expenses += filteredForYears[i].expenses;
        aggregatedData.projected_income += filteredForYears[i].projected_income;
        aggregatedData.income += filteredForYears[i].income;
        aggregatedData.profit += filteredForYears[i].profit;
    }

    return { aggregatedData };

};

interface TimeRangeSummaryObj {
    expenses: number | string,
    income: number | string,
    projected_expenses: number | string,
    projected_income: number | string,
    granularity: number | string,
    profit: number | string,
    name: string,
    profit_percent_movement: string | number,
    expense_percent_movement: string | number,
    income_percent_movement: string | number,
};

export const AdminDashboard = () => {
    const [userInfo, setUserInfo] = useState({ firstName: null, email: null, permission: null });
    const [dateRange, setDateRange] = useState<DateRange>(null);
    const [prevDateRange, setPrevDateRange] = useState<DateRange>(null);
    const [dashboardMetricsGranularity, setDashboardMetricsGranularity] = useState("month");
    const [incomeExpenseProfitQueryData, setIncomeExpenseProfitQueryData] = useState([]);
    const [timeRangeSummary, setTimeRangeSummary] = useState<TimeRangeSummaryObj>();
    const [loadingTileData, setLoadingTileData] = useState<boolean>(false);
    const [randomNumbers, setRandomNumbers] = useState<number>(0);
    const [bannerTextState, setBannerTextState] = useRecoilState(bannerState);


    useEffect(() => {
        isUserAuth().then((response: any) => {
            setUserInfo({ firstName: response.firstName, email: response.email, permission: response.permission });
        }).catch((error) => {
            return
        })
    }, []);

    return (
        <div className="px-2 h-75">
            <Row className={"py-1"}>

                <Col xs={dashboardMetricsGranularity != "custom" ? 8: 6} className={"align-self-center"}>
                    {userInfo.firstName !== null &&
                        <p style={{ fontSize: "calc(16px + 1.25vw)" }} className='mb-0 font-30 dark-text my-md-3 mt-2 text-nowrap'>Welcome back, <span className='text-capitalize'>{userInfo.firstName}</span>.</p>
                    }
                </Col>

                <Col sm={dashboardMetricsGranularity != "custom" ? 4 : 6} className={"align-self-end"} >
                    <div className='text-nowrap float-end'>
                        {dashboardMetricsGranularity != "custom" ?
                            <>
                                <p
                                    className='d-inline-block mb-0'
                                    style={{ fontSize: "calc(12px + .65vw)" }}
                                >
                                    here's your
                                </p>

                                <Dropdown
                                    align="start"
                                    drop="down"
                                    style={{
                                    }}
                                    className='d-inline-block'
                                >
                                    <Dropdown.Toggle
                                        className='px-1 pb-1'
                                        id={`${styles.dashboardMetricsGranularityDropdown}`}
                                        style={{ fontSize: "calc(12px + .65vw)" }}
                                    >
                                        <span
                                        >
                                            <u>{dashboardMetricsGranularity == "all" ? `history.` : `${dashboardMetricsGranularity}.`}</u>
                                        </span>
                                    </Dropdown.Toggle>

                                    <Dropdown.Menu
                                        className={`${styles.dashboardMetricsGranularityDropdownMenu}`}
                                    // style={{fontSize: "calc(.4vw + 1.35vh)"}}
                                    >
                                        {standardMetricDateRanges.map((r, i) => {
                                            if (r == dashboardMetricsGranularity)
                                                return null;
                                            if (r == "custom")
                                                return <>
                                                    <Dropdown.Divider key={`${r}divider`} />
                                                    <Dropdown.Item style={{ fontSize: "calc(14px + .35vh)" }} key={r} className={`py-1 ${styles.dashboardMetricsGranularityDropdownMenuItem}`} onClick={() => { setDashboardMetricsGranularity(r); }} >{`${r} range`}</Dropdown.Item>
                                                </>
                                            if (r == "all")
                                                return <Dropdown.Item style={{ fontSize: "calc(14px + .35vh)" }} key={r} className={`py-1 ${styles.dashboardMetricsGranularityDropdownMenuItem}`} onClick={() => { setDashboardMetricsGranularity(r); }} >{`${r} time`}</Dropdown.Item>
                                            return <Dropdown.Item style={{ fontSize: "calc(14px + .35vh)" }} key={r} className={`py-1 ${styles.dashboardMetricsGranularityDropdownMenuItem}`} onClick={() => { setDashboardMetricsGranularity(r); }} >{`${r}`}</Dropdown.Item>
                                        })}
                                    </Dropdown.Menu>
                                </Dropdown>
                            </>
                            :
                            <>
                                <CCGDateRangePicker dateRange={dateRange} setDateRange={setDateRange} additionalClasses={`float-lg-end mb-2 px-2 bg-white ${styles.dashboardDateRangePicker}`} />
                            </>
                        }
                    </div>

                </Col>

            </Row>

            <Row className='h-100'>

                <iframe src="http://localhost/grafana/d/bdmmm33qzyfwgc/test?orgId=1&from=1713924486069&to=1716516486069&kiosk&theme=light" width="100%" height="100%" frameBorder="0"></iframe>
 
            </Row>
        </div>
    )
}
