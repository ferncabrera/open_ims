import express from "express";
import catchAsync from "../utils/catchAsync";
import errorHandler from "../middleware/errorHandler";
import { get_employees } from "../controllers/employees";

const router = express.Router();

router.route("/api/server/employees")
  .get(catchAsync(get_employees), errorHandler);

export default router;