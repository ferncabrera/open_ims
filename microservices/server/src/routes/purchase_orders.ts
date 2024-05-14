import express from "express";
import catchAsync from "../utils/catchAsync";
import errorHandler from "../middleware/errorHandler";
import { get_all_purchase_orders } from "../controllers/purchase_orders";

const router = express.Router();

router.route('/api/server/purchase-orders')
  .get(catchAsync(get_all_purchase_orders), errorHandler)

export default router;