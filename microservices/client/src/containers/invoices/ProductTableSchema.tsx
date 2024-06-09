import { createColumnHelper } from "@tanstack/react-table"
import { FaRegTrashAlt } from "react-icons/fa";
import _ from "lodash";


const columnHelper = createColumnHelper();

export const EditColumns = [
    columnHelper.accessor("product_code", {
        header: 'Product Code'
    }),

    columnHelper.accessor("item_name", {
        header: 'Item Name'
    }),

    columnHelper.accessor("quantity", {
        header: 'Quantity'
    }),

    columnHelper.accessor("rate", {
        header: 'Rate'
    }),

    columnHelper.accessor("amount", {
        header: 'Amount'
    }),

    columnHelper.accessor("delete", {
        header: '',
        cell: (props) => {
            const id: string | number = _.get(props.row.original, 'item_id', '' );
            return (
                <FaRegTrashAlt/>
            )
        }
    })
];

export const ReadColumns = [
    columnHelper.accessor("product_code", {
        header: 'Product Code'
    }),

    columnHelper.accessor("item_name", {
        header: 'Item Name'
    }),

    columnHelper.accessor("quantity", {
        header: 'Quantity'
    }),

    columnHelper.accessor("rate", {
        header: 'Rate'
    }),

    columnHelper.accessor("amount", {
        header: 'Amount'
    }),
];