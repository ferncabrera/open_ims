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

  columnHelper.accessor("invoice_date", {
    header: 'Date',
    cell: (props) => {

      const ISODate: string = _.get(props.row.original, 'invoice_date', null);
      let dateString = '-';
      if (ISODate) {
        const date = new Date(ISODate);

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based, so add 1
        const day = String(date.getDate() + 1).padStart(2, "0"); // I think dates are zero-based as well. So add 1

        dateString = `${day}/${month}/${year}`
      }
      return (
        <div className="d-flex">
          {dateString}
        </div>
      )
    }
  },),

  columnHelper.accessor("invoice_id", {
    header: 'Invoice No.',
    cell: (props) => {
      const id: string = _.get(props.row.original, 'invoice_id', '');
      return (
        <div className="d-flex">
          <TableLink
            redirectTo={`/ccg/invoices/read/${id}`}
            action="read"
            category="invoices"
            id={id}
          >
            {id}
          </TableLink>
        </div>
      )
    }
  },),

  columnHelper.accessor("company_name", {
    header: 'Company Name',
  },),

  columnHelper.accessor("amount_due", {
    header: 'Amount',
  },),

  columnHelper.accessor("order_status", {
    size: 30,
    header: 'Invoice Status',
  },),

  columnHelper.accessor("edit", {
    header: '',
    maxSize: 30,
    cell: (props) => {
      const id: string = _.get(props.row.original, 'id', '')
      return (

        <TableLink
          redirectTo={`/ccg/invoices/edit/${id}`}
          action="update"
          category="invoices"
          id={id}
        >
          <GoPencil />
        </TableLink>
      )
    }
  },),
]