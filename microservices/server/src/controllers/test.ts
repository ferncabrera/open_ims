import { Express, Request, Response } from "express"
import { query } from "../db"

export const getClicks = async (req: Request, res: Response) => {
    let maxNum;
    const queryMaxNum = "SELECT MAX(nums) as maxval FROM exampletable";
    const result = await query(queryMaxNum)
    maxNum = result?.rows[0].maxval;

    res.json({ maxNum: maxNum });
}

let maxNum;
export const addClick = async (req: Request, res: Response) => {
    console.log("Add Click Request recieved in server!");

    const queryMaxNum = "SELECT MAX(nums) as maxval FROM exampletable";
    const qRes = await query(queryMaxNum);
    maxNum = qRes?.rows[0].maxval;
    await query('INSERT INTO exampletable(nums) VALUES($1)', [maxNum + 1]);

    res.json({ success: true });
}
