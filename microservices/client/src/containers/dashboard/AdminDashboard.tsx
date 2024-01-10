import React, { useEffect, useState } from 'react'
import { getJSONResponse } from '../../utilities/apiHelpers';
import { isUserAuth } from '../../utilities/helpers/functions';
import { CCGChart } from '../../components/charts/CCGChart';
import _ from 'lodash';
import { CCGDateRangePicker } from '../../components/calendars/CCGDateRangePicker';
import { Container, Row, Col, Dropdown } from 'react-bootstrap';
import { DateRange } from '../../utilities/types/types';
import styles from "./index.module.scss";
import { checkDomainOfScale } from 'recharts/types/util/ChartUtils';
import { createResponseComposition } from 'msw';

const standardMetricDateRanges = [
    "week",
    "month",
    // "quarter",
    "year",
    "all",
    "custom"
];


export const AdminDashboard = () => {
    const [userInfo, setUserInfo] = useState({ firstName: null, email: null, permission: null });
    const [dateRange, setDateRange] = useState<DateRange>(null);
    const [dashboardMetricsGranularity, setDashboardMetricsGranularity] = useState("month");
    const [incomeExpenseProfitQueryData, setIncomeExpenseProfitQueryData] = useState([]); 

    const getIncomeExpenseByDate = async (startdate: string, enddate: string) => {
        const response: any = await getJSONResponse({ endpoint: '/api/server/income_and_expense_by_date', params: { startdate, enddate } });
        return response;
    };

    useEffect(() => {
        isUserAuth().then((response: any) => {
            setUserInfo({ firstName: response.firstName, email: response.email, permission: response.permission });
        }).catch((error) => {
            return
        })
    }, []);

    useEffect(() => {
        switch (dashboardMetricsGranularity) {
            case "week":
                setDateRange([new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000), new Date()]);
                break;
            case "month":
                setDateRange([new Date(new Date().setMonth(new Date().getMonth() - 1)), new Date()]);
                break;
            // case "quarter":
            //     setDateRange([new Date(new Date().setMonth(new Date().getMonth() - 3)), new Date()]);
            //     break;
            case "year":
                setDateRange([new Date(new Date().setFullYear(new Date().getFullYear() - 1)), new Date()]);
                break;
            case "all":
                setDateRange([new Date(new Date().setFullYear(new Date().getFullYear() - 10)), new Date()]);
                break;
            case "custom":
                break;
        }
        console.log(dashboardMetricsGranularity);
    }, [dashboardMetricsGranularity]);

    useEffect(() => {
        //? If date is ever reset by user we reset back to last months stats
        //TODO Introduce user default settings!
        // it could be a general save icon that simply saves the dashboard settings a certain way for a user...
        if (dateRange === null)
            setDashboardMetricsGranularity("month");
        else
            (async () => {
                try {
                    const res = await getIncomeExpenseByDate(dateRange[0].toISOString().substring(0, 10), dateRange[1].toISOString().substring(0, 10),);
                    setIncomeExpenseProfitQueryData(res.data);
                } catch (e) {
                    console.log("Error fetching income and expense date by date! ", e);
                }
            })();
    }, [dateRange]);

    console.log("incomeexpensequery data ==> ", incomeExpenseProfitQueryData);

    return (
        <>

            <Row className={"align-items-center my-lg-4 mt-2 py-1"}>

                <Col md={12} lg={6}>
                    {userInfo.firstName !== null &&
                        <p className='mb-0 font-30 dark-text'>Welcome back, <span className='text-capitalize'>{userInfo.firstName}</span>.</p>
                    }
                </Col>

                <Col >
                    <div className='float-lg-end text-nowrap'>
                        {dashboardMetricsGranularity != "custom" ?
                            <>
                                <p
                                    className='d-inline-block'
                                >
                                    viewing {dashboardMetricsGranularity == "all" ? null : "past"}
                                </p>

                                <Dropdown
                                    // align="start"
                                    drop="down-centered"
                                    style={{
                                    }}
                                    className='d-inline-block'
                                >
                                    <Dropdown.Toggle
                                        style={{
                                        }}
                                        className='px-1'
                                        id={`${styles.dashboardMetricsGranularityDropdown}`}
                                    >
                                        <span
                                        >
                                            <u>{dashboardMetricsGranularity == "all" ? `${dashboardMetricsGranularity} time` : `${dashboardMetricsGranularity}s`}</u>
                                        </span>
                                    </Dropdown.Toggle>

                                    <Dropdown.Menu
                                        className={`${styles.dashboardMetricsGranularityDropdownMenu}`}
                                    >
                                        {standardMetricDateRanges.map((r, i) => {
                                            if (r == "custom")
                                                return <>
                                                    <Dropdown.Divider key={`${r}divider`} />
                                                    <Dropdown.Item key={r} className={`py-1 ${styles.dashboardMetricsGranularityDropdownMenuItem}`} onClick={() => { setDashboardMetricsGranularity(r); }} >{`${r} range`}</Dropdown.Item>
                                                </>
                                            if (r == "all")
                                                return <Dropdown.Item key={r} className={`py-1 ${styles.dashboardMetricsGranularityDropdownMenuItem}`} onClick={() => { setDashboardMetricsGranularity(r); }} >{`${r} time`}</Dropdown.Item>
                                            return <Dropdown.Item key={r} className={`py-1 ${styles.dashboardMetricsGranularityDropdownMenuItem}`} onClick={() => { setDashboardMetricsGranularity(r); }} >{`${r}s`}</Dropdown.Item>
                                        })}
                                    </Dropdown.Menu>
                                </Dropdown>
                                <p
                                    className='d-inline-block'
                                >
                                    summary
                                </p>
                            </>
                            :
                            <>
                                <p
                                    className='d-inline-block me-2 ms-0 mb-0 mt-1'
                                >
                                    summary from
                                </p>
                                <CCGDateRangePicker dateRange={dateRange} setDateRange={setDateRange} additionalClasses={`float-lg-end px-2 bg-white ${styles.dashboardDateRangePicker}`} />
                            </>
                        }
                    </div>

                </Col>

            </Row>

            <Row >

                <Col md={12} lg={8}>
                    {dateRange && <CCGChart globalDateRange={dateRange} chartData={incomeExpenseProfitQueryData} />}
                </Col>

                <Col>
                    <p>placeholder</p>
                </Col>

            </Row>

        </>
    )
}
