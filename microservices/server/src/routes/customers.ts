import express from "express";
import catchAsync from "../utils/catchAsync";
import errorHandler from "../middleware/errorHandler";
import { get_customers } from "../controllers/customers";

const router = express.Router();

router
  .route("/api/server/customers")
  .get(catchAsync(get_customers), errorHandler)
  
export default router;
