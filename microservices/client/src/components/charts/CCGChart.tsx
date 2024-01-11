import React, { useEffect, useState, PureComponent } from 'react'
import { getJSONResponse } from '../../utilities/apiHelpers';
import _ from 'lodash';
import styles from "./CCGChart.module.scss";
import { Container, Row, Col, Dropdown, DropdownButton, NavItem } from 'react-bootstrap';
import { ComposedChart, Line, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Brush } from 'recharts';
import { DateRange } from '../../utilities/types/types';
import { IoIosArrowDropup, IoIosArrowDropdown } from "react-icons/io";
import { makeFriendlyDollarAmount } from '../../utilities/helpers/functions';

const renderColorfulLegendText = (value: string, entry: any) => {
    const hasUnderscores = value.includes('_');

    let formattedValue;
    if (hasUnderscores) {
        const words = value.split('_');
        formattedValue = words.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    } else {
        formattedValue = value.charAt(0).toUpperCase() + value.slice(1);
    }

    return (
        <span className='dark-text px-2' style={{ fontWeight: 400, fontSize: "16px", fontStyle: "normal", fontFamily: "Rubik" }}>
            {formattedValue}
        </span>
    );
};

// Instead this should just loop over once and return an array with the keys values being the counts and whether or not the col had a negative
// This would avoid us needing to call the function everytime to get the max value for a column/if it has a negative since the queries may get very large
function findMaxNumericValue(data, excludeArr: string[]) {
    let hasNegative = false;
    const maxNumeric = data.reduce((maxNumericValue: any, currentData: any) => {
        for (const key in currentData) {
            if (key !== 'name' && typeof currentData[key] === 'number' && !excludeArr.includes(key)) {
                maxNumericValue = Math.max(Math.abs(maxNumericValue), Math.abs(currentData[key]));
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

interface ICCGChartDataAttributes {
    granularity: string
};

function filterByGranularity(data: ICCGChartDataAttributes[], targetGranularity: string) {
    // console.log(data.filter(item => item.granularity === targetGranularity).map(item => ({...item, name: "abc"})));
    return data.filter(item => item.granularity === targetGranularity);
}

interface ICCGChartProps {
    chartData?: ICCGChartDataAttributes[]
};

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const bodyItems = payload.map((obj, index) => {
            return ((obj.value == 0) &&
                ((obj.dataKey == "projected_income") ||
                    (obj.dataKey == "projected_expenses") ||
                    (obj.dataKey == "profit"))) ? (
                obj.dataKey == "profit" ?
                    (<p key={index} className="mb-1">
                        No earnings to report this {obj.payload.granularity}.
                    </p>)
                    :
                    null
            )
                :
                ((obj.dataKey != "projected_income") &&
                    (obj.dataKey != "projected_expenses")) ? (
                    <p key={index} className="mb-1">
                        {obj.name}:
                        {/* <strong> */}
                        <span className='ps-2' style={{ color: !(obj.dataKey == "profit") ? obj.fill : (obj.value >= 0) ? "#036100" : "#930505" }}>{obj.value}</span>
                        {/* </strong> */}
                    </p>
                ) :
                    (
                        <p key={index} className="mb-1">
                            {(obj.dataKey == "projected_expenses") ? "Unpaid PO balance" : "Unpaid invoice balance"}:
                            {/* <strong> */}
                            <span className='ps-2' style={{ color: !(obj.dataKey == "profit") ? obj.fill : (obj.value >= 0) ? "#036100" : "#930505" }}>{obj.value}</span>
                            {/* </strong> */}
                        </p>
                    );

        });

        return (
            <div className={`${styles.chartBorderWrapper} bg-white p-3`}>
                <p className="mb-2 initialism">{`${label} ${payload[0].payload.granularity !== "year" ? new Date(payload[0].payload.date).getUTCFullYear() : ""}`}</p>
                {
                    bodyItems
                }
            </div>
        );
    }

    return null;

};


export const CCGChart: React.FC<ICCGChartProps> = ({ chartData }) => {


    const [showYReferenceLineRight, setShowYReferenceLineRight] = useState<boolean>(false);
    const [showBrush, setShowBrush] = useState<boolean>(false);
    const [yAxisWidthLeft, setYAxisWidthLeft] = useState<number>(3);
    const [yAxisWidthRight, setYAxisWidthRight] = useState<number>(3);
    const [endIndexBrush, setEndIndexBrush] = useState<number>(0);
    const [startIndexBrush, setStartIndexBrush] = useState<number>(0);
    const [loadingChart, setLoadingChart] = useState(true);
    const [chartGranularity, setChartGranularity] = useState("week");
    const [showChartGranularityMenu, setShowChartGranularityMenu] = useState(false);
    const [data, setData] = useState<ICCGChartDataAttributes[]>([]);
    // TODO in the future each chart can display its own custom date range, perhaps for him to create custom reports using the charts?
    // const [dateRange, setDateRange] = useState<DateRange>([new Date(new Date().setFullYear(new Date().getFullYear() - 1)), new Date()]);
    // temp hack to set width

    useEffect(() => {
        const newChartData = filterByGranularity(chartData, chartGranularity);

        if (newChartData.length >= 30) {
            setStartIndexBrush(0);
            setEndIndexBrush(30);
            setShowBrush(true);
        } else {
            setStartIndexBrush(0);
            setEndIndexBrush(0);
            setShowBrush(false);
        }

        setData(newChartData);
    }, [chartData, chartGranularity]);

    useEffect(() => {
        //? This useEffect is used to style chart based on date being shown
        //? Done to avoid overflow of Y axis values out of the container when numbers get to big

        const { maxNumericValue: maxNumericValueLeft, hasNegative: leftHasNeg } = findMaxNumericValue(data.slice(startIndexBrush, endIndexBrush == 0 ? data.length : endIndexBrush + 1), ["profit"]);
        const { maxNumericValue: maxNumericValueRight, hasNegative: rightHasNeg } = findMaxNumericValue(data.slice(startIndexBrush, endIndexBrush == 0 ? data.length : endIndexBrush + 1), ["income", "expenses"]);

        // console.log("maxnumericvalueleft", maxNumericValueLeft);
        // console.log("maxnumericvalueright", maxNumericValueRight);
        // console.log("righthasneg", rightHasNeg);

        if (maxNumericValueLeft <= 8) {
            setYAxisWidthLeft(26);
        }
        else if (maxNumericValueLeft <= 80) {
            setYAxisWidthLeft(35);
        }
        else if (maxNumericValueLeft <= 800) {
            setYAxisWidthLeft(45);
        }
        else if (maxNumericValueLeft <= 1000) {
            setYAxisWidthLeft(55);
        }
        else if (maxNumericValueLeft <= 4000) {
            setYAxisWidthLeft(45);
        }
        else if (maxNumericValueLeft <= 80000) {
            setYAxisWidthLeft(35);
        }
        else if (maxNumericValueLeft <= 400000) {
            setYAxisWidthLeft(35);
        }
        else if (maxNumericValueLeft <= 800000) {
            setYAxisWidthLeft(35);
        }
        else if (maxNumericValueLeft <= 8000000) {
            setYAxisWidthLeft(35);
        }
        else if (maxNumericValueLeft <= 80000000) {
            setYAxisWidthLeft(35);
        }
        else {
            setYAxisWidthLeft(45);
        };

        if (maxNumericValueRight <= 8) {
            !rightHasNeg ? setYAxisWidthRight(26) : setYAxisWidthRight(26 + 2);
        }
        else if (maxNumericValueRight <= 80) {
            !rightHasNeg ? setYAxisWidthRight(35) : setYAxisWidthRight(35 + 2);
        }
        else if (maxNumericValueRight <= 800) {
            !rightHasNeg ? setYAxisWidthRight(45) : setYAxisWidthRight(45 + 2);
        }
        else if (maxNumericValueRight <= 1000) {
            !rightHasNeg ? setYAxisWidthRight(55) : setYAxisWidthRight(55 + 2);
        }
        else if (maxNumericValueRight <= 4000) {
            !rightHasNeg ? setYAxisWidthRight(45) : setYAxisWidthRight(45 + 2);
        }
        else if (maxNumericValueRight <= 80000) {
            !rightHasNeg ? setYAxisWidthRight(35) : setYAxisWidthRight(35 + 2);
        }
        else if (maxNumericValueRight <= 400000) {
            !rightHasNeg ? setYAxisWidthRight(35) : setYAxisWidthRight(35 + 2);
        }
        else if (maxNumericValueRight <= 800000) {
            !rightHasNeg ? setYAxisWidthRight(35) : setYAxisWidthRight(35 + 2);
        }
        else if (maxNumericValueRight <= 8000000) {
            !rightHasNeg ? setYAxisWidthRight(35) : setYAxisWidthRight(35 + 2);
        }
        else if (maxNumericValueRight <= 80000000) {
            !rightHasNeg ? setYAxisWidthRight(35) : setYAxisWidthRight(35 + 2);
        }
        else {
            !rightHasNeg ? setYAxisWidthRight(45) : setYAxisWidthRight(45 + 2);
        };

        if (rightHasNeg)
            setShowYReferenceLineRight(true);
        else
            setShowYReferenceLineRight(false);

        setLoadingChart(false);

        //! Logic to pad incase use wants to see entire dollar amounts and not abbreviations!
        // if (maxNumericValueLeft <= 8000) {
        //     setYAxisWidthLeft(55);
        // }
        // else if (maxNumericValueLeft <= 80000) {
        //     setYAxisWidthLeft(65);
        // }
        // else if (maxNumericValueLeft <= 800000) {
        //     setYAxisWidthLeft(75);
        // }
        // else if (maxNumericValueLeft <= 8000000) {
        //     setYAxisWidthLeft(85);
        // }
        // else if (maxNumericValueLeft <= 80000000) {
        //     setYAxisWidthLeft(95);
        // }
        // else {
        //     setYAxisWidthLeft(105);
        // };


        // if (maxNumericValueRight <= 8000) {
        //     setYAxisWidthRight(65);
        // }
        // else if (maxNumericValueRight <= 80000) {
        //     setYAxisWidthRight(75);
        // }
        // else if (maxNumericValueRight <= 800000) {
        //     setYAxisWidthRight(85);
        // }
        // else if (maxNumericValueRight <= 8000000) {
        //     setYAxisWidthRight(95);
        // }
        // else if (maxNumericValueRight <= 80000000) {
        //     setYAxisWidthRight(105);
        // }
        // else {
        //     setYAxisWidthRight(115);
        // };
    }, [data, startIndexBrush, endIndexBrush]);

    // console.log(startIndexBrush, endIndexBrush);
    // console.log(data.length);
    // console.log("yAxisWidthLeft ", yAxisWidthLeft);
    // console.log("yAxisWidthRight ", yAxisWidthRight);
    // console.log("showYreferenceLineRight ", showYReferenceLineRight);

    // useEffect(() => {
    // ? Can be used to set an approriate chartGranularity selection based on globalDateRange
    //     if (globalDateRange !== null) {

    //         const customGlobalDateRange = Math.abs(globalDateRange[0] - globalDateRange[1]);

    //         const thirtyDaysInMs = 2592000000;
    //         const thirtyWeeksInMs = 18144000000;
    //         const thirtyMonthsInMs = 78892380000;
    //         const thirtyYearsInMs = 946708560000;

    //         if (customGlobalDateRange < thirtyDaysInMs) {
    //             setChartGranularity("day");
    //         }
    //         else if (customGlobalDateRange < thirtyWeeksInMs) {
    //             setChartGranularity("week");
    //         }
    //         else if (customGlobalDateRange < thirtyMonthsInMs) {
    //             setChartGranularity("month");
    //         }
    //         else if (customGlobalDateRange < thirtyYearsInMs) {
    //             setChartGranularity("year");
    //         }
    //         else {
    //             setChartGranularity("year");
    //         }
    //     }


    // }, [globalDateRange]);

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
                        width="100%"
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
                            <XAxis
                                dataKey="name"
                                // angle={5}
                                stroke={styles.darkText}
                                tickLine={false}
                                tickMargin={5}
                                minTickGap={5}
                                padding={{
                                    left: 0,
                                    right: 0
                                }}
                                interval={chartGranularity != "week" ? "equidistantPreserveStart" : "preserveEnd"}
                                // tick={<CustomizedAxisTick props={chartGranularity} />}
                                tick={(props: any) => {
                                    const { x, y, stroke, payload } = props;
                                    switch (chartGranularity) {
                                        case "day":
                                            return (
                                                <g transform={`translate(${x},${y})`}>
                                                    <text x={23} y={0} dy={14} textAnchor="end" fill="#666" transform="rotate(0)">
                                                        {payload.value}
                                                    </text>
                                                </g>
                                            )
                                        case "week":
                                            return (
                                                <g transform={`translate(${x},${y})`}>
                                                    <text x={30} y={0} dy={14} textAnchor="end" fill="#666" transform="rotate(0)">
                                                        {payload.value}
                                                    </text>
                                                </g>
                                            )
                                        case "month":
                                            return (
                                                <g transform={`translate(${x},${y})`}>
                                                    <text x={22} y={0} dy={14} textAnchor="end" fill="#666" transform="rotate(0)">
                                                        {payload.value}
                                                    </text>
                                                </g>
                                            )
                                        case "year":
                                            return (
                                                <g transform={`translate(${x},${y})`}>
                                                    <text x={18} y={0} dy={14} textAnchor="end" fill="#666" transform="rotate(0)">
                                                        {payload.value}
                                                    </text>
                                                </g>
                                            )
                                        default:
                                            return (
                                                <g transform={`translate(${x},${y})`}>
                                                    <text x={0} y={0} dy={14} textAnchor="end" fill="#666" transform="rotate(0)">
                                                        {payload.value}
                                                    </text>
                                                </g>
                                            )
                                    };
                                }}
                            />
                            {showYReferenceLineRight && <ReferenceLine yAxisId={"right"} y={0} stroke={styles.darkText} strokeDasharray={2} />}
                            <YAxis
                                axisLine={false}
                                width={yAxisWidthLeft}
                                tickMargin={7}
                                tickLine={false}
                                stroke={styles.darkText}
                                fontFamily='Rubik'
                                fontSize={16}
                                fontWeight={400}
                                fontStyle="normal"
                                yAxisId={"left"}
                                orientation="left"
                                tickFormatter={makeFriendlyDollarAmount}
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
                                tickMargin={7}
                                tickLine={false}
                                stroke={styles.darkText}
                                fontFamily='Rubik'
                                fontSize={16}
                                fontWeight={400}
                                fontStyle="normal"
                                tickFormatter={makeFriendlyDollarAmount}
                            />

                            <Tooltip
                                content={CustomTooltip}
                            />
                            {showBrush &&
                                <Brush onChange={(i) => {
                                    setStartIndexBrush(i.startIndex);
                                    setEndIndexBrush(i.endIndex);
                                }}
                                    // className={"mx-auto"}
                                    // x={80}
                                    dataKey="name"
                                    height={30}
                                    // width={500}
                                    stroke={styles.secondaryBlue}
                                    startIndex={startIndexBrush}
                                    endIndex={endIndexBrush}
                                />
                            }
                            <Legend
                                align='left'
                                verticalAlign='top'
                                iconSize={19}
                                iconType='circle'
                                wrapperStyle={{ paddingBottom: '20px', paddingLeft: "0px" }}
                                formatter={renderColorfulLegendText}
                            />
                            <Bar yAxisId={"left"} name="Income" dataKey="income" stackId="b" fill={styles.secondaryBlue} radius={[5, 5, 0, 0]} />
                            <Bar yAxisId={"left"} name="Expenses" dataKey="expenses" stackId="a" fill={styles.primaryBlue} radius={[5, 5, 0, 0]} />
                            <Bar
                                animationBegin={250}
                                yAxisId={"left"}
                                dataKey="projected_income"
                                name={"Projected Income"}
                                stackId="b"
                                fill={"#FFF1E3"}
                                radius={[5, 5, 5, 5]}
                            />
                            <Bar
                                animationBegin={250}
                                yAxisId={"left"}
                                name="Projected Expenses"
                                dataKey="projected_expenses"
                                stackId="a"
                                fill={"#FAD8D8"}
                                radius={[5, 5, 5, 5]}
                            />
                            <Line yAxisId={"right"} name="Profit" type="monotone" dataKey="profit" stroke={styles.lightOrange} />
                            {/* <Bar dataKey="amt" stackId="a" fill="#ffc658" /> */}
                        </ComposedChart>
                    </ResponsiveContainer>

                </div >
            }
        </>
    )
};
