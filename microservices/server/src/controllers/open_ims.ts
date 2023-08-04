// regular controllers based on what we want to do. Will heavily rely off imports and logic.
import { Express, Request, Response } from "express"

export const healthCheck = (req : Request, res : Response) => {
        res.send('Health Check Successful')
}