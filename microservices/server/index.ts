import express, { Express, Request, Response } from "express";
import cors from 'cors';
// import bodyParser from "body-parser";
// import dotenv from 'dotenv';
import morgan from 'morgan';
import { Client, Pool } from "pg";
const PORT = process.env.PORT || 3000
// dotenv.config();

const app: Express = express();

app.use(cors());
app.use(express.json());
app.use(morgan('common'));

const client: Client = new Client();
const pool: Pool = new Pool();

const openDBConn = async (): Promise<void> => {
    try {
        console.log(await pool.query('SELECT NOW()'))
        // await client.connect();
        // client.on('error', (err) => {
        //     console.error('something bad has happened!', err.stack)
        //   }) 
        // await client.query("CREATE TABLE IF NOT EXISTS values (number INT)")        
    } catch (error) {
        console.log(`Failed to connect to postgres db ${"postgres"}`);
        console.log(`error -> ${error}`)
    }
}

app.get('/api/server/testmsg', async (req: Request, res: Response) => {
    try {
        // const queryMaxNum = "SELECT MAX(number) as maxVal FROM values";
        // const qRes = await client.query(queryMaxNum);
        // const maxNum = qRes.rows[0].maxVal;
        // console.log("QueryRes fetched --> ", qRes);
        // console.log("maxNum fetched --> ", maxNum);
    } catch (error) {
        console.log("Err fetching maxNum from db");
    }
    res.json({ data: `Hello! This information came from the back-end! Don't believe me? Search the source folder and I guarantee you won't be able to find this message in there!!!!!` });
});

app.get('*', (req: Request, res: Response) => {
    console.log('we hit an error!')
    res.sendStatus(404);
});

app.listen(3000, () => { console.log('[server compiled]: Running on port ', PORT, ` at http://localhost:${PORT}/`) });
openDBConn();