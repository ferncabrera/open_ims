import { createColumnHelper } from "@tanstack/react-table"
import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { productState } from "../../atoms/atoms";

import { FaRegTrashAlt } from "react-icons/fa";
import { Form } from "react-bootstrap";
import { Typeahead } from "react-bootstrap-typeahead";

import _ from "lodash";


const columnHelper = createColumnHelper();

export const EditColumns = [
    columnHelper.accessor("product_code", {
        header: 'Item Number',
        cell: (props) => {

            let itemNumber = null

            const [product, setProduct] = useAtom(productState);
            const [singleSelection, setSingleSelection] = useState([])

            const id = _.get(props.row.original, 'id');

            if (id) {
                itemNumber = product.productRows[_.toString(id)].item_number
            }

            const options = _.map(product.getProducts, item => {
                return {
                    label: item.item_number,
                    key: item.item_number,
                    value: item.item_number
                }
            })

            return (
                <Form.Group>
                    <Typeahead
                        id={id}
                        onChange={() => console.log('changed!')}
                        labelKey={'label'}
                        options={options}
                        selected={singleSelection}

                    />
                </Form.Group>
            )
        }
    }),

    columnHelper.accessor("item_name", {
        header: 'Product Name',
        cell: (props) => {

            const [product, setProduct] = useAtom(productState);

            const id = _.get(props.row.original, 'id');

            useEffect(() => {
                console.log('this id', id, props)
            }, []);




        }
    }),

    columnHelper.accessor("unique_product_id", {
        header: 'SKU',
        cell: (props) => {
            return (
                <Form.Group>
                    <Form.Select onChange={() => console.log('changed!')}>
                        <option value="hey">Fake Option</option>
                    </Form.Select>
                </Form.Group>
            )
        }

    }),

    columnHelper.accessor("quantity", {
        header: 'Quantity',
        cell: (props) => {
            return (
                <Form.Group>
                    <Form.Control type="input" />
                </Form.Group>
            )
        }
    }),

    columnHelper.accessor("rate", {
        header: 'Rate',
        cell: (props) => {
            return (
                <Form.Group>
                    <Form.Control type="input" />
                </Form.Group>
            )
        }
    }),

    columnHelper.accessor("taxable", {
        header: 'Taxable',
        cell: (props) => {
            return (
                <Form.Group>
                    <Form.Check />
                </Form.Group>
            )
        }
    }),

    columnHelper.accessor("discount", {
        header: 'Discount',
        cell: (props) => {
            return (
                <Form.Group>
                    <Form.Control type="input" />
                </Form.Group>
            )
        }
    }),

    columnHelper.accessor("amount", {
        header: 'Amount',
        cell: (props) => {
            return (
                <>
                    lol
                </>
            )
        }
    }),

    columnHelper.accessor("delete", {
        header: '',
        cell: (props) => {
            const id: string | number = _.get(props.row.original, 'item_id', '');
            return (
                <FaRegTrashAlt />
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