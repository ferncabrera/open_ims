import { createColumnHelper } from "@tanstack/react-table";
import { StatusPill } from "../../components/graphics/StatusPill";
import { convertDateISO } from "../../utilities/helpers/functions";
import _ from "lodash";

const columnHelper = createColumnHelper();




export const Columns = [

    columnHelper.accessor("purchase_date", {
        header: 'Date',
        cell: (props) => {
            const date = _.get(props.row.original, 'purchase_date');
            return (
                <div>
                    {convertDateISO(date, 1)}
                </div>
            )
        }
    },),

    columnHelper.accessor("purchase_id", {
        header: 'Order Number',
    },),

    columnHelper.accessor("amount_due", {
        header: 'Amount',
    },),

    columnHelper.accessor("delivery_status", {
        header: 'Status',
        cell: (props) => {
            const status = _.get(props.row.original, 'delivery_status');
            let color: 'red' | 'yellow' | 'green' = 'red';

            if (status === 'Received') {
                color = 'green'
            } else {
                color = 'red'
            }

            return (
                <div className="">
                    <StatusPill
                        text={status ? status : "error getting status"}
                        color={color}
                    />
                </div>
            )

        }
    },),

]