import { Express, Request, Response } from "express"
import { query } from "../db"
import initializeDatabaseSchema from "../db/schema";


export const getClicks = async (req: Request, res: Response) => {
    let maxNum;
    const queryMaxNum = "SELECT MAX(nums) as maxval FROM exampletable";
    const result = await query(queryMaxNum)
    maxNum = result?.rows[0].maxval;

    res.json({ maxNum: maxNum });
}

export const seedDB = async (req: Request, res: Response) => {
    try {
        await query('CREATE TABLE IF NOT EXISTS exampletable (nums integer UNIQUE)');
        await query('INSERT INTO exampletable(nums) VALUES($1)', [1]);
        await initializeDatabaseSchema();
        console.log("Your DB has been seeded!");
        res.json({ msg: "Successfully seeded the Database with the test data!" });
    } catch (error) {
        console.log("There was an error seeding the DB! (Most likely a dup key error, because the DB has already been seeded!) see below:");
        console.log(error);
        res.json({ msg: error });
    }
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
