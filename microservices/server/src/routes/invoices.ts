import express from "express";
import catchAsync from "../utils/catchAsync";
import errorHandler from "../middleware/errorHandler";
import { get_invoice, get_all_invoices } from "../controllers/invoices";

const router = express.Router();

router
  .route("/api/server/invoice")
  .get(catchAsync(get_invoice), errorHandler)

router
  .route("/api/server/invoices")
  .get(catchAsync(get_all_invoices), errorHandler)


export default router;