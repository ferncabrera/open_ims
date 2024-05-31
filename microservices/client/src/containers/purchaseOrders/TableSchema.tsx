import { createColumnHelper } from "@tanstack/react-table";
import { Form } from "react-bootstrap";
import { GoPencil } from "react-icons/go";
import { TableLink } from "../../components/table/TableLink";
import { StatusPill } from "../../components/graphics/StatusPill";
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

  columnHelper.accessor("purchase_date", {
    header: 'Purchase Date',
    cell: (props) => {

      const ISODate: string = _.get(props.row.original, 'purchase_date', null);
      let dateString = '-';
      if (ISODate) {
        const date = new Date(ISODate);

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based, so add 1
        const day = String(date.getDate()).padStart(2, "0");

        dateString = `${day}/${month}/${year}`
      }
      return (
        <div className="d-flex">
          {dateString}
        </div>
      )
    }
  },),

  columnHelper.accessor("purchase_id", {
    header: 'Purchase Order No.',
    cell: (props) => {
      const id: string = _.get(props.row.original, 'purchase_id', '');
      return (
        <div className="d-flex">
          <TableLink
            redirectTo={`/ccg/purchase-orders/read/${id}`}
            action="read"
            category="purchase-orders"
            id={id}
          >
            {id}
          </TableLink>
        </div>
      )
    }
  },),

  columnHelper.accessor("vendor_name", {
    header: 'Vendor Name',
  },),

  columnHelper.accessor("amount_due", {
    header: 'Amount',
  },),

  columnHelper.accessor("delivery_status", {
    size: 30,
    header: 'Delivery Status',
    cell: (props) => {
      const status: string = _.get(props.row.original, 'delivery_status', '');

      let color: 'red' | 'yellow' | 'green' = 'red';
      if (status === 'Received') {
        color = 'green'
      } else {
        color = 'red'
      }

      return (
        <StatusPill
          text={status}
          color={color}
        />
      )
    }
  },),

  columnHelper.accessor("edit", {
    header: '',
    maxSize: 30,
    cell: (props) => {
      const id: string = _.get(props.row.original, 'purchase_id', '')
      return (

        <TableLink
          redirectTo={`/ccg/purchase-orders/edit/${id}`}
          action="update"
          category="purchase-orders"
          id={id}
        >
          <GoPencil />
        </TableLink>
      )
    }
  },),
]