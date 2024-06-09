import { createColumnHelper } from "@tanstack/react-table";
import { StatusPill } from "../../components/graphics/StatusPill";
import _ from "lodash";

const columnHelper = createColumnHelper()

export const Columns = [
    columnHelper.accessor("invoice_date", {
        header: 'Date',
        cell: (props) => {
            const date: Date = _.get(props, 'row.original.invoice_date');
            const formatDate = new Date(date)
            const month = String(formatDate.getMonth() + 1).padStart(2, "0"); // Months are zero-based, so add 1
            const day = String(formatDate.getDate()).padStart(2, "0");
            const year = formatDate.getFullYear();
            return (`${day}/${month}/${year}`)
        }
    }),

    columnHelper.accessor("reference_number", {
        header: 'Order Number'
    }),

    columnHelper.accessor("amount_due", {
        header: 'Amount'
    }),

    columnHelper.accessor("order_status", {
        header: 'Status',
        cell: (props) => {
            const status = _.get(props.row.original, 'order_status');
            let color: 'red' | 'yellow' | 'green' = 'red';

            if (status === 'Confirmed') {
                color = 'green'
            } else if (status === 'Draft') {
                color = 'yellow'
            } else {
                color = 'red'
            }

            return (
                <div className="">
                    <StatusPill
                        text={status}
                        color={color}
                    />
                </div>
            )
        }
    })
]