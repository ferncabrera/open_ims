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
import DateRangePicker from '@wojtekmaj/react-daterange-picker';

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
                const bow = new Date() as any;
                const eow = new Date();
                const sometimeLastWeek = new Date(new Date() as any - 604800000);
                const bolw = new Date() as any;
                const eolw = new Date();

                bow.setDate(bow.getDate() - (bow.getDay() + 6) % 7)
                bow.setHours(0, 0, 0, 0);
                bolw.setDate(sometimeLastWeek.getDate() - (sometimeLastWeek.getDay() + 6) % 7);

                const dateRangeSearch = new Date().getTime() - bow.getTime();
                eolw.setDate(bolw.getDate() + Math.floor(dateRangeSearch / (1000 * 3600 * 24)))
                eow.setDate(bow.getDate() + 6);
                eow.setHours(0, 0, 0, 0);
                setDateRange([bow, eow]);
                setPrevDateRange([bolw, eolw]);
                break;
            case "month":
                const curr = new Date();
                const bom = new Date(curr.getFullYear(), curr.getMonth(), 1);
                const sometimeLastMonth = new Date(new Date(new Date().setDate(0)).toISOString());
                const bolm = new Date(sometimeLastMonth.getFullYear(), sometimeLastMonth.getMonth(), 1);
                const dateRangeSearchMonths = new Date().getTime() - bom.getTime();
                const eolm = new Date(bolm).setDate(bolm.getDate() + Math.floor(dateRangeSearchMonths / (1000 * 3600 * 24))) as any;
                setDateRange([bom, new Date(curr.getFullYear(), curr.getMonth() + 1, 0)]);
                setPrevDateRange([bolm, new Date(eolm)]);
                break;
            // case "quarter":
            //     setDateRange([new Date(new Date().setMonth(new Date().getMonth() - 3)), new Date()]);
            //     break;
            case "year":
                const cur = new Date();
                const boy = new Date(cur.getFullYear(), 0, 1);
                const sometimeLastYear = new Date(new Date().getFullYear() - 1, 0, 1);
                const boly = new Date(sometimeLastYear.getFullYear(), 0, 1);
                const dateRangeSearchYears = new Date().getTime() - boy.getTime();
                const eoly = new Date(boly).setDate(boly.getDate() + Math.floor(dateRangeSearchYears / (1000 * 3600 * 24))) as any;
                setDateRange([boy, new Date(cur.getFullYear(), 11, 31)]);
                setPrevDateRange([boly, new Date(eoly)]);
                break;
            case "all":
                (async () => {
                    const datesToSet = await getOldestIncomeExpense({ paddays: 5 });
                    setDateRange([new Date(datesToSet.oldest_record_date), new Date(datesToSet.newest_record_date)]);
                    setPrevDateRange([new Date(datesToSet.oldest_record_date), new Date(datesToSet.newest_record_date)]);
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
                    // ! need to set comparison metrics for when all or custom range is selected
                    setLoadingTileData(true);
                    const isoEndDate: any = new Date(new Date(dateRange[1]).setHours(0, 0, 0, 0));
                    const startDate: any = dateRange[0].toISOString().substring(0, 10);
                    const prevStartDate: any = prevDateRange[0].toISOString().substring(0, 10);
                    const prevEndDate: any = new Date(new Date(prevDateRange[1]).setHours(0, 0, 0, 0)).toISOString().substring(0, 10);
                    const currDateRangeRes = await getIncomeExpenseByDate({ startdate: startDate, enddate: isoEndDate.toISOString().substring(0, 10) });
                    const prevDateRangeRes = await getIncomeExpenseByDate({ startdate: prevStartDate, enddate: prevEndDate });
                    const currTimeSummary = getSummaryOfTimePeriod(currDateRangeRes.data);
                    const prevTimeSummary = getSummaryOfTimePeriod(prevDateRangeRes.data);
                    // console.log("prevData : ", prevDateRangeRes.rangeStartDateOfQuery, prevDateRangeRes.rangeEndDateOfQuery, prevTimeSummary);
                    // console.log("CurrData : ", currDateRangeRes.rangeStartDateOfQuery, currDateRangeRes.rangeEndDateOfQuery, currTimeSummary);
                    //! This should really just become another SQL query that is more efficient at getting profit data but oh well for now
                    await delay(100);
                    setTimeRangeSummary({
                        expenses: currTimeSummary.aggregatedData.expenses,
                        income: currTimeSummary.aggregatedData.income,
                        projected_expenses: currTimeSummary.aggregatedData.projected_expenses,
                        projected_income: currTimeSummary.aggregatedData.projected_income,
                        granularity: currTimeSummary.aggregatedData.granularity,
                        profit: currTimeSummary.aggregatedData.profit,
                        name: `${currDateRangeRes.rangeStartDateOfQuery} ${currDateRangeRes.rangeEndDateOfQuery}`,
                        profit_percent_movement: ((currTimeSummary.aggregatedData.profit - prevTimeSummary.aggregatedData.profit) / Math.abs(prevTimeSummary.aggregatedData.profit) * 100).toFixed(2),
                        expense_percent_movement: ((currTimeSummary.aggregatedData.expenses - prevTimeSummary.aggregatedData.expenses) / Math.abs(prevTimeSummary.aggregatedData.expenses) * 100).toFixed(2),
                        income_percent_movement: ((currTimeSummary.aggregatedData.income - prevTimeSummary.aggregatedData.income) / Math.abs(prevTimeSummary.aggregatedData.income) * 100).toFixed(2)
                    });
                    setIncomeExpenseProfitQueryData(currDateRangeRes.data);
                } catch (e) {
                    //! open ticket for this
                    console.log("Error fetching income and expense date by date! ", e);
                }
            })().then(() => { setLoadingTileData(false) });
    }, [dateRange]);

    useEffect(() => {
        if (loadingTileData) {
            //Implementing the setInterval method
            const interval = setInterval(() => {
                setRandomNumbers((Math.floor(Math.random() * 2) % 2 == 0) ? (Math.random() * 10000) : (Math.random() * 1000000));
            }, 100);

            //Clearing the interval
            return () => clearInterval(interval);
        }

    }, [loadingTileData]);

    return (
        <div className="px-2">
            <Row className={"py-1"}>

                <Col md={12} lg={6} className={"align-self-center"}>
                    {userInfo.firstName !== null &&
                        <p style={{fontSize: "calc(.5vw + 2.5vh)"}} className='mb-0 font-30 dark-text my-lg-4 mt-2'>Welcome back, <span className='text-capitalize'>{userInfo.firstName}</span>.</p>
                    }
                </Col>

                <Col className={"align-self-end"} >
                    <div className='text-nowrap float-end'>
                        {dashboardMetricsGranularity != "custom" ?
                            <>
                                <p
                                    className='d-inline-block mb-0'
                                    style={{fontSize: "calc(.3vw + 1.85vh)"}}
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
                                        className='px-1'
                                        id={`${styles.dashboardMetricsGranularityDropdown}`}
                                        style={{fontSize: "calc(.2vw + 1.55vh)"}}
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
                                                    <Dropdown.Item style={{fontSize: "calc(.2vw + 1.55vh)"}} key={r} className={`py-1 ${styles.dashboardMetricsGranularityDropdownMenuItem}`} onClick={() => { setDashboardMetricsGranularity(r); }} >{`${r} range`}</Dropdown.Item>
                                                </>
                                            if (r == "all")
                                                return <Dropdown.Item style={{fontSize: "calc(.2vw + 1.55vh)"}} key={r} className={`py-1 ${styles.dashboardMetricsGranularityDropdownMenuItem}`} onClick={() => { setDashboardMetricsGranularity(r); }} >{`${r} time`}</Dropdown.Item>
                                            return <Dropdown.Item style={{fontSize: "calc(.2vw + 1.55vh)"}} key={r} className={`py-1 ${styles.dashboardMetricsGranularityDropdownMenuItem}`} onClick={() => { setDashboardMetricsGranularity(r); }} >{`${r}`}</Dropdown.Item>
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
                                <CCGDateRangePicker dateRange={dateRange} setDateRange={setDateRange} additionalClasses={`float-lg-end mb-2 px-2 bg-white ${styles.dashboardDateRangePicker}`} />
                            </>
                        }
                    </div>

                </Col>

            </Row>

            <Row className=''>

                <Col md={12} xl={8}>
                    {dateRange && <CCGChart loadingChartData={loadingTileData} chartData={incomeExpenseProfitQueryData} />}
                </Col>

                <Col className='d-flex flex-column justify-content-between'>
                    <Row className="mt-xl-0 mt-2">
                        <Col>
                            <SimpleSummaryCard
                                id={"summary-card-1"}
                                info={<p>test</p>}
                                loadingSummaryData={loadingTileData}
                                titleContent={"total income"}
                                bodyContent={!loadingTileData && timeRangeSummary ? `${USDollar.format(parseFloat(timeRangeSummary.income.toString()) + parseFloat(timeRangeSummary.projected_income.toString()))}` : <span >{USDollar.format(randomNumbers * 2)}</span>}
                                icon={
                                    <MdMoving
                                        style={{
                                            transform: !loadingTileData && timeRangeSummary && parseFloat(timeRangeSummary.income_percent_movement.toString()) > 0 ? "none" : loadingTileData ? "none" : "scaleY(-1)",
                                            backgroundColor: !loadingTileData && timeRangeSummary && parseFloat(timeRangeSummary.income_percent_movement.toString()) > 0 ? styles.lightGreen : styles.lightRed,
                                            width: "8%",
                                            height: "8%"
                                        }}
                                    />
                                }
                                commentContent={`This ${dashboardMetricsGranularity} your income has ${!loadingTileData && timeRangeSummary && parseFloat(timeRangeSummary.income_percent_movement.toString()) > 0 ? "increased" : "decreased"}`}
                                commentMetric={`${!loadingTileData ? (timeRangeSummary && Math.abs(parseFloat(timeRangeSummary.income_percent_movement.toString()))) : "0"}%`}
                                colorScheme={`${!loadingTileData ? (timeRangeSummary && parseFloat(timeRangeSummary.income_percent_movement.toString()) > 0 ? styles.darkGreen : styles.darkRed) : styles.darkGrey}`}
                            />
                        </Col>
                    </Row>
                    <Row className="py-xl-3 py-2">
                        <Col>
                            <SimpleSummaryCard
                                id={"summary-card-2"}
                                info={<p>test</p>}
                                loadingSummaryData={loadingTileData}
                                titleContent={"total expenses"}
                                bodyContent={!loadingTileData && timeRangeSummary ? `${USDollar.format(parseFloat(timeRangeSummary.expenses.toString()) + parseFloat(timeRangeSummary.projected_expenses.toString()))}` : USDollar.format(randomNumbers / 2)}
                                icon={
                                    <MdMoving
                                        style={{
                                            transform: !loadingTileData && timeRangeSummary && parseFloat(timeRangeSummary.expense_percent_movement.toString()) > 0 ? "none" : loadingTileData ? "none" : "scaleY(-1)",
                                            backgroundColor: !loadingTileData && timeRangeSummary && parseFloat(timeRangeSummary.expense_percent_movement.toString()) > 0 ? styles.lightRed : styles.lightGreen,
                                            width: "8%",
                                            height: "8%"
                                        }}
                                    />
                                }
                                commentContent={`This ${dashboardMetricsGranularity} your expenses have ${!loadingTileData && timeRangeSummary && parseFloat(timeRangeSummary.expense_percent_movement.toString()) > 0 ? "increased" : "decreased"}`}
                                commentMetric={`${!loadingTileData ? (timeRangeSummary && Math.abs(parseFloat(timeRangeSummary.expense_percent_movement.toString()))) : "0"}%`}
                                colorScheme={`${!loadingTileData ? (timeRangeSummary && parseFloat(timeRangeSummary.expense_percent_movement.toString()) > 0 ? styles.darkRed : styles.darkGreen) : styles.darkGrey}`}
                            />
                        </Col>

                    </Row>
                    <Row className="mb-xl-0 mb-2">
                        <Col>
                            <SimpleSummaryCard
                                id={"summary-card-3"}
                                info={<p>test</p>}
                                loadingSummaryData={loadingTileData}
                                titleContent={"total profit"}
                                bodyContent={!loadingTileData && timeRangeSummary ? `${USDollar.format(parseFloat(timeRangeSummary.profit.toString()))}` : USDollar.format(Math.floor(randomNumbers) % 2 == 0 ? randomNumbers * -1 : randomNumbers)}
                                icon={
                                    <MdMoving
                                        style={{
                                            transform: !loadingTileData ? (timeRangeSummary && parseFloat(timeRangeSummary.profit_percent_movement.toString()) > 0 ? "none" : "scaleY(-1)") : (Math.floor(randomNumbers) % 2 == 0 ? randomNumbers * -1 : randomNumbers) > 0 ? "none" : "scaleY(-1)",
                                            backgroundColor: !loadingTileData && timeRangeSummary && parseFloat(timeRangeSummary.profit_percent_movement.toString()) > 0 ? styles.lightGreen : styles.lightRed,
                                            width: "8%",
                                            height: "8%"
                                        }}
                                    />
                                }
                                commentContent={`This ${dashboardMetricsGranularity} your profit has ${!loadingTileData && timeRangeSummary && parseFloat(timeRangeSummary.profit_percent_movement.toString()) > 0 ? "increased" : "decreased"}`}
                                commentMetric={`${!loadingTileData ? (timeRangeSummary && Math.abs(parseFloat(timeRangeSummary.profit_percent_movement.toString()))) : "0"}%`}
                                colorScheme={`${!loadingTileData ? (timeRangeSummary && parseFloat(timeRangeSummary.profit_percent_movement.toString()) > 0 ? styles.darkGreen : styles.darkRed) : styles.darkGrey}`}
                            />
                        </Col>
                    </Row>
                </Col>

            </Row>
        </div>
    )
}
