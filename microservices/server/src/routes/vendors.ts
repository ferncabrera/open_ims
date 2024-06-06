import express from "express";
import catchAsync from "../utils/catchAsync";
import errorHandler from "../middleware/errorHandler";
import { get_all_vendors, get_vendors, get_available_vendors , get_vendor} from "../controllers/vendors";

const router = express.Router();

router.route('/api/server/vendors')
    .get(catchAsync(get_vendors), errorHandler);

router.route('/api/server/available-vendors')
    .get(catchAsync(get_available_vendors), errorHandler)

router.route('/api/server/vendor')
    .get(catchAsync(get_vendor), errorHandler);

export default router;