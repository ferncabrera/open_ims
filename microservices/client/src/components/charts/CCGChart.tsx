import React, { useEffect, useState, PureComponent } from 'react'
import { getJSONResponse } from '../../utilities/apiHelpers';
import _, { stubFalse } from 'lodash';
import styles from "./CCGChart.module.scss";
import { Container, Row, Col, Dropdown, DropdownButton, NavItem } from 'react-bootstrap';
import { ComposedChart, Line, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Brush } from 'recharts';
import { DateRange } from '../../utilities/types/types';
import { IoIosArrowDropup, IoIosArrowDropdown } from "react-icons/io";
import { makeFriendlyDollarAmount } from '../../utilities/helpers/functions';
import useWindowDimensions from '../../hooks/useWindowDimensions'
import { bannerState } from '../../atoms/atoms';
import { useAtom } from 'jotai';

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
        <span className='dark-text px-1 pt-2' style={{ fontWeight: 400, fontSize: "calc(14px + .35vh)", fontStyle: "normal", fontFamily: "Rubik" }}>
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
    granularity: string,
};

function filterByGranularity(data: ICCGChartDataAttributes[] | undefined, targetGranularity: string) {
    // console.log(data.filter(item => item.granularity === targetGranularity).map(item => ({...item, name: "abc"})));
    if (data)
        return data.filter(item => item.granularity === targetGranularity);
    else 
        return [];
}   

interface ICCGChartProps {
    chartData?: ICCGChartDataAttributes[],
    loadingChartData?: boolean

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
                        <span className='ps-2' style={{ color: !(obj.dataKey == "profit") ? obj.fill : (obj.value >= 0) ? styles.darkGreen : styles.darkRed }}>{obj.value}</span>
                        {/* </strong> */}
                    </p>
                ) :
                    (
                        <p key={index} className="mb-1">
                            {(obj.dataKey == "projected_expenses") ? "Unpaid PO balance" : "Unpaid invoice balance"}:
                            {/* <strong> */}
                            <span className='ps-2' style={{ color: !(obj.dataKey == "profit") ? obj.fill : (obj.value >= 0) ? styles.darkGreen : styles.darkRed }}>{obj.value}</span>
                            {/* </strong> */}
                        </p>
                    );

        });

        return (
            <div className={`${styles.chartTooltipBorderWrapper} bg-white p-3`}>
                <p className="mb-2 initialism">{`${label} ${payload[0].payload.granularity !== "year" ? new Date(payload[0].payload.date).getUTCFullYear() : ""}`}</p>
                {
                    bodyItems
                }
            </div>
        );
    }

    return null;

};

const CustomLoadingTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const bodyItems = payload.map((obj, index) => {
            return ((obj.dataKey != "projected_income") &&
                (obj.dataKey != "projected_expenses")) ? (
                <p key={index} className="mb-1">
                    {obj.name}:
                    {/* <strong> */}
                    <span className='ps-2' style={{ color: styles.darkText }}>loading....</span>
                    {/* </strong> */}
                </p>
            ) :
                (
                    <p key={index} className="mb-1">
                        {(obj.dataKey == "projected_expenses") ? "Unpaid PO balance" : "Unpaid invoice balance"}:
                        {/* <strong> */}
                        <span className='ps-2' style={{ color: styles.darkText }}>loading...</span>
                        {/* </strong> */}
                    </p>
                );

        });

        return (
            <div className={`${styles.chartTooltipBorderWrapper} bg-white p-3`}>
                <p className="mb-2 initialism">{`${label} ${payload[0].payload.granularity !== "year" ? new Date(payload[0].payload.date).getUTCFullYear() : ""}`}</p>
                {
                    bodyItems
                }
            </div>
        );
    }

    return null;

};

export const CCGChart: React.FC<ICCGChartProps> = ({ chartData, loadingChartData = false }) => {


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
    const { height: winHeight, width: winWidth } = useWindowDimensions();
    const [bannerTextState, setBannerTextState] = useAtom(bannerState);

    // TODO in the future each chart can display its own custom date range, perhaps for him to create custom reports using the charts?
    // const [dateRange, setDateRange] = useState<DateRange>([new Date(new Date().setFullYear(new Date().getFullYear() - 1)), new Date()]);
    // temp hack to set width

    useEffect(() => {
        const newChartData = filterByGranularity(chartData, chartGranularity);

        if (newChartData.length >= 30) {
            setStartIndexBrush(0);
            if (winWidth <= 576)
                setEndIndexBrush(3);
            else if (winWidth <= 768) {
                setEndIndexBrush(5)
            }
            else if (winWidth <= 1200) {
                setEndIndexBrush(7)
            }
            else { setEndIndexBrush(14) }
            setShowBrush(true);
        } else {
            setStartIndexBrush(0);
            setEndIndexBrush(0);
            setShowBrush(false);
        }

        setData(newChartData);
        // setEndIndexBrush(0);
        // setShowBrush(false);
        // setData(
        //     [
        //         {
        //             date: "Fake",
        //             granularity: "fake",
        //             projected_expenses: 500 / 2,
        //             expenses: 500,
        //             projected_income: 500 / 2,
        //             income: 500,
        //             profit: 500,
        //             name: "Jan 2"
        //         },
        //         {
        //             date: "Fake",
        //             granularity: "fake",
        //             projected_expenses: 1000 / 2,
        //             expenses: 1000,
        //             projected_income: 1000 / 2,
        //             income: 1000,
        //             profit: 1000,
        //             name: "Jan 2"
        //         },
        //         {
        //             date: "Fake",
        //             granularity: "fake",
        //             projected_expenses: 2000 / 2,
        //             expenses: 2000,
        //             projected_income: 2000 / 2,
        //             income: 2000,
        //             profit: 2000,
        //             name: "Jan 2"
        //         },
        //         {
        //             date: "Fake",
        //             granularity: "fake",
        //             projected_expenses: 2000 / 2,
        //             expenses: 2000,
        //             projected_income: 2000 / 2,
        //             income: 2000,
        //             profit: 2000,
        //             name: "Jan 2"
        //         },
        //         {
        //             date: "Fake",
        //             granularity: "fake",
        //             projected_expenses: 4000 / 2,
        //             expenses: 4000,
        //             projected_income: 4000 / 2,
        //             income: 4000,
        //             profit: 4000,
        //             name: "Jan 2"
        //         },
        //         {
        //             date: "Fake",
        //             granularity: "fake",
        //             projected_expenses: 10000 / 2,
        //             expenses: 10000,
        //             projected_income: 10000 / 2,
        //             income: 10000,
        //             profit: 10000,
        //             name: "Jan 2"
        //         },
        //     ]
        //     );
        //     console.log("this is running");
    }, [chartData, chartGranularity, winWidth]);


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
                    <Row className="mx-0 pt-sm-2" >

                        <Col xs={"auto"}>
                            <h4 style={{ fontSize: "calc(20px + .85vh)" }} className={`${styles.chartTitle} text-capitalize text-nowrap ps-1 ms-1 mt-1 pt-1`}>
                                income & memes
                            </h4>
                        </Col>

                        <Col sm={12} md={4} className={`py-1 ms-auto`}>
                            <Dropdown
                                className=''
                                drop='down-centered'
                                onToggle={show => {
                                    setShowChartGranularityMenu(show);
                                }}
                            >
                                <Dropdown.Toggle
                                    id={`${styles.incomeExpenseChartGranularityDropdown}`}
                                    style={{height:"inherit", width: "100%"}}
                                >
                                    {chartGranularity != "day" ?
                                        <span style={{ fontSize: "calc(14px + .25vh)" }} className="">{`${chartGranularity.charAt(0).toUpperCase() + chartGranularity.slice(1)}ly view`}</span>

                                        : <span style={{ fontSize: "calc(14px + .25vh)" }} className="">Daily view</span>
                                    }
                                    {
                                        // showChartGranularityMenu ?
                                        <IoIosArrowDropup
                                            className={`${styles.iconStartRot} ${showChartGranularityMenu ? styles.iconEndRot : ''} ms-3`}
                                            style={{ fontSize: "calc(18px + .55vh)" }} />
                                        // :
                                        // <IoIosArrowDropdown className={"ms-4"} style={{ fontSize: "24px", paddingBottom: "3px" }} />
                                    }
                                </Dropdown.Toggle>

                                <Dropdown.Menu style={{ fontSize: "calc(14px + .35vh)" }}>
                                    {chartGranularity != "day" && <>
                                        <Dropdown.Item style={{ color: styles.darkText, fontSize: "inherit" }} className="py-0" onClick={() => { setChartGranularity("day"); }} >Daily view</Dropdown.Item>
                                        <Dropdown.Divider />
                                    </>
                                    }
                                    {chartGranularity != "week" && <>
                                        <Dropdown.Item style={{ color: styles.darkText, fontSize: "inherit" }} className="py-0" onClick={() => { setChartGranularity("week"); }} >Weekly view</Dropdown.Item>
                                        <Dropdown.Divider />
                                    </>
                                    }
                                    {chartGranularity != "month" && <>
                                        <Dropdown.Item style={{ color: styles.darkText, fontSize: "inherit" }} className="py-0" onClick={() => { setChartGranularity("month"); }} >Monthly view</Dropdown.Item>
                                        {chartGranularity != "year" && <Dropdown.Divider />}
                                    </>
                                    }
                                    {/* <Dropdown.Item style={{ color: styles.darkText, fontSize: "inherit" }} className="py-0" onClick={() => { setChartGranularity("quarter"); }} >Quarterly view</Dropdown.Item>
                                    <Dropdown.Divider /> */}
                                    {chartGranularity != "year" &&
                                        <Dropdown.Item style={{ color: styles.darkText, fontSize: "inherit" }} className="py-0" onClick={() => { setChartGranularity("year"); }} >Yearly view</Dropdown.Item>
                                    }
                                </Dropdown.Menu>
                            </Dropdown>
                        </Col>

                    </Row>

                    <ResponsiveContainer
                        width="100%"
                        height="85%"
                        className={"pb-sm-2"}
                    >
                        <ComposedChart
                            className={`ps-2`}
                            width={500}
                            height={300}
                            data={data}
                            margin={{
                                top: 0,
                                right: 30,
                                left: 20,
                                bottom: 5,
                            }}
                            barCategoryGap={"20%"}
                            barGap={"10%"}
                        >
                            <CartesianGrid strokeDasharray="9" vertical={false} fill={styles.pageGrey} />
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
                                                    <text x={23} y={0} dy={14} textAnchor="end" fill={styles.darkText} transform="rotate(0)">
                                                        {payload.value}
                                                    </text>
                                                </g>
                                            )
                                        case "week":
                                            return (
                                                <g transform={`translate(${x},${y})`}>
                                                    <text x={30} y={0} dy={14} textAnchor="end" fill={styles.darkText} transform="rotate(0)">
                                                        {payload.value}
                                                    </text>
                                                </g>
                                            )
                                        case "month":
                                            return (
                                                <g transform={`translate(${x},${y})`}>
                                                    <text x={22} y={0} dy={14} textAnchor="end" fill={styles.darkText} transform="rotate(0)">
                                                        {payload.value}
                                                    </text>
                                                </g>
                                            )
                                        case "year":
                                            return (
                                                <g transform={`translate(${x},${y})`}>
                                                    <text x={18} y={0} dy={14} textAnchor="end" fill={styles.darkText} transform="rotate(0)">
                                                        {payload.value}
                                                    </text>
                                                </g>
                                            )
                                        default:
                                            return (
                                                <g transform={`translate(${x},${y})`}>
                                                    <text x={0} y={0} dy={14} textAnchor="end" fill={styles.darkText} transform="rotate(0)">
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
                                content={loadingChartData ? CustomLoadingTooltip : CustomTooltip}
                            />
                            {showBrush &&
                                <Brush onChange={(i) => {
                                    setStartIndexBrush(i?.startIndex ? i?.startIndex : 0);
                                    setEndIndexBrush(i?.endIndex ? i?.endIndex : 0);
                                }}
                                    // className={"mx-auto"}
                                    // x={80}
                                    dataKey="name"
                                    height={30}
                                    // width={500}
                                    stroke={!loadingChartData ? styles.secondaryBlue : styles.lightGrey}
                                    startIndex={startIndexBrush}
                                    endIndex={endIndexBrush}
                                // className='pt-sm-2'
                                />
                            }
                            <Legend
                                align='left'
                                verticalAlign='top'
                                iconSize={19}
                                iconType='circle'
                                wrapperStyle={{ paddingBottom: '25px', paddingLeft: "0px", paddingTop: "3px" }}
                                formatter={renderColorfulLegendText}
                            />
                            <Bar
                                animationDuration={1000}
                                animationBegin={50}
                                style={{ filter: `drop-shadow(${endIndexBrush - startIndexBrush > 30 ? "2px" : "3px"} 0px ${styles.lightGrey})` }}
                                yAxisId={"left"}
                                name="Income"
                                dataKey="income"
                                stackId="b"
                                fill={!loadingChartData ? styles.secondaryBlue : styles.lightGrey}
                                radius={[5, 5, 0, 0]}
                            />
                            <Bar
                                animationDuration={1000}
                                animationBegin={200}
                                style={{ filter: `drop-shadow(${endIndexBrush - startIndexBrush > 30 ? "2px" : "3px"} 0px ${styles.lightGrey})` }}
                                yAxisId={"left"}
                                name="Expenses"
                                dataKey="expenses"
                                stackId="a"
                                fill={!loadingChartData ? styles.primaryBlue : styles.lightGrey}
                                radius={[5, 5, 0, 0]}
                            />
                            <Bar
                                style={{ filter: `drop-shadow(${endIndexBrush - startIndexBrush > 30 ? "2px" : "3px"} 0px ${styles.lightGrey})` }}
                                animationDuration={1000}
                                animationBegin={400}
                                yAxisId={"left"}
                                dataKey="projected_income"
                                name={"Projected income"}
                                stackId="b"
                                fill={`${!loadingChartData ? styles.lightGreen : styles.lightGrey}`}
                                radius={[5, 5, 5, 5]}
                            />
                            <Bar
                                style={{ filter: `drop-shadow(${endIndexBrush - startIndexBrush > 30 ? "2px" : "3px"} 0px ${styles.lightGrey})` }}
                                animationDuration={1000}
                                animationBegin={600}
                                yAxisId={"left"}
                                name="Projected expenses"
                                dataKey="projected_expenses"
                                stackId="a"
                                fill={`${!loadingChartData ? styles.lightRed : styles.lightGrey}`}
                                radius={[5, 5, 5, 5]}
                            />
                            <Line
                                animationDuration={1000}
                                animationBegin={250}
                                yAxisId={"right"} name="Profit" type="monotone" dataKey="profit" stroke={!loadingChartData ? styles.lightOrange : styles.darkGrey} />
                            {/* <Bar dataKey="amt" stackId="a" fill="#ffc658" /> */}
                        </ComposedChart>
                    </ResponsiveContainer>

                </div >
            }
        </>
    )
};
