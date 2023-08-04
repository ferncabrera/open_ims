import { pool } from "..";

export const query = async (text: string, params?: (any)[]) => {
    try {
        const start = Date.now()
        const res = await pool.query(text, params)
        const duration = Date.now() - start
        console.log('Query details below:\n', { text, execTimeInMS: duration, rowsInQuery: res.rowCount })
        return res;
    } catch (err) {
        console.log("Oh no - There was an error executing your query, please see below:");
        console.log({ text, err });
    }
};