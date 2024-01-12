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
import { MdMoving } from "react-icons/md";

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
    name: string
};

export const AdminDashboard = () => {
    const [userInfo, setUserInfo] = useState({ firstName: null, email: null, permission: null });
    const [dateRange, setDateRange] = useState<DateRange>(null);
    const [dashboardMetricsGranularity, setDashboardMetricsGranularity] = useState("month");
    const [incomeExpenseProfitQueryData, setIncomeExpenseProfitQueryData] = useState([]);
    const [timeRangeSummary, setTimeRangeSummary] = useState<TimeRangeSummaryObj>();
    const [loadingTileData, setLoadingTileData] = useState<boolean>(false);

    const getIncomeExpenseByDate = async ({ startdate = null, enddate = null }) => {
        const response: any = await getJSONResponse({ endpoint: '/api/server/income_and_expense_by_date', params: { startdate, enddate } });
        return response;
    };

    const getOldestIncomeExpense = async ({ paddays = 0 }) => {
        const response: any = await getJSONResponse({ endpoint: '/api/server/oldest_income_and_expense_record_dates', params: { paddays } });
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
                const bow = new Date();
                const eow = new Date();

                // const dayB = bow.getDay() || 7;
                // if (dayB !== 1)
                //     bow.setDate(-24 * (dayB - 1));
                bow.setDate(bow.getDate() - (bow.getDay() + 6) % 7)
                bow.setHours(0, 0, 0, 0);
                // eow.setDate(bow.getDate() + 7);
                // eow.setHours(0, 0, 0);
                // console.log(bow);
                eow.setDate(bow.getDate() + 6);
                eow.setHours(0, 0, 0, 0);
                // console.log(eow);
                setDateRange([bow, eow]);
                break;
            case "month":
                const curr = new Date();
                setDateRange([new Date(curr.getFullYear(), curr.getMonth(), 1), new Date(curr.getFullYear(), curr.getMonth() + 1, 0)]);
                break;
            // case "quarter":
            //     setDateRange([new Date(new Date().setMonth(new Date().getMonth() - 3)), new Date()]);
            //     break;
            case "year":
                const cur = new Date();
                // const firstDOY
                // const lastDOY
                setDateRange([new Date(cur.getFullYear(), 0, 1), new Date(cur.getFullYear(), 11, 31)]);
                break;
            case "all":
                (async () => {
                    const datesToSet = await getOldestIncomeExpense({ paddays: 5 });
                    setDateRange([new Date(datesToSet.oldest_record_date), new Date(datesToSet.newest_record_date)]);
                })();
                break;
            case "custom":
                break;
        }
        // console.log(dashboardMetricsGranularity);
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
                    setLoadingTileData(true);
                    const isoEndDate = new Date(new Date(dateRange[1]).setHours(0, 0, 0, 0));
                    const res = await getIncomeExpenseByDate({ startdate: dateRange[0].toISOString().substring(0, 10), enddate: isoEndDate.toISOString().substring(0, 10) });
                    const timeSummary = getSummaryOfTimePeriod(res.data);
                    setTimeRangeSummary({
                        expenses: timeSummary.aggregatedData.expenses,
                        income: timeSummary.aggregatedData.income,
                        projected_expenses: timeSummary.aggregatedData.projected_expenses,
                        projected_income: timeSummary.aggregatedData.projected_income,
                        granularity: timeSummary.aggregatedData.granularity,
                        profit: timeSummary.aggregatedData.profit,
                        name: `${res.rangeStartDateOfQuery} ${res.rangeEndDateOfQuery}`
                    });
                    setIncomeExpenseProfitQueryData(res.data);
                } catch (e) {
                    //! open ticket for this
                    console.log("Error fetching income and expense date by date! ", e);
                }
            })().then(() => { setLoadingTileData(false) });
    }, [dateRange]);

    return (
        <div className="px-2">
            <Row className={"py-1"}>

                <Col md={12} lg={6} className={"align-self-center"}>
                    {userInfo.firstName !== null &&
                        <p className='mb-0 font-30 dark-text my-lg-4 mt-2'>Welcome back, <span className='text-capitalize'>{userInfo.firstName}</span>.</p>
                    }
                </Col>

                <Col className={"align-self-end"}>
                    <div className='text-nowrap float-end'>
                        {dashboardMetricsGranularity != "custom" ?
                            <>
                                <p
                                    className='d-inline-block mb-0'
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
                                        style={{
                                        }}
                                        className='px-1'
                                        id={`${styles.dashboardMetricsGranularityDropdown}`}
                                    >
                                        <span
                                        >
                                            <u>{dashboardMetricsGranularity == "all" ? `history.` : `${dashboardMetricsGranularity}.`}</u>
                                        </span>
                                    </Dropdown.Toggle>

                                    <Dropdown.Menu
                                        className={`${styles.dashboardMetricsGranularityDropdownMenu}`}
                                    >
                                        {standardMetricDateRanges.map((r, i) => {
                                            if (r == dashboardMetricsGranularity)
                                                return null;
                                            if (r == "custom")
                                                return <>
                                                    <Dropdown.Divider key={`${r}divider`} />
                                                    <Dropdown.Item key={r} className={`py-1 ${styles.dashboardMetricsGranularityDropdownMenuItem}`} onClick={() => { setDashboardMetricsGranularity(r); }} >{`${r} range`}</Dropdown.Item>
                                                </>
                                            if (r == "all")
                                                return <Dropdown.Item key={r} className={`py-1 ${styles.dashboardMetricsGranularityDropdownMenuItem}`} onClick={() => { setDashboardMetricsGranularity(r); }} >{`${r} time`}</Dropdown.Item>
                                            return <Dropdown.Item key={r} className={`py-1 ${styles.dashboardMetricsGranularityDropdownMenuItem}`} onClick={() => { setDashboardMetricsGranularity(r); }} >{`${r}`}</Dropdown.Item>
                                        })}
                                    </Dropdown.Menu>
                                </Dropdown>
                            </>
                            :
                            <>
                                <p
                                    className='d-inline-block me-2 ms-0 mb-0 mt-1'
                                >

                                </p>
                                <CCGDateRangePicker dateRange={dateRange} setDateRange={setDateRange} additionalClasses={`float-lg-end px-2 bg-white ${styles.dashboardDateRangePicker}`} />
                            </>
                        }
                    </div>

                </Col>

            </Row>

            <Row className=''>

                <Col md={12} xl={8}>
                    {dateRange && <CCGChart chartData={incomeExpenseProfitQueryData} />}
                </Col>

                <Col className='d-flex flex-column justify-content-between'>
                    <Row className="mt-xl-0 mt-2">
                        <Col>
                            <SimpleSummaryCard
                                titleContent={"total income"}
                                bodyContent={!loadingTileData && timeRangeSummary ? `$${Number(timeRangeSummary.income) + Number(timeRangeSummary.projected_income)}` : "$0"}
                                icon={
                                    <MdMoving
                                        style={{backgroundColor: !loadingTileData && timeRangeSummary && Number(timeRangeSummary.income) + Number(timeRangeSummary.projected_income) > 0 ? styles.lightGreen :styles.lightRed}}
                                    />
                                }
                                commentContent={`This ${dashboardMetricsGranularity} your income has ${!loadingTileData && timeRangeSummary && Number(timeRangeSummary.income) > 0? "decreased" : "increased"}`}
                                commentMetric={"XD$"}
                                colorScheme={`${!loadingTileData && timeRangeSummary && Number(timeRangeSummary.income) + Number(timeRangeSummary.projected_income) >0? styles.darkGreen : styles.darkRed}`}
                            />
                        </Col>
                    </Row>
                    <Row className="py-xl-3 py-2">
                        <Col>
                            <SimpleSummaryCard
                                titleContent={"total expenses"}
                                bodyContent={!loadingTileData && timeRangeSummary ? `$${Number(timeRangeSummary.expenses) + Number(timeRangeSummary.projected_expenses)}` : "$0"}
                                icon={
                                    <MdMoving
                                        style={{backgroundColor: !loadingTileData && timeRangeSummary && Number(timeRangeSummary.expenses) + Number(timeRangeSummary.projected_expenses) > 0 ? styles.lightGreen : styles.lightRed}}
                                    />
                                }
                                commentContent={`This ${dashboardMetricsGranularity} your expenses have ${!loadingTileData && timeRangeSummary && Number(timeRangeSummary.expenses) > 0? "decreased" : "increased"}`}
                                commentMetric={"XD$"}
                                colorScheme={`${!loadingTileData && timeRangeSummary && Number(timeRangeSummary.expenses) + Number(timeRangeSummary.projected_expenses) >0? styles.darkGreen : styles.darkRed}`}
                            />
                        </Col>

                    </Row>
                    <Row className="mb-xl-0 mb-2">
                        <Col>
                            <SimpleSummaryCard
                                titleContent={"total profit"}
                                bodyContent={!loadingTileData && timeRangeSummary ? `$${timeRangeSummary.profit}` : "$0"}
                                icon={
                                    <MdMoving
                                        style={{backgroundColor: !loadingTileData && timeRangeSummary && Number(timeRangeSummary.profit) > 0 ? styles.lightGreen : styles.lightRed}}
                                    />
                                }
                                commentContent={`This ${dashboardMetricsGranularity} your profit has ${!loadingTileData && timeRangeSummary && Number(timeRangeSummary.profit) > 0? "decreased" : "increased"}`}
                                commentMetric={"XD$"}
                                colorScheme={`${!loadingTileData && timeRangeSummary && Number(timeRangeSummary.profit) >0? styles.darkGreen : styles.darkRed}`}
                            />
                        </Col>
                    </Row>
                </Col>

            </Row>
        </div>
    )
}
