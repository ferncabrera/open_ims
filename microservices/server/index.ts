import express, { Express, Request, Response } from "express";
import cors from 'cors';
import morgan from 'morgan';
import { Client, Pool } from "pg";

const app: Express = express();

app.use(cors());
app.use(express.json());
app.use(morgan('common'));

// const client: Client = new Client();
const pool: Pool = new Pool();

const dbInit = async (): Promise<void> => {
    try {
        console.log(`Connecting to ${process.env.PGDATABASE}!`);
        await pool.query('CREATE TABLE IF NOT EXISTS exampletable (nums integer UNIQUE)');
        const exampleQuery = {
            text: 'INSERT INTO exampletable(nums) VALUES($1)',
            values: [1],
        }
        await pool.query(exampleQuery);
        console.log('Successfully seeded DB!');
    } catch (error) {
        console.log(`Error executing postgres commands -> ${error}`)
    }
}

dbInit().then((): void => console.log("Done executing db init function!"));

app.get('/api/server/getClickedNum', async (req: Request, res: Response) => {
    let maxNum;
    try {
        const queryMaxNum = "SELECT MAX(nums) as maxval FROM exampletable";
        const qRes = await pool.query(queryMaxNum);
        maxNum = qRes.rows[0].maxval;
    } catch (error) {
        console.log(`Error trying to fetch maxNum from DB!`);
    }
    res.json({ maxNum: maxNum });
});

app.get('/api/server/addClick', async (req: Request, res: Response) => {
    let maxNum;
    try {
        console.log("Add Click Request recieved in server!");

        const queryMaxNum = "SELECT MAX(nums) as maxval FROM exampletable";
        const qRes = await pool.query(queryMaxNum);
        maxNum = qRes.rows[0].maxval;
        const exampleQuery = {
            text: 'INSERT INTO exampletable(nums) VALUES($1)',
            // ? SQL Injection vunerabiltiy ? 
            values: [maxNum + 1],
        }
        await pool.query(exampleQuery);

    } catch (error) {
        console.log(`Error trying to fetch maxNum from DB!`);
    }
    res.json({ done: true });
});

app.get('*', (req: Request, res: Response) => {
    console.log('we hit an error!')
    res.sendStatus(404);
});

app.listen(process.env.SERVER_PORT, () => { console.log('[server compiled]: Running on port ', process.env.SERVER_PORT, ` (http://localhost:${process.env.SERVER_PORT}/)`) });
