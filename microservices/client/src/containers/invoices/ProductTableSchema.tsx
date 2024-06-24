import { createColumnHelper } from "@tanstack/react-table"
import { useEffect, useState } from "react";
import { getJSONResponse } from "../../utilities/apiHelpers";
import { useAtom } from "jotai";
import { deleteRowState, productState } from "../../atoms/atoms";

import { FaRegTrashAlt } from "react-icons/fa";
import { Form } from "react-bootstrap";
import { Typeahead } from "react-bootstrap-typeahead";


import { produce } from "immer";
import _ from "lodash";


const columnHelper = createColumnHelper();

export const EditColumns = [
    columnHelper.accessor("item_number", {
        header: 'Item Number',
        cell: (props) => {

            const id = _.get(props.row.original, 'id', '');


            const [product, setProduct] = useAtom(productState);
            const [singleSelection, setSingleSelection] = useState<typeof Option[]>([]);
            const [options, setOptions] = useState<string[]>([]);

            useEffect(() => {
                if (id && !_.isEmpty(product.productRows)) {
                    // const mapOptions = _.map(product.getProducts, item => _.toString(item.item_number))
                    const arrOptions = _.map(product.getProducts, item => {
                        const stringedNumber = _.toString(item.item_number);
                        return { ...item, item_number: stringedNumber }
                    })
                    setOptions(arrOptions);
                };
            }, []);

            const handleChange = (val: any) => {
                let itemName = ''
                let productCode: number | null = null
                let rate: number | string = ''
                if (!_.isEmpty(val[0]) && _.isNumber(Number(val[0]))) {
                    productCode = _.toInteger(val[0].item_number) // selection will always be an array, but this will always be a single selection
                    itemName = val[0].product_name
                    rate = val[0].rate

                }
                const newProduct = produce(product, draft => {
                    draft.productRows[id].item_number = productCode;
                    draft.productRows[id].item_name = itemName;
                    draft.productRows[id].lot = '';
                    draft.productRows[id].rate = rate;
                    draft.productRows[id].taxable = false;
                    draft.productRows[id].vendor_id = null;
                    draft.productRows[id].quantity = '';
                    draft.productRows[id].amount = '';
                    draft.productRows[id].discount = '';
                });
                setProduct(newProduct);
                setSingleSelection(val);

            };


            return (
                <Form.Group style={{ "width": "110px" }}>
                    <Typeahead
                        id={id}
                        onChange={handleChange}
                        labelKey={'item_number'}
                        options={options}
                        selected={singleSelection}
                        positionFixed
                        maxHeight="200px"

                    />
                </Form.Group>
            )
        }
    }),

    columnHelper.accessor("item_name", {
        header: 'Product Name',
        cell: (props) => {

            const id = _.get(props.row.original, 'id', '');

            const [product, setProduct] = useAtom(productState);
            const [value, setValue] = useState<string>('');


            useEffect(() => {
                if (!_.isEmpty(product.productRows)) {
                    setValue(product.productRows[id].item_name);
                }

            }, [product.productRows[id]]);


            return (
                <div style={{ "width": "100px" }}>
                    {value}
                </div>
            )


        }
    }),

    columnHelper.accessor("unique_product_id", {
        header: 'SKU',
        cell: (props) => {

            const id = _.get(props.row.original, 'id', '');

            const [options, setOptions] = useState<string[]>([])
            const [singleSelection, setSingleSelection] = useState<typeof Option[]>([]);
            const [product, setProduct] = useAtom(productState);


            useEffect(() => {
                if (!_.isEmpty(product.productRows) && product.productRows[id].item_number && product.productRows[id].item_name) {
                    const SKUOptions = _.reduce(product.getUniqueProducts, (accumulator: any[], uniqueProd) => {
                        if (product.productRows[id].item_number === uniqueProd.item_number) {
                            accumulator.push({
                                ...uniqueProd,
                                sku: `${uniqueProd.item_number}${uniqueProd.vendor_id}${uniqueProd.lot}`
                            });
                        }
                        return accumulator
                    }, []);

                    setOptions(SKUOptions)
                    //handle updates that require clearing
                    if (!product.productRows[id].lot && !product.productRows[id].vendor_id) {
                        handleChange([''])
                    }

                } else {
                    setOptions([])
                    handleChange([''])
                    // Remove any SKU populations that previously existed before.
                }
            }, [product.productRows[id]]);

            const handleChange = (val) => {
                const value = val[0];

                // Handles selecting a SKU
                if (value) {
                    const newProductState = produce(product, draft => {
                        draft.productRows[id].lot = value.lot;
                        draft.productRows[id].vendor_id = value.vendor_id;
                        draft.productRows[id]
                    });
                    setProduct(newProductState);
                } else {
                    const newProductState = produce(product, draft => {
                        draft.productRows[id].lot = '';
                        draft.productRows[id].vendor_id = null;
                    });
                    setProduct(newProductState);

                }

                setSingleSelection(val);
            };


            return (
                <Form.Group style={{ "width": "140px" }}>
                    <Typeahead
                        id={id}
                        onChange={handleChange}
                        labelKey={'sku'}
                        options={options}
                        disabled={_.isEmpty(options) ? true : false}
                        selected={singleSelection}
                        positionFixed

                    />
                </Form.Group>
            )
        }

    }),

    columnHelper.accessor("quantity", {
        header: 'Quantity',


        cell: (props) => {

            const id = _.get(props.row.original, 'id', '');

            const [quantity, setQuantity] = useState<number | string>('');
            const [product, setProduct] = useAtom(productState);
            const [disabled, setDisabled] = useState(true);

            useEffect(() => {
                setQuantity(product.productRows[id].quantity);

                if (!product.productRows[id].item_number) {
                    setDisabled(true)
                } else {
                    setDisabled(false)
                }
            }, [product.productRows[id]]);

            const handleChange = (e) => {
                const value = e.target.value;
                if (_.isNumber(Number(value)) && !_.isNaN(Number(value)) && (Number(value) <= 100) && (Number(value) >= 0)) {

                    const newProductState = produce(product, draft => {
                        draft.productRows[id].quantity = value;
                    });
                    setProduct(newProductState);
                }
            };


            return (
                <Form.Group style={{ "width": "65px" }}>
                    <Form.Control type="input" value={quantity} disabled={disabled} onChange={handleChange} />
                </Form.Group>
            )
        }
    }),

    columnHelper.accessor("rate", {
        header: 'Rate',
        cell: (props) => {
            const id = _.get(props.row.original, 'id', '');

            const [rate, setRate] = useState<number | string>('');
            const [product, setProduct] = useAtom(productState);
            const [disabled, setDisabled] = useState(true)

            useEffect(() => {
                setRate(product.productRows[id].rate)

                if (!product.productRows[id].item_number) {
                    setDisabled(true)
                } else {
                    setDisabled(false)
                }

            }, [product.productRows[id]]);

            const handleChange = (e) => {
                const value = e.target.value;
                if (_.isNumber(Number(value)) && !_.isNaN(Number(value)) && (Number(value) >= 0)) {

                    const newProductState = produce(product, draft => {
                        draft.productRows[id].rate = value;
                    });
                    setProduct(newProductState);
                }
            };

            return (
                <Form.Group style={{ "width": "65px" }}>
                    <Form.Control type="input" value={rate} onChange={handleChange} disabled={disabled} />
                </Form.Group>
            )
        }
    }),

    columnHelper.accessor("taxable", {
        header: 'Taxable',
        cell: (props) => {
            const id = _.get(props.row.original, 'id', '');

            const [product, setProduct] = useAtom(productState);
            const [disabled, setDisabled] = useState(true);
            const [isChecked, setIsChecked] = useState(false);

            useEffect(() => {
                setIsChecked(product.productRows[id].taxable);
                if (!product.productRows[id].item_number) {
                    setDisabled(true)
                } else {
                    setDisabled(false)
                }
            }, [product.productRows[id]]);

            const handleChange = (e) => {
                const checkboxValue = e.target.checked;
                const newProductState = produce(product, draft => {
                    draft.productRows[id].taxable = checkboxValue
                });


                setProduct(newProductState);
            };

            return (
                <Form.Group className="" style={{ "width": "20px", "paddingLeft": "1.3em" }}>
                    <Form.Check onChange={handleChange} disabled={disabled} checked={isChecked} />
                </Form.Group>
            )
        }
    }),

    columnHelper.accessor("discount", {
        header: 'Discount (%)',
        cell: (props) => {
            const id = _.get(props.row.original, 'id', '');

            const [product, setProduct] = useAtom(productState);
            const [disabled, setDisabled] = useState(true);
            const [discount, setDiscount] = useState('');

            useEffect(() => {
                setDiscount(product.productRows[id].discount);
                if (!product.productRows[id].item_number) {
                    setDisabled(true)
                } else {
                    setDisabled(false)
                }
            }, [product.productRows[id]])

            const handleChange = (e) => {
                const value = e.target.value;

                if (_.isNumber(Number(value)) && !_.isNaN(Number(value)) && (Number(value) <= 100) && (Number(value) >= 0)) {
                    const newProductState = produce(product, draft => {
                        draft.productRows[id].discount = value
                    });
                    setProduct(newProductState);
                }
            }

            return (
                <Form.Group style={{ "width": "75px" }}>
                    <Form.Control type="input" value={discount} disabled={disabled} onChange={handleChange} />
                </Form.Group>
            )
        }
    }),

    columnHelper.accessor("amount", {
        header: 'Amount',
        cell: (props) => {
            const id = _.get(props.row.original, 'id', '');

            const [product, setProduct] = useAtom(productState);
            const [amount, setAmount] = useState(product.productRows[id].amount);

            useEffect(() => {
                const currentProduct = product.productRows[id];
                if (currentProduct.quantity && currentProduct.rate) {
                    let amount = Number(currentProduct.quantity) * Number(currentProduct.rate)
                    if (currentProduct.discount) {
                        amount = amount - (amount * Number(currentProduct.discount) / 100)
                    }
                    const newProductState = produce(product, draft => {
                        draft.productRows[id].amount = amount
                    });
                    setProduct(newProductState)
                    setAmount(product.productRows[id].amount)
                }
                else {
                    const newProductState = produce(product, draft => {
                        draft.productRows[id].amount = ''
                    });
                    setProduct(newProductState);
                    setAmount(product.productRows[id].amount)
                }
            }, [product.productRows[id]])

            return (
                <>
                    <strong>{Number(amount).toFixed(2)}</strong>
                </>
            )
        }
    }),

    columnHelper.accessor("delete", {
        header: '',
        cell: (props) => {
            const id: string | number = _.get(props.row.original, 'id', '');
            const [removeRow, setRemoveRow] = useAtom(deleteRowState);
            return (
                <FaRegTrashAlt
                    className='red-trash'
                    onClick={() => setRemoveRow({ rowId: _.isInteger(id) ? Number(id) : null })}
                /> // instead of select, toggle the delete operation
            )
        }
    })
];

export const ReadColumns = [
    columnHelper.accessor("item_number", {
        header: 'Item Number'
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