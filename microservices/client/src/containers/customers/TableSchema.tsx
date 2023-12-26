import { createColumnHelper } from "@tanstack/react-table";
import { Form } from "react-bootstrap";
import { GoPencil } from "react-icons/go";
import _ from "lodash";

const columnHelper = createColumnHelper();




export const Columns = [
    columnHelper.accessor("select",{
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
    }, ),

    columnHelper.accessor("company_name",{
        header: 'Company Name',
        cell: (props) => {
            
            const companyName: string = _.get(props.row.original, 'company_name', null);
            return (
                <div className="d-flex">
                    {/* <Form.Check
                    onClick={(e) => HandleTableCheckbox(e, props)}
                    className="me-3"
                    /> */}
                    {companyName}
                </div>
            )
        }
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
        size: 30,
        header: 'Customer Id',
    }, ),

    columnHelper.accessor("edit",{
        header: '',
        maxSize: 30,
        cell: (row) => {
            return (
                <a
                className="no-underline"
                // onClick={}
                >
                    <GoPencil/>
                </a>
            )
        }
    }, ),
]