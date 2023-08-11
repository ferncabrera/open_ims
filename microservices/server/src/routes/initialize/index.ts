// initialize our routes so our app.ts file looks nice and clean at all times :)
import express, { Express } from "express";

import open_ims_routes from "../open_ims";
import test_routes from "../test";
import user_routes from "../users";

export const initializeRoutes = (app : Express) => {
    // All routes that need to be passed into Express' middleware put here
    app.use(open_ims_routes);
    app.use(test_routes);
    app.use(user_routes);
}
