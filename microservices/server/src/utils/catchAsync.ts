import { Request, Response, NextFunction } from "express"

interface IAsyncFunction {
    (req: Request, res: Response, next: NextFunction): Promise<void>;
}

const catchAsync = (func: IAsyncFunction ) => {
    return (req: Request, res: Response, next: NextFunction) => {
        func(req, res, next).catch(next);
    }
}

export default catchAsync