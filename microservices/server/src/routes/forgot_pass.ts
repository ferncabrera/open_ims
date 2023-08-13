import express from "express";
import { forgot_pass } from "../controllers/forgot_pass";
import catchAsync from "../utils/catchAsync";
import errorHandler from "../../middleware/errorHandler";

const router = express.Router();

router
  .route("/api/server/forgot_pass")
  .post(catchAsync(forgot_pass), errorHandler);
export default router;
