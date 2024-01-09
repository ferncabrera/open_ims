import React, { useEffect, useState } from 'react'
import { getJSONResponse } from '../../utilities/apiHelpers';
import _ from 'lodash';
import styles from "./CCGChart.module.scss";
import { Container, Row, Col, Dropdown, DropdownButton } from 'react-bootstrap';
import { ComposedChart, Line, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Brush } from 'recharts';
import { DateRange } from '../../utilities/types/types';

import { IoIosArrowDropup, IoIosArrowDropdown } from "react-icons/io";

// ! REMOVE ONCE DONE WITH HELPER FUNC
function getRandomNumber(min, max) {
    // Ensure that both min and max are integers
    min = Math.ceil(min);
    max = Math.floor(max);

    // Generate a random number between min (inclusive) and max (exclusive)
    return Math.floor(Math.random() * (max - min)) + min;
}
// ! dummy data

interface ICCGChartProps {
    globalDateRange?: DateRange
};


const renderColorfulLegendText = (value: string, entry: any) => {
    // const { color } = entry;
    const upperCased = value.charAt(0).toUpperCase() + value.slice(1);
    return <span className='dark-text px-2' style={{ fontWeight: 400, fontSize: "16px", fontStyle: "normal", fontFamily: "Rubik" }}>{upperCased}</span>;
};

const getIncomeExpenseByDate = async (date) => {
    const response: any = await getJSONResponse({ endpoint: '/api/server/income_and_expense_by_date', params: { date: "" } });
};

// Instead this should just loop over once and return an array with the keys values being the counts and whether or not the col had a negative
// This would avoid us needing to call the function everytime to get the max value for a column/if it has a negative since the queries may get very large
function findMaxNumericValue(data, excludeArr: string[]) {
    let hasNegative = false;
    const maxNumeric = data.reduce((maxNumericValue: any, currentData: any) => {
        for (const key in currentData) {
            if (key !== 'name' && typeof currentData[key] === 'number' && !excludeArr.includes(key)) {
                maxNumericValue = Math.max(maxNumericValue, currentData[key]);
                if (Math.min(currentData[key]) < 0)
                    hasNegative = true;
            }
        }
        return maxNumericValue;
    }, 0);

    return {
        maxNumericValue: maxNumeric,
        hasNegative
    }
};

export const CCGChart: React.FC<ICCGChartProps> = ({ globalDateRange }) => {


    const [showYReferenceLineRight, setShowYReferenceLineRight] = useState<boolean>(false);
    const [showBrush, setShowBrush] = useState<boolean>(false);
    const [yAxisWidthLeft, setYAxisWidthLeft] = useState<number>(55);
    const [yAxisWidthRight, setYAxisWidthRight] = useState<number>(55);
    const [endIndexBrush, setEndIndexBrush] = useState<number>(0);
    const [startIndexBrush, setStartIndexBrush] = useState<number>(0);
    const [loadingChart, setLoadingChart] = useState(true);
    const [chartGranularity, setChartGranularity] = useState(null);
    const [showChartGranularityMenu, setShowChartGranularityMenu] = useState(false);
    const [data, setData] = useState([]);
    // TODO in the future each chart can display its own custom date range, perhaps for him to create custom reports using the charts?
    // const [dateRange, setDateRange] = useState<DateRange>([new Date(new Date().setFullYear(new Date().getFullYear() - 1)), new Date()]);
    // temp hack to set width

    useEffect(() => {
        setData([

            {
                name: 'Abc',
                income: getRandomNumber(23000, 87980),
                expenses: getRandomNumber(380003, 61880),
                profit: getRandomNumber(-10000, 10000),
            },
            {
                name: 'Abc',
                income: getRandomNumber(23000, 87980),
                expenses: getRandomNumber(380003, 61880),
                profit: getRandomNumber(-10000, 10000),
            },
            {
                name: 'Abc',
                income: getRandomNumber(23000, 87980),
                expenses: getRandomNumber(380003, 61880),
                profit: getRandomNumber(-10000, 10000),
            },
            {
                name: 'Abc',
                income: getRandomNumber(23000, 87980),
                expenses: getRandomNumber(380003, 61880),
                profit: getRandomNumber(-10000, 10000),
            },
            {
                name: 'Abc',
                income: getRandomNumber(23000, 87980),
                expenses: getRandomNumber(380003, 61880),
                profit: getRandomNumber(-10000, 10000),
            },
            {
                name: 'Abc',
                income: getRandomNumber(23000, 87980),
                expenses: getRandomNumber(380003, 61880),
                profit: getRandomNumber(-10000, 10000),
            },
            {
                name: 'Abc',
                income: getRandomNumber(23000, 87980),
                expenses: getRandomNumber(380003, 61880),
                profit: getRandomNumber(-10000, 10000),
            },
            {
                name: 'Abc',
                income: getRandomNumber(23000, 87980),
                expenses: getRandomNumber(380003, 61880),
                profit: getRandomNumber(-10000, 10000),
            },
            {
                name: 'Abc',
                income: getRandomNumber(23000, 87980),
                expenses: getRandomNumber(380003, 61880),
                profit: getRandomNumber(-10000, 10000),
            },
            {
                name: 'Abc',
                income: getRandomNumber(23000, 87980),
                expenses: getRandomNumber(380003, 61880),
                profit: getRandomNumber(-10000, 10000),
            },
            {
                name: 'Abc',
                income: getRandomNumber(23000, 87980),
                expenses: getRandomNumber(380003, 61880),
                profit: getRandomNumber(-10000, 10000),
            },
            {
                name: 'Abc',
                income: getRandomNumber(23000, 87980),
                expenses: getRandomNumber(380003, 61880),
                profit: getRandomNumber(-10000, 10000),
            }

        ]);
    }, []);

    useEffect(() => {
        //? This useEffect is used to style chart based on date being shown
        //? Done to avoid overflow of Y axis values out of the container when numbers get to big
        const { maxNumericValue: maxNumericValueLeft, hasNegative: leftHasNeg } = findMaxNumericValue(data, ["profit"]);
        const { maxNumericValue: maxNumericValueRight, hasNegative: rightHasNeg } = findMaxNumericValue(data, ["income", "expenses"]);

        console.log("maxnumebricvalue", maxNumericValueLeft);
        console.log("maxnumebricvalue", maxNumericValueRight);
        console.log("maxnumebricvalue", rightHasNeg);

        if (maxNumericValueLeft <= 8000) {
            setYAxisWidthLeft(55);
        }
        else if (maxNumericValueLeft <= 80000) {
            setYAxisWidthLeft(65);
        }
        else if (maxNumericValueLeft <= 800000) {
            setYAxisWidthLeft(75);
        }
        else if (maxNumericValueLeft <= 8000000) {
            setYAxisWidthLeft(85);
        }
        else if (maxNumericValueLeft <= 80000000) {
            setYAxisWidthLeft(95);
        }
        else {
            setYAxisWidthLeft(105);
        };


        if (maxNumericValueRight <= 8000) {
            setYAxisWidthRight(65);
        }
        else if (maxNumericValueRight <= 80000) {
            setYAxisWidthRight(75);
        }
        else if (maxNumericValueRight <= 800000) {
            setYAxisWidthRight(85);
        }
        else if (maxNumericValueRight <= 8000000) {
            setYAxisWidthRight(95);
        }
        else if (maxNumericValueRight <= 80000000) {
            setYAxisWidthRight(105);
        }
        else {
            setYAxisWidthRight(115);
        };

        if (rightHasNeg)
            setShowYReferenceLineRight(true);

        setLoadingChart(false);
    }, [data]);

    useEffect(() => {
        if (globalDateRange !== null) {

            const customGlobalDateRange = Math.abs(globalDateRange[0] - globalDateRange[1]);

            const thirtyDaysInMs = 2592000000;
            const thirtyWeeksInMs = 18144000000;
            const thirtyMonthsInMs = 78892380000;
            const thirtyYearsInMs = 946708560000;

            if (customGlobalDateRange < thirtyDaysInMs) {
                setChartGranularity("day");
            }
            else if (customGlobalDateRange < thirtyWeeksInMs) {
                setChartGranularity("week");
            }
            else if (customGlobalDateRange < thirtyMonthsInMs) {
                setChartGranularity("month");
            }
            else if (customGlobalDateRange < thirtyYearsInMs) {
                setChartGranularity("year");
            }
            else {
                setChartGranularity("year");
            }

        }


    }, [globalDateRange]);

    useEffect(() => {
        const customGlobalDateRange = Math.abs(globalDateRange[0] - globalDateRange[1]);

        const thirtyDaysInMs = 2592000000;
        const thirtyWeeksInMs = 18144000000;
        const thirtyMonthsInMs = 78892380000;
        const thirtyYearsInMs = 946708560000;

        if ((customGlobalDateRange >= thirtyDaysInMs) && chartGranularity == "day") {
            setShowBrush(true);
        }
        else if ((customGlobalDateRange >= thirtyWeeksInMs) && ((chartGranularity == "week") || (chartGranularity == "day"))) {
            setShowBrush(true);
        }
        else if ((customGlobalDateRange >= thirtyMonthsInMs) && ((chartGranularity == "week") || (chartGranularity == "day") || (chartGranularity == "month"))) {
            setShowBrush(true);
        }
        else if ((customGlobalDateRange >= thirtyYearsInMs) && ((chartGranularity == "week") || (chartGranularity == "day") || (chartGranularity == "month") || (chartGranularity == "year"))) {
            setShowBrush(true);
        } else {
            setShowBrush(false);
        };

    }, [chartGranularity, globalDateRange]);

    return (
        <>
            {!loadingChart &&
                <div
                    className={`${styles.chartBackground} ${styles.chartBorderWrapper} ps-0 pe-0 pb-2`}
                    style={{ width: "100%", height: "100%" }}
                >
                    <Row className="mx-0" >

                        <Col xs={"auto"}>
                            <h4 className={`${styles.chartTitle} text-capitalize text-nowrap ps-1 ms-1 mt-3 pt-1`}>
                                income & expenses
                            </h4>
                        </Col>

                        <Col className={`align-self-end d-flex justify-content-end`}>
                            <Dropdown
                                className='ms-1'
                                drop='down-centered'
                                onToggle={show => {
                                    setShowChartGranularityMenu(show);
                                }}
                            >
                                <Dropdown.Toggle
                                    id={`${styles.incomeExpenseChartGranularityDropdown}`}
                                >
                                    {chartGranularity != "day" ?
                                        <span>{`${chartGranularity.charAt(0).toUpperCase() + chartGranularity.slice(1)}ly View`}</span>

                                        : <span>Daily View</span>
                                    }
                                    {
                                        showChartGranularityMenu ?
                                            <IoIosArrowDropup className={"ms-4"} style={{ fontSize: "24px", paddingBottom: "3px" }} />
                                            :
                                            <IoIosArrowDropdown className={"ms-4"} style={{ fontSize: "24px", paddingBottom: "3px" }} />
                                    }
                                </Dropdown.Toggle>

                                <Dropdown.Menu style={{ fontSize: "14px" }}>
                                    <Dropdown.Item style={{ color: styles.darkText }} className="py-0" onClick={() => { setChartGranularity("day"); }} >Daily View</Dropdown.Item>
                                    <Dropdown.Divider />
                                    <Dropdown.Item style={{ color: styles.darkText }} className="py-0" onClick={() => { setChartGranularity("week"); }} >Weekly View</Dropdown.Item>
                                    <Dropdown.Divider />
                                    <Dropdown.Item style={{ color: styles.darkText }} className="py-0" onClick={() => { setChartGranularity("month"); }} >Monthly View</Dropdown.Item>
                                    <Dropdown.Divider />
                                    {/* <Dropdown.Item style={{ color: styles.darkText }} className="py-0" onClick={() => { setChartGranularity("quarter"); }} >Quarterly View</Dropdown.Item>
                                    <Dropdown.Divider /> */}
                                    <Dropdown.Item style={{ color: styles.darkText }} className="py-0" onClick={() => { setChartGranularity("year"); }} >Yearly View</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </Col>

                    </Row>

                    <ResponsiveContainer
                        width="101%"
                        height="91%">
                        <ComposedChart
                            className={`ps-2`}
                            width={500}
                            height={300}
                            data={data}
                            margin={{
                                top: 12,
                                right: 30,
                                left: 20,
                                bottom: 5,
                            }}
                            barCategoryGap={"20%"}
                            barGap={"10%"}
                        >
                            <CartesianGrid strokeDasharray="9" vertical={false} />
                            <XAxis dataKey="name" stroke={styles.darkText} tickLine={false} tickMargin={5} />
                            {showYReferenceLineRight && <ReferenceLine yAxisId={"right"} y={0} stroke={styles.darkText} strokeDasharray={2} />}
                            <YAxis
                                axisLine={false}
                                width={yAxisWidthLeft}
                                unit="$"
                                tickMargin={7}
                                tickLine={false}
                                stroke={styles.darkText}
                                fontFamily='Rubik'
                                fontSize={16}
                                fontWeight={400}
                                fontStyle="normal"
                                yAxisId={"left"}
                                orientation="left"
                            // domain={([dataMin, dataMax]) => {
                            //     // setYAxisWidth(60);
                            //     return [0, dataMax];
                            // }}
                            />
                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                axisLine={false}
                                width={yAxisWidthRight}
                                unit="$"
                                tickMargin={7}
                                tickLine={false}
                                stroke={styles.darkText}
                                fontFamily='Rubik'
                                fontSize={16}
                                fontWeight={400}
                                fontStyle="normal"
                            />

                            <Tooltip />
                            {showBrush && <Brush onChange={(i) => {
                                setStartIndexBrush(i.startIndex);
                                setEndIndexBrush(i.endIndex);
                            }} dataKey="name"
                                height={30}
                                stroke={styles.secondaryBlue}
                                startIndex={startIndexBrush}
                                endIndex={endIndexBrush}
                            />}
                            <Legend
                                align='left'
                                verticalAlign='top'
                                iconSize={19}
                                iconType='circle'
                                wrapperStyle={{ paddingBottom: '20px', paddingLeft: "0px" }}
                                formatter={renderColorfulLegendText}
                            />
                            <Bar yAxisId={"left"} dataKey="income" fill={styles.secondaryBlue} radius={[5, 5, 0, 0]} />
                            <Bar yAxisId={"left"} dataKey="expenses" stackId="a" fill={styles.primaryBlue} radius={[5, 5, 0, 0]} />
                            <Line yAxisId={"right"} type="monotone" dataKey="profit" stroke={styles.lightOrange} />
                            {/* <Bar dataKey="amt" stackId="a" fill="#ffc658" /> */}
                        </ComposedChart>
                    </ResponsiveContainer>

                </div >}
        </>
    )
};
