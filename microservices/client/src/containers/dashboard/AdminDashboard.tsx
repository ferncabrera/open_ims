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
import { standardizeDateRangeTime } from '../../utilities/helpers/functions';

const HOST: string | undefined = import.meta.env.VITE_HOST_IP;

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

export const AdminDashboard = () => {
    const [userInfo, setUserInfo] = useState({ firstName: null, email: null, permission: null });
    const [dateRange, setDateRange] = useState<DateRange>(null);
    // const [prevDateRange, setPrevDateRange] = useState<DateRange>(null);
    const [dashboardMetricsGranularity, setDashboardMetricsGranularity] = useState("month");
    const [bannerTextState, setBannerTextState] = useRecoilState(bannerState);


    useEffect(() => {
        isUserAuth().then((response: any) => {
            setUserInfo({ firstName: response.firstName, email: response.email, permission: response.permission });
        }).catch((error) => {
            return
        })
    }, []);

    const getOldestIncomeExpense = async ({ paddays = 0 }) => {
        const response: any = await getJSONResponse({ endpoint: '/api/server/oldest_income_and_expense_record_dates', params: { paddays } });
        return response;
    };

    useEffect(() => {

        //? At the moment all of our documents have a DATE type without Time or TimeZone resolution.
        //? All documents should be stored in UTC time.


        switch (dashboardMetricsGranularity) {
            case "week":
                const bow = new Date() as any;
                const eow = new Date();
                bow.setDate(bow.getDate() - (bow.getDay() + 6) % 7)
                bow.setHours(0, 0, 0, 0);
                eow.setDate(bow.getDate() + 6);
                setDateRange(standardizeDateRangeTime([bow, eow]));
                break;
            case "month":
                const curr = new Date();
                const bom = new Date(curr.getFullYear(), curr.getMonth(), 1);
                setDateRange(standardizeDateRangeTime([bom, new Date(curr.getFullYear(), curr.getMonth() + 1, 0)]));
                break;
            // case "quarter":
            //     toUTC([new Date(new Date().setMonth(new Date().getMonth() - 3)), new Date()]);
            //     break;
            case "year":
                const cur = new Date();
                const boy = new Date(cur.getFullYear(), 0, 1,0,0,0,0);
                setDateRange(standardizeDateRangeTime([boy, new Date(cur.getFullYear(), 11, 31)]));
                break;
            case "all":
                (async () => {
                    const datesToSet = await getOldestIncomeExpense({ paddays: 5 });
                    setDateRange(standardizeDateRangeTime([new Date(datesToSet.oldest_record_date), new Date(datesToSet.newest_record_date)]));
                })();
                break;
            case "custom":
                break;
        }
    }, [dashboardMetricsGranularity]);

    console.log("Admindashboard date range statevar printed--> ", dateRange)

    return (
        <div className="px-2" style={{height: '88%'}}>
            <Row className={"py-1"}>

                <Col xs={dashboardMetricsGranularity != "custom" ? 8 : 6} className={"align-self-center"}>
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
                                <CCGDateRangePicker dateRange={dateRange} setDateRange={(dr) => dr?setDateRange(standardizeDateRangeTime(dr)):setDashboardMetricsGranularity("month")} additionalClasses={`float-lg-end mb-2 px-2 bg-white ${styles.dashboardDateRangePicker}`} />
                            </>
                        }
                    </div>

                </Col>

            </Row>
                {/* //? This is not how it should be done but lifes busy and we need to get going */}
            <Row className='h-100'>
                {
                    dateRange && <iframe src={`http://${HOST}/grafana/d/test/test2?orgId=1&from=${dateRange[0].valueOf()}&to=${dateRange[1].valueOf()}&kiosk&theme=light&var-custom_var_date_range=${dateRange[0].toISOString().split('T')[0]} - ${dateRange[1].toISOString().split('T')[0]}`} width="100%" height="100%" frameBorder="0"></iframe>
                }
            </Row>

        </div>
    )
}
