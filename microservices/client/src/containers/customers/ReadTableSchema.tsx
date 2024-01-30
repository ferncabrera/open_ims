import { createColumnHelper } from "@tanstack/react-table";
import _ from "lodash";

const columnHelper = createColumnHelper()

export const Columns = [
    columnHelper.accessor("invoice_date", {
        header: 'Date',
        cell: (props) => {
            const date: Date = _.get(props, 'row.original.invoice_date');
            const formatDate = new Date(date)
            const month = formatDate.getMonth();
            const day = formatDate.getDay();
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
        header: 'Status'
    })
]