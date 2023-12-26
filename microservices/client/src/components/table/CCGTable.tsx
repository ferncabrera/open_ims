import React, { useMemo, useState, useEffect } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getPaginationRowModel
} from '@tanstack/react-table';
import { Row, Col, Form, Button, Spinner } from 'react-bootstrap';
import { BasicSearchFilters } from './BasicSearchFilters';
import { MdArrowForward, MdArrowBack } from "react-icons/md";
import _ from 'lodash';

interface ICCGTableProps {
  columns: any;
  data: any;
  // columns and data must be compatible with eachother when passed in as props
  totalCount: number;
  fetchDataFunction: (pageSize, pageIndex, searchQuery?) => void;
  pageSize: number,
  pageIndex: number,
}

export const CCGTable: React.FC<ICCGTableProps> = (props) => {

  const {
    columns,
    data,
    totalCount,
    fetchDataFunction,
    pageSize,
    pageIndex,

  } = props;

  const columnSchema = useMemo(() => columns, []);
  // const tableData = useMemo(() => data, []);

  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const [rowSelection, setRowSelection] = useState({});


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

  const handleSearch = (searchQuery: string) => {
    setSearchValue(searchQuery)
    fetchDataFunction(10, 0, searchQuery)
  }

  return (
    <div>
      <div className='table-border-wrapper'>
        {/* Need to make an insertable component header here */}
        <div className='bg-white filter-header-section'>
          <BasicSearchFilters
            search={handleSearch}
          />
        </div>
        <div className='px-4 py-3 bg-white filter-size-section'>
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
                  fetchDataFunction(pageSize, 0, searchValue);
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
        </div>
        {isLoading &&
          <div className='d-flex justify-content-center'>
            <Spinner />
          </div>
        }
        {(data && !isLoading) &&
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
        }
        <div className='bg-white pt-3 pb-2'>
          <Row>
            <Col className='ms-3'>
              <Button
                className='pagination'
                variant='info'
                onClick={() => {
                  setIsLoading(true)
                  setCurrentPage(1);
                  fetchDataFunction(pageSize, Number(pageIndex) - 1, searchValue)
                }}
                disabled={(Number(pageIndex) === 0) ? true : false}
              >
                <MdArrowBack /> Previous
              </Button>
            </Col>
            <Col>
              <span className="flex items-center page-input">
                Go to page:
                <Form.Control
                  size='sm'
                  value={!currentPage ? '' : (Number(pageIndex) + 1)}
                  onChange={(e) => {
                    const input = Number(e.target.value);
                    if (!isNaN(input) && (input >= 1) && ((input + (Number(pageIndex) + 1) >= 1) && (input <= Math.ceil(totalCount / pageSize)))) {
                      setIsLoading(true);
                      setCurrentPage(1);
                      fetchDataFunction(pageSize, input - 1, searchValue);
                    } else {
                      setCurrentPage(null);
                    }
                  }}
                />
                of {Math.ceil(totalCount / pageSize)}
              </span>
            </Col>
            <Col className='d-flex justify-content-end me-3'>
              <Button
                className='pagination'
                variant='info'
                onClick={() => {
                  setIsLoading(true);
                  setCurrentPage(1);
                  fetchDataFunction(pageSize, Number(pageIndex) + 1, searchValue)
                }}
                disabled={(Number(pageIndex) + 1 >= Math.ceil(totalCount / pageSize)) ? true : false}
              >
                Next <MdArrowForward />
              </Button>
            </Col>
          </Row>
        </div>
      </div>
    </div >
  )
}
