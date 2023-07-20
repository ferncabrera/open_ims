import express, { Express, Request, Response } from "express";
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();

app.use(cors());

// Will have to figure out how we will work with env variables in deployment.
const PORT = process.env.PORT || 3000;

app.get('/', (req: Request, res: Response) => {
  res.json({ data: `Hello! This information came from the back-end! Don't believe me? Search the source folder and I guarantee you won't be able to find this message in there` });
});

app.get('*', (req: Request, res: Response) => {
  console.log('we hit an error!')
  res.sendStatus(404);
});

app.listen(PORT, () => { console.log('[server compiled]: Running on port ', PORT, ` at http://localhost:${PORT}/`) });