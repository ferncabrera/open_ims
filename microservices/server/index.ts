import express, { Express, Request, Response } from "express";
import cors from 'cors';
import morgan from 'morgan';
import { initializeRoutes } from "./src/routes/initialize";
import { seed } from "./src/db/index";

const app: Express = express();

app.use(cors());
app.use(express.json());
app.use(morgan('common'));

initializeRoutes(app);

app.get('*', (req: Request, res: Response) => {
    console.log('we hit an error!')
    res.sendStatus(404);
});

app.listen(process.env.SERVER_PORT, () => { console.log('[server compiled]: Running on port ', process.env.SERVER_PORT, ` (http://localhost:${process.env.SERVER_PORT}/)`) });

seed();