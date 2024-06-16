import { Request, Response } from "express";
import { query } from "../db";

export const get_products = async (req: Request, res: Response) => {

    const products_query = await query("SELECT * FROM products_table");
    const data = products_query.rows


    res.status(200).json({message: "retrieved products", data });
};


export const get_unique_products = async (req: Request, res: Response) =>  {
    
    const unique_products_query = await query("SELECT * FROM unique_products_table");
    const data = unique_products_query.rows;
    
    res.status(200).json({message: "Retrived unique products", data});
};