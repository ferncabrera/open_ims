import express from "express";
import catchAsync from "../utils/catchAsync";
import errorHandler from "../middleware/errorHandler";
import { get_invoice } from "../controllers/invoices";

const router = express.Router();

router
    .route("/api/server/invoice")
    .get(catchAsync(get_invoice), errorHandler)

export default router;