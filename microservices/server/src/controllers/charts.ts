import { Request, Response } from "express";
import { query } from "../db";
import customError from "../utils/customError";
import { DateRange } from "../utils/types";
import { start } from "repl";

interface IGetRequestHeaders {
    startdate: string;
    enddate: string;
}

export const income_and_expense_by_date = async (req: Request, res: Response) => {
    const { startdate, enddate } = req.headers as unknown as IGetRequestHeaders;

    if (!startdate || !enddate)
        throw new Error("A startdate and enddate (strings) are required for this API function! Ex: {startdate: '2023-12-09' enddate: '2024-01-09'}");

// TODO: Really need to write some unit tests to verify the data we are getting back from this query/API is right.... lol

const profitTotalsByGranularity = await query(`
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
            ds.date,
            'day' AS granularity,
            COALESCE(SUM(po.amount_due), 0) AS total_amount_due
        FROM
            DaySeriesData ds
        LEFT JOIN purchase_orders po ON ds.date = DATE_TRUNC('day', po.purchase_date)
        AND
            po.purchase_date BETWEEN $1::date AND $2::date
        GROUP BY
            ds.date, granularity

        UNION
        SELECT
            ds.date,
            'week' AS granularity,
            COALESCE(SUM(po.amount_due), 0) AS total_amount_due
        FROM
            WeekSeriesData ds
        LEFT JOIN purchase_orders po ON ds.date = DATE_TRUNC('week', po.purchase_date)
        AND
            po.purchase_date BETWEEN $1::date AND $2::date
        GROUP BY
            ds.date, granularity

        UNION
        SELECT
            ds.date,
            'month' AS granularity,
            COALESCE(SUM(po.amount_due), 0) AS total_amount_due
        FROM
            MonthSeriesData ds
        LEFT JOIN purchase_orders po ON ds.date = DATE_TRUNC('month', po.purchase_date)
        AND
            po.purchase_date BETWEEN $1::date AND $2::date
        GROUP BY
            ds.date, granularity

        UNION

        SELECT
            ds.date,
            'year' AS granularity,
            COALESCE(SUM(po.amount_due), 0) AS total_amount_due
        FROM
            YearSeriesData ds
        LEFT JOIN purchase_orders po ON ds.date = DATE_TRUNC('year', po.purchase_date)
        AND
            po.purchase_date BETWEEN $1::date AND $2::date
        GROUP BY
            ds.date, granularity


    ),

    InvoiceOrderSummary AS (
        SELECT
            ds.date,
            'day' AS granularity,
            COALESCE(SUM(io.amount_due), 0) AS total_amount_due
        FROM
            DaySeriesData ds
        LEFT JOIN invoice_orders io ON ds.date = DATE_TRUNC('day', io.invoice_date)
        AND
            io.invoice_date BETWEEN $1::date AND $2::date
        GROUP BY
        ds.date, granularity

        UNION

        SELECT
            ds.date,
            'week' AS granularity,
            COALESCE(SUM(io.amount_due), 0) AS total_amount_due
        FROM
            WeekSeriesData ds
        LEFT JOIN invoice_orders io ON ds.date = DATE_TRUNC('week', io.invoice_date)
        AND
            io.invoice_date BETWEEN $1::date AND $2::date
        GROUP BY
        ds.date, granularity

        UNION

        SELECT
            ds.date,
            'month' AS granularity,
            COALESCE(SUM(io.amount_due), 0) AS total_amount_due
        FROM
            MonthSeriesData ds
        LEFT JOIN invoice_orders io ON ds.date = DATE_TRUNC('month', io.invoice_date)
        AND
            io.invoice_date BETWEEN $1::date AND $2::date
        GROUP BY
        ds.date, granularity

        UNION

        SELECT
            ds.date,
            'year' AS granularity,
            COALESCE(SUM(io.amount_due), 0) AS total_amount_due
        FROM
            YearSeriesData ds
        LEFT JOIN invoice_orders io ON ds.date = DATE_TRUNC('year', io.invoice_date)
        AND
            io.invoice_date BETWEEN $1::date AND $2::date
        GROUP BY
        ds.date, granularity

    )

    SELECT
        COALESCE(p.date, i.date) AS date,
        COALESCE(p.granularity, i.granularity) AS granularity,
        CAST(COALESCE(p.total_amount_due, 0) AS INTEGER) AS expenses,
        CAST(COALESCE(i.total_amount_due, 0) AS INTEGER) AS income,
        CAST(COALESCE(i.total_amount_due, 0) - COALESCE(p.total_amount_due, 0) AS INTEGER) AS profit,
        CASE
            WHEN COALESCE(p.granularity, i.granularity) = 'day' THEN TO_CHAR(COALESCE(p.date, i.date), 'Mon DD YY')
            WHEN COALESCE(p.granularity, i.granularity) = 'week' THEN 
                TO_CHAR(DATE_TRUNC('week', COALESCE(p.date, i.date)) - interval '1 day', 'DD Mon YY') ||
                ' - ' ||
                TO_CHAR(DATE_TRUNC('week', COALESCE(p.date, i.date)) + interval '6 days', 'DD Mon YY')
            WHEN COALESCE(p.granularity, i.granularity) = 'month' THEN TO_CHAR(DATE_TRUNC('month', COALESCE(p.date, i.date)), 'Mon YY')
            WHEN COALESCE(p.granularity, i.granularity) = 'year' THEN TO_CHAR(DATE_TRUNC('year', COALESCE(p.date, i.date)), 'YYYY')
        END AS name
    FROM (
        SELECT
            date,
            granularity,
            COALESCE(SUM(total_amount_due), 0) AS total_amount_due
        FROM
            PurchaseOrderSummary
        GROUP BY
            date, granularity
    ) p
    FULL JOIN (
        SELECT
            date,
            granularity,
            COALESCE(SUM(total_amount_due), 0) AS total_amount_due
        FROM
            InvoiceOrderSummary
        GROUP BY
            date, granularity
    ) i
    ON
        p.date = i.date AND p.granularity = i.granularity
    ORDER BY
        date, granularity; 
`, [startdate, enddate]);

    res.status(200).json({
        data: profitTotalsByGranularity.rows
    });
};