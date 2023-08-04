import express, { Express, Request, Response } from "express";
import cors from 'cors';
import morgan from 'morgan';
import * as db from './db/index'
db.seed();

const app: Express = express();

app.use(cors());
app.use(express.json());
app.use(morgan('common'));


app.get('/api/server/getClickedNum', async (req: Request, res: Response) => {
    let maxNum;
    try {

        const queryMaxNum: string = "SELECT MAX(nums) as maxval FROM exampletable";
        const result = await db.query(queryMaxNum)
        maxNum = result?.rows[0].maxval;

        res.json({ maxNum: maxNum });
    } catch (error) {
        console.log(`Error trying to fetch maxNum from DB!`);
        res.json({ success: false });
    }
});

app.get('/api/server/addClick', async (req: Request, res: Response) => {
    let maxNum;
    try {
        console.log("Add Click Request recieved in server!");

        const queryMaxNum = "SELECT MAX(nums) as maxval FROM exampletable";
        const qRes = await db.query(queryMaxNum);
        maxNum = qRes?.rows[0].maxval;
        await db.query('INSERT INTO exampletable(nums) VALUES($1)', [maxNum + 1]);

        res.json({ success: true });
    } catch (error) {
        console.log(`Error trying to fetch maxNum from DB!`);
        res.json({ success: false });
    }
});

app.get('/api/server/poolclientcheck', (req: Request, res: Response) => {
    try {
        console.log("Printing the amount of idle clients below (Pool of 10 total):");
        console.log("--------------");
        console.log(db.clientCheck());
        console.log("--------------");
        res.json({ success: true });
    } catch (error) {
        console.log(`Error trying to fetch clientCheck from DB!`);
        res.json({ success: false });
    }
});

app.get('*', (req: Request, res: Response) => {
    console.log('we hit an error!')
    res.sendStatus(404);
});

app.listen(process.env.SERVER_PORT, () => { console.log('[server compiled]: Running on port ', process.env.SERVER_PORT, ` (http://localhost:${process.env.SERVER_PORT}/)`) });

