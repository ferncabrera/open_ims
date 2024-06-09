import express from "express";
import catchAsync from "../utils/catchAsync";
import errorHandler from "../middleware/errorHandler";
import {
    get_all_vendors,
    get_vendors,
    get_available_vendors,
    get_vendor,
    create_vendor,
    update_vendor,
    delete_vendor,
    delete_multiple_vendors
} from "../controllers/vendors";

const router = express.Router();

router.route('/api/server/vendors')
    .get(catchAsync(get_vendors), errorHandler)
    .delete(catchAsync(delete_multiple_vendors), errorHandler)

router.route('/api/server/available-vendors')
    .get(catchAsync(get_available_vendors), errorHandler)

router.route('/api/server/vendor')
    .get(catchAsync(get_vendor), errorHandler)
    .post(catchAsync(create_vendor), errorHandler)
    .patch(catchAsync(update_vendor), errorHandler)
    .delete(catchAsync(delete_vendor), errorHandler)

export default router;