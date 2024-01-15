import { Request, Response, NextFunction } from "express";

const errorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {
    let statusCode;
    let errorMessage;
    let additionalErrorDetails: (string | false) = false;

    switch (error.code) {
        case 10: // case 10 represents custom with 401
            statusCode = 401;
            errorMessage = error.message;
            break;

        case 20:
            //? General error if you just want to pipe the main error as the message. Useful if you wrote the API and sent the message yourself already custom!
            statusCode = 400;
            errorMessage = error.message;
            break;
        case 30:
            //? If something went wrong with a database query, send 30 and well pipe the additional details through
            statusCode = 400;
            errorMessage = "Uh oh... we couldn't fetch your data. Please try again later.",
            additionalErrorDetails = error.message
            break;
        default:
            statusCode = 500;
            errorMessage = "Something went wrong on the server.";
            break;
    }

    res.status(statusCode).json({ message: errorMessage, additionalErrorDetails });
};

export default errorHandler;