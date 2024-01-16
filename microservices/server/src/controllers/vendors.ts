import { Request, Response } from "express";
import { query } from "../db";

export const get_all_vendors = async(req: Request, res: Response) => {
    const vendors_list_query = await query("SELECT * FROM vendor_table");
    const vendors_list = vendors_list_query.rows;

    res.status(200).json({message:"Successfully retrieved all vendors", data: vendors_list});
};

export const get_available_vendors = async(req: Request, res: Response) => {
    const vendors_list_query = await query("SELECT * FROM vendor_table");
    const unavailable_list_query = await query("SELECT * FROM vendor_and_customer");

    const vendors = vendors_list_query.rows;
    const unavailable = unavailable_list_query.rows;

    const available = vendors.filter((object) => {
        return !unavailable.some((unavailable_object) => unavailable_object.vendor_id === object.id);
    });

    res.status(200).json({message: "Successfully retrieved all available vendors", data: available})
}