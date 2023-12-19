import { createColumnHelper } from "@tanstack/react-table";

const columnHelper = createColumnHelper();

export const Columns = [
    columnHelper.accessor("company_name",{
        header: 'Company Name',
    }, ),

    columnHelper.accessor("contact_name",{
        header: 'Contact Name',
    }, ),
    
    columnHelper.accessor("email",{
        header: 'Email',
    }, ),

    columnHelper.accessor("phone",{
        header: 'Phone',
    }, ),

    columnHelper.accessor("customer_id",{
        header: 'Customer Id',
    }, ),
]