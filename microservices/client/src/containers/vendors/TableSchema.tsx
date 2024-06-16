import { createColumnHelper } from "@tanstack/react-table";
import { Form } from "react-bootstrap";
import { GoPencil } from "react-icons/go";
import { TableLink } from "../../components/table/TableLink";
import _ from "lodash";

const columnHelper = createColumnHelper();




export const Columns = [
    columnHelper.accessor("select", {
        header: '',
        cell: ({ row }) => (
            <div className="px-1">
                <Form.Check
                    {...{
                        checked: row.getIsSelected(),
                        disabled: !row.getCanSelect(),
                        //   indeterminate: row.getIsSomeSelected(),
                        onChange: row.getToggleSelectedHandler(),
                    }}
                />
            </div>
        ),
    },),

    columnHelper.accessor("company_name", {
        header: 'Company Name',
        cell: (props) => {

            const companyName: string | null = _.get(props.row.original, 'company_name', null);
            const id: string = _.get(props.row.original, 'id', '');
            return (
                <div className="d-flex">
                    <TableLink
                        redirectTo={`/ccg/vendors/read/${id}`}
                        action="read"
                        category="vendors"
                        id={id}
                    >
                        {companyName}
                    </TableLink>
                </div>
            )
        }
    },),

    columnHelper.accessor("contact_name", {
        header: 'Contact Name',
        cell: (props) => {
            const firstName: string | null = _.get(props.row.original, 'first_name', null);
            const lastName: string | null = _.get(props.row.original, 'last_name', null);

            return `${firstName} ${lastName}`
        }
    },),

    columnHelper.accessor("email", {
        header: 'Email',
    },),

    columnHelper.accessor("phone", {
        header: 'Phone',
    },),

    columnHelper.accessor("id", {
        size: 30,
        header: 'Vendor Id',
    },),

    columnHelper.accessor("edit", {
        header: '',
        maxSize: 30,
        cell: (props) => {
            const id: string = _.get(props.row.original, 'id', '')
            return (

                <TableLink
                    redirectTo={`/ccg/vendors/edit/${id}`}
                    action="update"
                    category="vendors"
                    id={id}
                >
                    <GoPencil />
                </TableLink>
            )
        }
    },),
]