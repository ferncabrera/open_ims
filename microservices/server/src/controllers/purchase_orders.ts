import { Request, Response } from "express";
import { query, chained_query } from "../db";
import _ from "lodash";

interface IGetListRequestHeaders {
  pageindex: number;
  pagesize: number;
  searchquery: string;
};

export const get_all_purchase_orders = async (req: Request, res: Response) => {

  const { pageindex, pagesize, searchquery } = req.headers as unknown as IGetListRequestHeaders;
  const offset: number = Number(pageindex) * Number(pagesize);

  let purchase_orders_query;
  let count_query;

  const filters = JSON.parse(searchquery);
  const { date, input1, searchQuery } = filters;

  if (_.isEmpty(filters) || Object.values(filters).every(value => !value)) {
    purchase_orders_query = await query("SELECT * FROM purchase_orders ORDER BY purchase_id LIMIT $1 OFFSET $2", [pagesize, offset]);
    count_query = await query("SELECT COUNT(*) FROM purchase_orders");
  } else {

    const filterConditions = [];
    const queryParams = [];

    if (searchQuery) {
      filterConditions.push(
        `(purchase_id::text ILIKE '%' || $${queryParams.length + 1} || '%' OR amount_due::text ILIKE '%' || $${queryParams.length + 1} 
        || '%' OR delivery_status::text = $${queryParams.length + 1})`
      );
      queryParams.push(searchQuery);
    }

    if (date) {
      filterConditions.push(`DATE(purchase_date) = $${queryParams.length + 1}`);
      queryParams.push(date);
    }
    if (input1) { // customer search
      const vendor_id_query = await query("SELECT id FROM vendor_table WHERE company_name ILIKE '%' || $1 || '%'", [input1]);
      const vendor_id = vendor_id_query.rows[0].id;
      if (vendor_id) {
        filterConditions.push(`vendor_id = $${queryParams.length + 1}`);
        queryParams.push(vendor_id);
      }
    }

    const whereClause = filterConditions.length > 0 ? `WHERE ${filterConditions.join(' AND ')}` : '';
    purchase_orders_query = await query(` SELECT * FROM purchase_orders ${whereClause} LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2} `
      , queryParams.concat([pagesize, offset]));
    
    count_query = await query(` SELECT COUNT(*) AS count FROM purchase_orders ${whereClause}`, queryParams);


  }

  const totalCount: any = count_query.rows[0] ? count_query.rows[0].count : null;

  const purchases = purchase_orders_query.rows

  for (let i = 0; i < purchase_orders_query.rows.length; i++) {
    const vendor_id = purchases[i].vendor_id;
    const vendor_name = await query(`SELECT company_name FROM vendor_table WHERE id = $1`, [vendor_id]);

    purchases[i].vendor_name = vendor_name.rows[0].company_name;
  }

  res.status(200).json({
    pageindex,
    pagesize,
    offset,
    searchquery,
    total: totalCount,
    purchases
  });
}