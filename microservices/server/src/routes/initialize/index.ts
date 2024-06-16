// initialize our routes so our app.ts file looks nice and clean at all times :)
import express, { Express } from "express";

import open_ims_routes from "../open_ims";
import forgot_pass_routes from "../forgot_pass";
import user_routes from "../users";
import customer_routes from "../customers";
import chart_routes from "../charts"
import vendor_routes from "../vendors";
import invoice_routes from "../invoices";
import purchase_order_routes from "../purchase_orders";
import employee_routes from "../employees";
import product_routes from "../products";

export const initializeRoutes = (app: Express) => {
  // All routes that need to be passed into Express' middleware put here
  app.use(open_ims_routes);
  app.use(forgot_pass_routes);
  app.use(user_routes);
  app.use(customer_routes);
  app.use(chart_routes);
  app.use(vendor_routes);
  app.use(invoice_routes);
  app.use(purchase_order_routes);
  app.use(employee_routes);
  app.use(product_routes);
};
