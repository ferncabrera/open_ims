import { Request, Response } from "express";
import { query } from "../db";
import customError from "../utils/customError";
import { DateRange } from "../utils/types";
import { start } from "repl";
import { QueryResult } from "pg";

interface IGetRequestHeaders {
    startdate?: string;
    enddate?: string;
}

export const income_and_expense_by_date = async (req: Request, res: Response) => {
    let { startdate, enddate } = req.headers as unknown as IGetRequestHeaders;
    // console.log(startdate, enddate);
    if ((!startdate || !enddate))
        throw new Error("An object with keys startdate and enddate is required in the headers for this API function! Ex: {startdate: '2023-12-09' enddate: '2024-01-09'}");
    // TODO: Really need to write some unit tests to verify the data we are getting back from this query/API is right.... lol

    const profitTotalsByGranularityQuery = `
        WITH DaySeriesData AS (
            SELECT generate_series(
                date_trunc('day', $1::date),
                date_trunc('day', $2::date),
                interval '1 day'
            )::date AS date
            ), 
            WeekSeriesData AS (
            SELECT generate_series(
                date_trunc('week', $1::date),
                date_trunc('week', $2::date),
                interval '1 week'
            )::date AS date
            ), 
            MonthSeriesData AS (
            SELECT generate_series(
                date_trunc('month', $1::date),
                date_trunc('month', $2::date),
                interval '1 month'
            )::date AS date
            ), 
            YearSeriesData AS (
            SELECT generate_series(
                date_trunc('year', $1::date),
                date_trunc('year', $2::date),
                interval '1 year'
            )::date AS date
        ), 

        PurchaseOrderSummary AS (
            SELECT
                DS.DATE,
                'day' AS GRANULARITY,
                COALESCE(SUM(CASE WHEN PO.PAYMENT_STATUS = 'Paid' THEN PO.AMOUNT_DUE ELSE 0 END),
            0) AS AMOUNT_DUE,
                COALESCE(SUM(CASE WHEN PO.PAYMENT_STATUS = 'Not paid' THEN PO.AMOUNT_DUE ELSE 0 END),
            0) AS PROJECTED_AMOUNT_DUE
            FROM
                DAYSERIESDATA DS
            LEFT JOIN PURCHASE_ORDERS PO
                ON DS.DATE = DATE_TRUNC('day', PO.PURCHASE_DATE)
                AND PO.PURCHASE_DATE BETWEEN $1::date AND $2::date
            GROUP BY
                DS.DATE,
                GRANULARITY

            UNION

            SELECT
                DS.DATE,
                'week' AS GRANULARITY,
                COALESCE(SUM(CASE WHEN PO.PAYMENT_STATUS = 'Paid' THEN PO.AMOUNT_DUE ELSE 0 END),
            0) AS AMOUNT_DUE,
                COALESCE(SUM(CASE WHEN PO.PAYMENT_STATUS = 'Not paid' THEN PO.AMOUNT_DUE ELSE 0 END),
            0) AS PROJECTED_AMOUNT_DUE
            FROM
                WEEKSERIESDATA DS
            LEFT JOIN PURCHASE_ORDERS PO
                ON DS.DATE = DATE_TRUNC('week', PO.PURCHASE_DATE)
                AND PO.PURCHASE_DATE BETWEEN $1::date AND $2::date
            GROUP BY
                DS.DATE,
                GRANULARITY

            UNION

            SELECT
                DS.DATE,
                'month' AS GRANULARITY,
                COALESCE(SUM(CASE WHEN PO.PAYMENT_STATUS = 'Paid' THEN PO.AMOUNT_DUE ELSE 0 END),
            0) AS AMOUNT_DUE,
                COALESCE(SUM(CASE WHEN PO.PAYMENT_STATUS = 'Not paid' THEN PO.AMOUNT_DUE ELSE 0 END),
            0) AS PROJECTED_AMOUNT_DUE
            FROM
                MONTHSERIESDATA DS
            LEFT JOIN PURCHASE_ORDERS PO
                ON DS.DATE = DATE_TRUNC('month', PO.PURCHASE_DATE)
                AND PO.PURCHASE_DATE BETWEEN $1::date AND $2::date
            GROUP BY
                DS.DATE,
                GRANULARITY

            UNION

            SELECT
                DS.DATE,
                'year' AS GRANULARITY,
                COALESCE(SUM(CASE WHEN PO.PAYMENT_STATUS = 'Paid' THEN PO.AMOUNT_DUE ELSE 0 END),
            0) AS AMOUNT_DUE,
                COALESCE(SUM(CASE WHEN PO.PAYMENT_STATUS = 'Not paid' THEN PO.AMOUNT_DUE ELSE 0 END),
            0) AS PROJECTED_AMOUNT_DUE
            FROM
                YEARSERIESDATA DS
            LEFT JOIN PURCHASE_ORDERS PO
                ON DS.DATE = DATE_TRUNC('year', PO.PURCHASE_DATE)
                AND PO.PURCHASE_DATE BETWEEN $1::date AND $2::date
            GROUP BY
                DS.DATE,
                GRANULARITY

        ),

        InvoiceOrderSummary AS (
            SELECT
                DS.DATE,
                'day' AS GRANULARITY,
                COALESCE(SUM(CASE WHEN IO.PAYMENT_STATUS = 'Paid' THEN IO.AMOUNT_DUE ELSE 0 END),
            0) AS EARNINGS,
                COALESCE(SUM(CASE WHEN IO.PAYMENT_STATUS = 'Not paid' THEN IO.AMOUNT_DUE ELSE 0 END),
            0) AS PROJECTED_EARNINGS
            FROM
                DAYSERIESDATA DS
            LEFT JOIN INVOICE_ORDERS IO
                ON DS.DATE = DATE_TRUNC('day', IO.INVOICE_DATE)
                AND IO.INVOICE_DATE BETWEEN $1::date AND $2::date
            GROUP BY
                DS.DATE,
                GRANULARITY

            UNION

            SELECT
                DS.DATE,
                'week' AS GRANULARITY,
                COALESCE(SUM(CASE WHEN IO.PAYMENT_STATUS = 'Paid' THEN IO.AMOUNT_DUE ELSE 0 END),
            0) AS EARNINGS,
                COALESCE(SUM(CASE WHEN IO.PAYMENT_STATUS = 'Not paid' THEN IO.AMOUNT_DUE ELSE 0 END),
            0) AS PROJECTED_EARNINGS
            FROM
                WEEKSERIESDATA DS
            LEFT JOIN INVOICE_ORDERS IO
                ON DS.DATE = DATE_TRUNC('week', IO.INVOICE_DATE)
                AND IO.INVOICE_DATE BETWEEN $1::date AND $2::date
            GROUP BY
                DS.DATE,
                GRANULARITY

            UNION

            SELECT
                DS.DATE,
                'year' AS GRANULARITY,
                COALESCE(SUM(CASE WHEN IO.PAYMENT_STATUS = 'Paid' THEN IO.AMOUNT_DUE ELSE 0 END),
            0) AS EARNINGS,
                COALESCE(SUM(CASE WHEN IO.PAYMENT_STATUS = 'Not paid' THEN IO.AMOUNT_DUE ELSE 0 END),
            0) AS PROJECTED_EARNINGS
            FROM
                YEARSERIESDATA DS
            LEFT JOIN INVOICE_ORDERS IO
                ON DS.DATE = DATE_TRUNC('year', IO.INVOICE_DATE)
                AND IO.INVOICE_DATE BETWEEN $1::date AND $2::date
            GROUP BY
                DS.DATE,
                GRANULARITY

            UNION

            SELECT
                DS.DATE,
                'month' AS GRANULARITY,
                COALESCE(SUM(CASE WHEN IO.PAYMENT_STATUS = 'Paid' THEN IO.AMOUNT_DUE ELSE 0 END),
            0) AS EARNINGS,
                COALESCE(SUM(CASE WHEN IO.PAYMENT_STATUS = 'Not paid' THEN IO.AMOUNT_DUE ELSE 0 END),
            0) AS PROJECTED_EARNINGS
            FROM
                MONTHSERIESDATA DS
            LEFT JOIN INVOICE_ORDERS IO
                ON DS.DATE = DATE_TRUNC('month', IO.INVOICE_DATE)
                AND IO.INVOICE_DATE BETWEEN $1::date AND $2::date
            GROUP BY
                DS.DATE,
                GRANULARITY

        )

        SELECT
            COALESCE(p.date, i.date) AS date,
            COALESCE(p.granularity, i.granularity) AS granularity,
            CAST(COALESCE(p.projected_amount_due,
                0) AS FLOAT) AS projected_expenses,
            CAST(COALESCE(p.amount_due,
                0) AS FLOAT) AS expenses,
            CAST(COALESCE(i.projected_earnings,
                0) AS FLOAT) AS projected_income,
            CAST(COALESCE(i.earnings,
                0) AS FLOAT) AS income,
            CAST((COALESCE(i.projected_earnings,
                0) + COALESCE(i.earnings,
                0)) - (COALESCE(p.projected_amount_due,
                0) + COALESCE(p.amount_due,
                0)) AS FLOAT) AS profit,
        CASE
            WHEN COALESCE(p.granularity, i.granularity) = 'day' THEN TO_CHAR(COALESCE(p.date, i.date), 'Mon DD')
            WHEN COALESCE(p.granularity, i.granularity) = 'week' THEN 
                'Week ' || EXTRACT(WEEK FROM COALESCE(p.date, i.date))::TEXT
            WHEN COALESCE(p.granularity, i.granularity) = 'month' THEN TO_CHAR(DATE_TRUNC('month', COALESCE(p.date, i.date)), 'Mon')
            WHEN COALESCE(p.granularity, i.granularity) = 'year' THEN TO_CHAR(DATE_TRUNC('year', COALESCE(p.date, i.date)), 'YYYY')
        END AS name
        FROM (
            SELECT
                date,
                granularity,
                COALESCE(SUM(amount_due),
            0) AS amount_due,
                COALESCE(SUM(projected_amount_due),
            0) AS projected_amount_due
            FROM
                PurchaseOrderSummary
            GROUP BY
                date, granularity
        ) p
        FULL JOIN (
            SELECT
                date,
                granularity,
                COALESCE(SUM(projected_earnings),
            0) AS projected_earnings,
                COALESCE(SUM(earnings),
            0) AS earnings
            FROM
                InvoiceOrderSummary
            GROUP BY
                date, granularity
        ) i
        ON
            p.date = i.date AND p.granularity = i.granularity
        ORDER BY
            date, granularity; 
    `;
        try {
            let profitTotalsByGranularity = await query(profitTotalsByGranularityQuery, [startdate, enddate]);
            res.status(200).json({
                data: profitTotalsByGranularity.rows,
                rangeStartDateOfQuery: startdate,
                rangeEndDateOfQuery: enddate,
                success: true
            });
        } catch (err: any) {
            throw new customError({ message: err.message, code: 30 });
        }

};

interface IGetRequestHeadersOldestIncomeExpenseQuery {
    paddays?: number;
}

//! Note this returns the oldest and newest record dates found padded with 5 days on either side!
export const oldest_income_and_expense_record_dates = async (req: Request, res: Response) => {
    let { paddays = 0 } = req.headers as unknown as IGetRequestHeadersOldestIncomeExpenseQuery;
    // console.log("paddays --> ", paddays);

    const minAndMaxPoIoDates = await query(
        `WITH combined_orders AS (
            SELECT invoice_date AS order_date
            FROM invoice_orders
        
            UNION ALL
        
            SELECT purchase_date AS order_date
            FROM purchase_orders
        )
        SELECT 
            (MIN(order_date) - $1 * INTERVAL '1 day') AS oldest_order_date_pad_x_days,
            (MAX(order_date) + $1 * INTERVAL '1 day') AS latest_order_date_pad_x_days
        FROM combined_orders;`,
        [paddays]
    );

    res.status(200).json({
        oldest_record_date: minAndMaxPoIoDates.rows[0].oldest_order_date_pad_x_days,
        newest_record_date: minAndMaxPoIoDates.rows[0].latest_order_date_pad_x_days
    });
};