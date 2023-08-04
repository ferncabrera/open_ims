// initialize our routes so our app.ts file looks nice and clean at all times :)
import express, { Express } from "express";
import open_ims_route from "../open_ims";

export const initializeRoutes = (app : Express) => {
    // All routes that need to be passed into Express' middleware put here
    app.use(open_ims_route);
}
