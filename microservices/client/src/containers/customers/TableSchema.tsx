import { createColumnHelper } from "@tanstack/react-table";
import _ from "lodash";

const columnHelper = createColumnHelper();

export const Columns = [
    columnHelper.accessor("company_name",{
        header: 'Company Name',
    }, ),

    columnHelper.accessor("contact_name",{
        header: 'Contact Name',
        cell: (props) => {
            const firstName: string = _.get(props.row.original, 'first_name', null);
            const lastName: string = _.get(props.row.original, 'last_name', null);

            return `${firstName} ${lastName}`
        }
    }, ),
    
    columnHelper.accessor("email",{
        header: 'Email',
    }, ),

    columnHelper.accessor("phone",{
        header: 'Phone',
    }, ),

    columnHelper.accessor("id",{
        header: 'Customer Id',
    }, ),
]