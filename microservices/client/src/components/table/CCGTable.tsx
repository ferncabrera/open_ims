import React, { useMemo, useState, useEffect, useRef } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getPaginationRowModel
} from '@tanstack/react-table';
import { Row, Col, Form, Button, Spinner } from 'react-bootstrap';
import { BasicSearchFilters } from './BasicSearchFilters';
import { FilterButton } from '../buttons/filters/FilterButton';
import { DateFilter } from '../buttons/filters/DateFilter';
import { InputFilter } from '../buttons/filters/InputFilter';
import { PillButton } from '../buttons/PillButton';
import { MdArrowForward, MdArrowBack } from "react-icons/md";
import _ from 'lodash';

type SelectedFitlerObject = {
  element: React.ReactElement;
  type: String;
  id: Number;
};

interface ICCGTableProps {
  columns: any;
  data: any;
  // columns and data must be compatible with eachother when passed in as props
  totalCount: number;
  fetchDataFunction: (pageSize: Number, pageIndex: Number, searchQuery?) => void;
  handleSelectedRows?: (selectedRows) => void;
  pageSize: number;
  pageIndex: number;
  filters?: { label: string, type: string, id: number }[];
  searchPlaceholder: string;
  tableHeader?: string;
  frontEndPagination?: boolean;
  addRowButton?: boolean;
  onAddRow?: () => void;
}

export const CCGTable: React.FC<ICCGTableProps> = (props) => {

  const {
    columns,
    data,
    totalCount,
    fetchDataFunction, // params are (pageSize, pageIndex, searchQuery) IN THAT ORDER
    pageSize,
    pageIndex,
    handleSelectedRows = null,
    searchPlaceholder,
    tableHeader = null,
    addRowButton = false,
    onAddRow = null,
    frontEndPagination = false,
  } = props;

  const filters = props.filters ? props.filters : [];

  let i_key = 0;

  const columnSchema = useMemo(() => columns, []);
  // const tableData = useMemo(() => data, []);

  const [currentPage, setCurrentPage] = useState<Number | null>(1);
  const [isLoading, setIsLoading] = useState(true);
  const [rowSelection, setRowSelection] = useState({});
  const [selectedFilters, setSelectedFilters] = useState<Array<SelectedFitlerObject>>([]);
  const [filterOptions, setFilterOptions] = useState(filters);
  const [filterValues, setFilterValues] = useState({});


  const table = useReactTable({

    data: data,
    columns: columnSchema,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    enableRowSelection: true,
    enableMultiRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getRowId: (row: any) => row.id,
    state: { rowSelection }
  });


  useEffect(() => {
    if (data) {
      setIsLoading(false);
    }
  }, [data, isLoading]);

  useEffect(() => {
    //Everytime a row is selected or de-selected, an array of row id's are sent to the parent
    if (handleSelectedRows) {
      handleSelectedRows(rowSelection)
    }
  }, [rowSelection])

  const handleSearch = (searchQuery: string) => {
    setFilterValues(prevFilterValues => ({ ...prevFilterValues, searchQuery }))
  }

  const handleDateSelect = (dateSelection) => {
    let dateIso = '';
    if (dateSelection) {
      dateIso = new Date(dateSelection).toISOString();
    };
    setFilterValues(prevFilterValues => ({ ...prevFilterValues, date: dateIso }))
  }

  const handleInputFilter = (data, id) => {
    setFilterValues(prevFilterValues => ({ ...prevFilterValues, ['input' + id]: data }))
    return
  };

  const handleApplyFilters = () => {
    `params (pageSize, pageIndex, searchQuery)`
    fetchDataFunction(10, 0, filterValues)
  };

  const removeFilter = (filterType: string, label: string, id: number) => {
    setSelectedFilters(prevSelected => (_.filter(prevSelected, (filter) => filter.id !== id)));
    if (filterType !== 'date') {
      setFilterValues(prevFilterValues => ({ ...prevFilterValues, [filterType + id]: '' }));
    } else {
      setFilterValues(prevFilterValues => ({ ...prevFilterValues, [filterType]: '' }));
    }
    setFilterOptions((prevFilterOptions) => ([...prevFilterOptions, { type: filterType, label, id }]));
  };

  const handleFilterSelection = (filterType: { label: string, type: string, id: number, placeholder?: string }) => {

    const { label, type, id, placeholder } = filterType;

    const newFilterOptions = _.filter(filterOptions, (filter) => filter.id !== id)
    setFilterOptions(newFilterOptions)

    switch (filterType.type) {
      case 'date':
        setSelectedFilters((prevSelectedFilters) =>
          [...prevSelectedFilters, { element: <DateFilter onSelect={handleDateSelect} onClose={() => removeFilter(type, label, id)} />, type, id }]);
        break
      case 'input':
        setSelectedFilters((prevSelectedFilters) =>
          [...prevSelectedFilters, { element: <InputFilter placeholder={label} onChange={handleInputFilter} onClose={() => removeFilter(type, label, id)} inputId={id} />, type, id }])
        break;
    }

    return null
  }

  return (
    <div>
      <div className='table-border-wrapper'>
        {/* Need to make an insertable component header here */}
        <div className='bg-white filter-header-section'>
          <h5 className='mb-3'><strong>{tableHeader}</strong></h5>
          {!addRowButton &&
            <Row className='w-100'>
              <Col className='d-flex flex-wrap'>
                <BasicSearchFilters
                  search={handleSearch}
                  placeHolder={searchPlaceholder}
                />
                {
                  !_.isEmpty(selectedFilters) &&
                  _.map(selectedFilters, (filter) => {
                    i_key++;
                    return <div key={i_key} className='px-1 py-1'>{filter.element} </div>
                  })
                }
                {!_.isEmpty(filterOptions) &&
                  <div className='py-1 px-1'>
                    <FilterButton onSelect={handleFilterSelection} className='h-auto w-auto btn-grey' options={filterOptions} />
                  </div>
                }
              </Col>
              <Col className='d-flex justify-content-end' xs={4}>
                <div className='py-1 px-1'>
                  <PillButton
                    className='h-auto'
                    text='Apply and Search'
                    color='blue'
                    onClick={handleApplyFilters}
                  />
                </div>
              </Col>
            </Row>
          }
        </div>
        <div className='px-4 py-3 bg-white filter-size-section'>
          {!onAddRow &&
            <Row>
              <Col>
                {data &&
                  `Showing 0 - ${table.getRowModel().rows.length} results out of ${totalCount}`
                }
              </Col>
              <Col className='d-flex justify-content-end'>
                <span className='pe-2'>Results Per Page </span>
                <select
                  className='size-select'
                  value={pageSize}
                  onChange={e => {
                    const pageSize = e.target.value;
                    setIsLoading(true);
                    fetchDataFunction(Number(pageSize), 0, filterValues);
                  }}
                >
                  {[10, 20, 30, 40, 50].map(pageSizeOption => (
                    <option key={pageSizeOption} value={pageSizeOption}>
                      {pageSizeOption}
                    </option>
                  ))}
                </select>
              </Col>
            </Row>
          }
        </div>
        {isLoading &&
          <div className='d-flex justify-content-center'>
            <Spinner />
          </div>
        }
        <table>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => {
              return (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <th key={header.id} id={header.id}>
                        {" "}
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      </th>
                    );
                  })}
                </tr>
              )
            })}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => {
              return (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => {
                    return (
                      <td key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>

        </table>
        {onAddRow && addRowButton &&
          <Row className='bg-white pt-3 pb-1'>
            <Col className='ps-4' sm={2}>
              <Button className='btn-white' onClick={onAddRow}>+ Add Row</Button>
            </Col>
          </Row>
        }
        <div className='bg-white pt-3 pb-2'>
          {!addRowButton &&
            <Row>
              <Col className='ms-3'>
                {(Number(pageIndex) === 0) ? null : <Button
                  className='pagination'
                  variant='info'
                  onClick={(e) => {
                    e.preventDefault();
                    setIsLoading(true)
                    setCurrentPage(1);
                    fetchDataFunction(Number(pageSize), Number(pageIndex) - 1, filterValues)
                  }}
                // disabled={(Number(pageIndex) === 0) ? true : false}
                >
                  <MdArrowBack /> Previous
                </Button>}
              </Col>
              <Col>
                <span className="flex items-center page-input">
                  Go to page:
                  <Form.Control
                    size='sm'
                    value={!currentPage ? '' : (Number(pageIndex) + 1)}
                    onChange={(e) => {
                      e.preventDefault()
                      const input = Number(e.target.value);
                      if (!isNaN(input) && (input >= 1) && ((input + (Number(pageIndex) + 1) >= 1) && (input <= Math.ceil(totalCount / pageSize)))) {
                        setIsLoading(true);
                        setCurrentPage(1);
                        fetchDataFunction(Number(pageSize), input - 1, filterValues);
                      } else {
                        setCurrentPage(null);
                      }
                    }}
                  />
                  of {Math.ceil(totalCount / pageSize)}
                </span>
              </Col>
              <Col className='d-flex justify-content-end me-3'>
                {(Number(pageIndex) + 1 >= Math.ceil(totalCount / pageSize)) ? null : <Button
                  className='pagination'
                  variant='info'
                  onClick={(event) => {
                    event.preventDefault();
                    setIsLoading(true);
                    setCurrentPage(1);
                    fetchDataFunction(Number(pageSize), Number(pageIndex) + 1, filterValues)
                  }}
                // disabled={(Number(pageIndex) + 1 >= Math.ceil(totalCount / pageSize)) ? true : false}
                >
                  Next <MdArrowForward />
                </Button>}
              </Col>
            </Row>
          }
        </div>
      </div>
    </div >
  )
}
