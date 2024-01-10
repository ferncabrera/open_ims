import express from "express";
import catchAsync from "../utils/catchAsync";
import errorHandler from "../middleware/errorHandler";
import { income_and_expense_by_date } from "../controllers/charts";

const router = express.Router();

router
  .route("/api/server/income_and_expense_by_date")
  .post(catchAsync(income_and_expense_by_date), errorHandler);
  
export default router;
