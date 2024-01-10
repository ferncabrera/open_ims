import React, { useEffect, useState } from 'react'
import { getJSONResponse } from '../../utilities/apiHelpers';
import { isUserAuth } from '../../utilities/helpers/functions';
import { CCGChart } from '../../components/charts/CCGChart';
import _ from 'lodash';
import { CCGDateRangePicker } from '../../components/calendars/CCGDateRangePicker';
import { Container, Row, Col, Dropdown } from 'react-bootstrap';
import { DateRange } from '../../utilities/types/types';
import styles from "./index.module.scss";

const standardMetricDateRanges = [
    "week",
    "month",
    // "quarter",
    "year",
    "all",
    "custom"
]


export const AdminDashboard = () => {
    const [userInfo, setUserInfo] = useState({ firstName: null, email: null, permission: null });
    const [dateRange, setDateRange] = useState<DateRange>(null);
    const [dashboardMetricsGranularity, setDashboardMetricsGranularity] = useState("month");


    useEffect(() => {
        isUserAuth().then((response: any) => {
            console.log("this is response --> ", response);
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
            case "quarter":
                setDateRange([new Date(new Date().setMonth(new Date().getMonth() - 3)), new Date()]);
                break;
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
        if(dateRange === null)
            setDashboardMetricsGranularity("month");
    }, [dateRange]);

    return (
        <>

            <Row className={"align-items-center my-4 py-1"}>

                <Col md={12} lg={8}>
                    {userInfo.firstName !== null &&
                        <p className='mb-0 font-30 dark-text'>Welcome back, <span className='text-capitalize'>{userInfo.firstName}</span>.</p>
                    }
                </Col>

                <Col >
                    <div className='float-end'>
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
                                            <u>{dashboardMetricsGranularity == "all" ?`${dashboardMetricsGranularity} time`:`${dashboardMetricsGranularity}s`}</u>
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
                                <CCGDateRangePicker dateRange={dateRange} setDateRange={setDateRange} additionalClasses={`float-end px-2 bg-white ${styles.dashboardDateRangePicker}`} />
                            </>
                        }
                    </div>

                </Col>

            </Row>

            <Row >

                <Col md={12} lg={8}>
                    {dateRange && <CCGChart globalDateRange={dateRange} />}
                </Col>

                <Col>
                    <p>placeholder</p>
                </Col>

            </Row>

        </>
    )
}
