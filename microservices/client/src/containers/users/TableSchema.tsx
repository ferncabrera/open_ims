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

  columnHelper.accessor("name", {
    header: 'name',
    cell: (props) => {

      const firstName: string = _.get(props.row.original, 'first_name', '');
      const lastName: string = _.get(props.row.original, 'last_name', '');

      const id = _.get(props.row.original, 'id');

      return (
        <div className="d-flex">

          <TableLink
            redirectTo={`/ccg/users/read/${id}`}
            action="read"
            category="users"
          >
            {firstName + ' ' + lastName}
          </TableLink>
        </div>
      )
    }
  },),

  columnHelper.accessor("permission", {
    header: 'Type',
  },),

  columnHelper.accessor("email", {
    header: 'Email',
  },),

  columnHelper.accessor("phone", {
    size: 30,
    header: 'Phone',
  },),

  columnHelper.accessor("edit", {
    header: '',
    maxSize: 30,
    cell: (props) => {
      const id: string = _.get(props.row.original, 'id', '')
      return (

        <TableLink
          redirectTo={`/ccg/users/edit/${id}`}
          action="update"
          category="users"
          id={id}
        >
          <GoPencil />
        </TableLink>
      )
    }
  },),
]