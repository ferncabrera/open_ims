import { Express, Request, Response } from "express"
import { query } from "../db/queries"
import { clientCheck } from "../db/helpers";

// Any complex business logic, please make a function that handles this. We don't want to overbloat our controllers.
// This can include external api calls, complex queries, and data manipulation.


export const getClicks = async (req: Request, res: Response) => {
    let maxNum;
    const queryMaxNum = "SELECT MAX(nums) as maxval FROM exampletable";
    const result = await query(queryMaxNum)
    maxNum = result?.rows[0].maxval;

    res.json({ maxNum: maxNum });
}

export const addClick = async (req: Request, res: Response) => {
    let maxNum;
    console.log("Add Click Request recieved in server!");

    const queryMaxNum = "SELECT MAX(nums) as maxval FROM exampletable";
    const qRes = await query(queryMaxNum);
    maxNum = qRes?.rows[0].maxval;
    await query('INSERT INTO exampletable(nums) VALUES($1)', [maxNum + 1]);

    res.json({ success: true });
}

export const checkPoolClient = (req: Request, res: Response) => {
    try {
        console.log("Printing the amount of idle clients below (Pool of 10 total):");
        console.log("--------------");
        console.log(clientCheck());
        console.log("--------------");
        res.json({ success: true });
    } catch (error) {
        console.log(`Error trying to fetch clientCheck from DB!`);
        res.json({ success: false });
    }
}