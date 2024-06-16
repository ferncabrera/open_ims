import express from "express";
import catchAsync from "../utils/catchAsync";
import errorHandler from "../middleware/errorHandler";
import { get_products, get_unique_products } from "../controllers/products";

const router = express.Router();

router
    .route("/api/server/products")
    .get(catchAsync(get_products), errorHandler)

router
    .route("/api/server/unique-products")
    .get(catchAsync(get_unique_products), errorHandler)

export default router;