import express from "express";
import { login, register  } from "../controllers/users";
import catchAsync from "../utils/catchAsync";
import errorHandler from "../middleware/errorHandler";

const router = express.Router();

router.route('/api/server/login')
    .post(catchAsync(login), errorHandler)

router.route('/api/server/register')
    .post(catchAsync(register), errorHandler)
export default router;