import React, { useEffect, useState } from 'react'
import { getJSONResponse } from '../../utilities/apiHelpers';
import _ from 'lodash';
import styles from "./CCGChart.module.scss";
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// ! REMOVE ONCE DONE WITH HELPER FUNC
function getRandomNumber(min, max) {
    // Ensure that both min and max are integers
    min = Math.ceil(min);
    max = Math.floor(max);
  
    // Generate a random number between min (inclusive) and max (exclusive)
    return Math.floor(Math.random() * (max - min)) + min;
  }
// ! dummy data
const data = [
    {
        name: 'Abc',
        income: getRandomNumber(0, 830000),
        expenses: getRandomNumber(0, 830000),
        amt: 0,
    },
    {
        name: 'Abc',
        income: getRandomNumber(0, 830000),
        expenses: getRandomNumber(0, 830000),
        amt: 0,
    },
    {
        name: 'Abc',
        income: getRandomNumber(0, 830000),
        expenses: getRandomNumber(0, 830000),
        amt: 0,
    },
    {
        name: 'Abc',
        income: getRandomNumber(0, 830000),
        expenses: getRandomNumber(0, 830000),
        amt: 0,
    },
    {
        name: 'Abc',
        income: getRandomNumber(0, 830000),
        expenses: getRandomNumber(0, 830000),
        amt: 0,
    },
    {
        name: 'Abc',
        income: getRandomNumber(0, 830000),
        expenses: getRandomNumber(0, 830000),
        amt: 0,
    },
    {
        name: 'Abc',
        income: getRandomNumber(0, 830000),
        expenses: getRandomNumber(0, 830000),
        amt: 0,
    },
    {
        name: 'Abc',
        income: getRandomNumber(0, 830000),
        expenses: getRandomNumber(0, 830000),
        amt: 0,
    },
    {
        name: 'Abc',
        income: getRandomNumber(0, 830000),
        expenses: getRandomNumber(0, 830000),
        amt: 0,
    },
    {
        name: 'Abc',
        income: getRandomNumber(0, 830000),
        expenses: getRandomNumber(0, 830000),
        amt: 0,
    },
    {
        name: 'Abc',
        income: getRandomNumber(0, 830000),
        expenses: getRandomNumber(0, 830000),
        amt: 0,
    },
    {
        name: 'Abc',
        income: getRandomNumber(0, 830000),
        expenses: getRandomNumber(0, 830000),
        amt: 0,
    },
];

function findMaxNumericValue(data) {
    return data.reduce((maxNumericValue: any, currentData: any) => {
        for (const key in currentData) {
            if (key !== 'name' && typeof currentData[key] === 'number') {
                maxNumericValue = Math.max(maxNumericValue, currentData[key]);
            }
        }
        return maxNumericValue;
    }, 0);
};

interface ICCGChartProps {
}

const renderColorfulLegendText = (value: string, entry: any) => {
    // const { color } = entry;
    const upperCased = value.charAt(0).toUpperCase() + value.slice(1);
    return <span className='dark-text px-2' style={{ fontWeight: 400, fontSize: "16px", fontStyle: "normal", fontFamily: "Rubik" }}>{upperCased}</span>;
};

export const CCGChart: React.FC<ICCGChartProps> = () => {

    const [yAxisWidth, setYAxisWidth] = useState(0);
    const [loadingChart, setLoadingChart] = useState(true);
    // const [maxNumericVal, setMaxNumericVal] = useState();

    useEffect(() => {
        const maxNumericValue = findMaxNumericValue(data);
        //? Done to avoid overflow of Y axis values out of the container when numbers get to big
        if (maxNumericValue <= 8000) {
            setYAxisWidth(55);
        }
        else if (maxNumericValue <= 80000) {
            setYAxisWidth(65);
        }
        else if (maxNumericValue <= 800000) {
            setYAxisWidth(75)
        }
        else if (maxNumericValue <= 8000000) {
            setYAxisWidth(85)
        } else if (maxNumericValue <= 80000000) {
            setYAxisWidth(95);
        } else {
            setYAxisWidth(105);
        }
        setLoadingChart(false);
    }, [data]);
    
    return (
        //     <div>chart component div below:</div>
        // <div className={`${styles.chartBorderWrapper}`}>
        <>
            {!loadingChart && <div
                className={`${styles.chartBackground} ${styles.chartBorderWrapper} ps-0 pe-0 pb-3`}
                style={{ width: "70%", height: "55%" }}
            >
                <h4 className={`${styles.chartTitle} ps-3 ms-1 mt-4`}>
                    Income & Expenses
                </h4>
                <ResponsiveContainer
                    width="101%"
                    height="90%">
                    <BarChart
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
                        barCategoryGap={15}
                        barGap={5}
                        maxBarSize={15}
                    >
                        <CartesianGrid strokeDasharray="9" vertical={false} />
                        <XAxis dataKey="name" stroke="#2C2C2C" tickLine={false} tickMargin={5} />
                        <YAxis
                            axisLine={false}
                            width={yAxisWidth}
                            unit="$"
                            tickMargin={7}
                            tickLine={false}
                            stroke="#2C2C2C"
                            fontFamily='Rubik'
                            fontSize={16}
                            fontWeight={400}
                            fontStyle="normal"
                        // domain={([dataMin, dataMax]) => {
                        //     // setYAxisWidth(60);
                        //     return [0, dataMax];
                        // }}
                        />
                        <Tooltip />
                        <Legend
                            align='left'
                            verticalAlign='top'
                            iconSize={19}
                            iconType='circle'
                            wrapperStyle={{ paddingBottom: '20px', paddingLeft: "0px" }}
                            formatter={renderColorfulLegendText}
                        />
                        <Bar dataKey="income" fill="#B9BCFF" radius={[5, 5, 0, 0]}/>
                        <Bar dataKey="expenses" stackId="a" fill="#6268FF" radius={[5, 5, 0, 0]}/>
                        <Bar dataKey="amt" stackId="a" fill="#ffc658" />
                    </BarChart>
                </ResponsiveContainer>
            </div>}
        </>
    )
}
