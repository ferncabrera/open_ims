import express from "express";
import { login, register, isAuthenticated, get_all_users } from "../controllers/users";
import catchAsync from "../utils/catchAsync";
import errorHandler from "../middleware/errorHandler";
import { update_password } from "../controllers/forgot_pass";

const router = express.Router();

router.route("/api/server/login").post(catchAsync(login), errorHandler);

router.route("/api/server/register").post(catchAsync(register), errorHandler);

router
  .route("/api/server/forgot_pass")
  .post(catchAsync(register), errorHandler);

router
  .route("/api/server/update_password")
  .patch(catchAsync(update_password), errorHandler);

router.route("/api/server/is-authenticated")
  .get(catchAsync(isAuthenticated), errorHandler);

router.route("/api/server/users")
  .get(catchAsync(get_all_users), errorHandler);

export default router;