import express from "express";
import catchAsync from "../utils/catchAsync";
import errorHandler from "../middleware/errorHandler";
import { get_customers, 
  get_customer, 
  create_customer, 
  update_customer, 
  delete_customers, 
  delete_customer, 
  get_available_customers, 
  get_all_customers
} from "../controllers/customers";

const router = express.Router();

router
  .route("/api/server/customers")
  .get(catchAsync(get_customers), errorHandler)
  .delete(catchAsync(delete_customers), errorHandler)

router
  .route("/api/server/customer")
  .get(catchAsync(get_customer), errorHandler)
  .post(catchAsync(create_customer), errorHandler)
  .patch(catchAsync(update_customer), errorHandler)
  .delete(catchAsync(delete_customer), errorHandler)

router
  .route("/api/server/available-customers")
  .get(catchAsync(get_available_customers), errorHandler)

router
  .route("/api/server/all-customers")
  .get(catchAsync(get_all_customers), errorHandler)
  
export default router;
