import express, { Express, Request, Response } from "express";
import cors from 'cors';
import morgan from 'morgan';
import { Client, Pool } from "pg";

const app: Express = express();

app.use(cors());
app.use(express.json());
app.use(morgan('common'));

const client: Client = new Client();
const pool: Pool = new Pool();

const openDBConn = async (): Promise<void> => {
    try {
        console.log(`Connecting to ${process.env.PGDATABASE}`);
        await pool.query('CREATE TABLE IF NOT EXISTS Values (number integer)');

        console.log('Successfully completed all requests!');
    } catch (error) {
        console.log(`Error executing postgres commands -> ${error}`)
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

app.listen(process.env.SERVER_PORT, () => { console.log('[server compiled]: Running on port ', process.env.SERVER_PORT, ` (http://localhost:${process.env.SERVER_PORT}/)`) });

openDBConn().then((): void => console.log("Finished executing DB commands!"));