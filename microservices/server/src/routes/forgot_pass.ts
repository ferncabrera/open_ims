import express from "express";
import { forgot_pass, update_password, check_password, validate_reset_token } from "../controllers/forgot_pass";
import catchAsync from "../utils/catchAsync";
import errorHandler from "../../middleware/errorHandler";

const router = express.Router();

router
  .route("/api/server/forgot_pass")
  .post(catchAsync(forgot_pass), errorHandler);

router
  .route("/api/server/update_password")
  .patch(catchAsync(update_password), errorHandler);

router
  .route("/api/server/check_password")
  .post(catchAsync(check_password), errorHandler);

router
  .route("/api/server/validate_token")
  .post(catchAsync(validate_reset_token), errorHandler);
  
export default router;
