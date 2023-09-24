import { Request, Response, NextFunction } from "express";

const errorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {

    console.log('our error', error);
    // Handle specific error types and send relevant responses
    if (error.code === 10) {
        return res.status(401).json({message: error.message})
    }

    if (error.code === "23505") {
        return res.status(400).json({ message: "Email is already in use." });
    }

    // Handle other errors
    console.log(error);
    res.status(500).json({ message: "Something went wrong on the server." });
};

export default errorHandler;