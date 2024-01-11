import express from "express";
import catchAsync from "../utils/catchAsync";
import errorHandler from "../../middleware/errorHandler";
import { income_and_expense_by_date, oldest_income_and_expense_record_dates } from "../controllers/charts";

const router = express.Router();

router
  .route("/api/server/income_and_expense_by_date")
  .get(catchAsync(income_and_expense_by_date), errorHandler);

router
  .route("/api/server/oldest_income_and_expense_record_dates")
  .get(catchAsync(oldest_income_and_expense_record_dates), errorHandler);
  
export default router;
