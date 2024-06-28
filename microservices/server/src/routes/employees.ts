import express from "express";
import catchAsync from "../utils/catchAsync";
import errorHandler from "../middleware/errorHandler";
import { get_employees, get_all_employees } from "../controllers/employees";

const router = express.Router();

router.route("/api/server/employees")
  .get(catchAsync(get_employees), errorHandler);

router.route("/api/server/get-all-employees")
  .get(catchAsync(get_all_employees), errorHandler);

export default router;