// regular controllers based on what we want to do. Will heavily rely off imports and logic.
import { Express, Request, Response } from "express"

export const healthCheck = async(req : Request, res : Response) => {
    try {
        res.send('Health Check Successful')
    } catch (e) {
        console.log('oh no! an error!');
        console.log(e);
    }
}