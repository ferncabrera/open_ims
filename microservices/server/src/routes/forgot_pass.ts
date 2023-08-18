import express from "express";
import { forgot_pass, update_password } from "../controllers/forgot_pass";
import catchAsync from "../utils/catchAsync";
import errorHandler from "../../middleware/errorHandler";

const router = express.Router();

router
  .route("/api/server/forgot_pass")
  .post(catchAsync(forgot_pass), errorHandler);

router
  .route("/api/server/update_password")
  .post(catchAsync(update_password), errorHandler);
export default router;
