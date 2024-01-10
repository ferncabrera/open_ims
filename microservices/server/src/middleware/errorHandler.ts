import { Request, Response, NextFunction } from "express";

const errorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {
    let statusCode;
    let errorMessage;

    switch (error.code) {
        case 10: // case 10 represents custom with 401
            statusCode = 401;
            errorMessage = error.message;
            break;

        case 20:
            statusCode = 400;
            errorMessage = error.message;

        default:
            console.log(error);
            statusCode = 500;
            errorMessage = "Something went wrong on the server.";
            break;
    }

    res.status(statusCode).json({ message: errorMessage });
};

export default errorHandler;