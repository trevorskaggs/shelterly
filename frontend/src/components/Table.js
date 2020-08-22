import React from 'react';
import { useTable, useSortBy, useResizeColumns, useFlexLayout } from 'react-table';
import { Container, Row, Col, Table as BootstrapTable } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSort,
  faSortUp,
  faSortDown,
} from '@fortawesome/free-solid-svg-icons';

// This is a new component. Why a function and not a const?
function Table({ columns, data }) {
  // Use the state and functions returned from useTable to build your UI

  const defaultColumn = React.useMemo(
    () => ({
      // When using the useFlexLayout:
      minWidth: 30, // minWidth is only used as a limit for resizing
      width: 150, // width is used for both the flex-basis and flex-grow
      maxWidth: 200, // maxWidth is only used as a limit for resizing
    }),
    []
  )

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable(
    {
      // Must be an array of Column objs, memoized.
      columns,
      // An array of anything, memoized
      data,
      defaultColumn,
    },
    useResizeColumns,
    useFlexLayout,
    useSortBy,
  );

  // Render the UI for your table
  return (
    <BootstrapTable responsive striped bordered hover variant="dark" {...getTableProps()}>
      <thead>
        {headerGroups.map(headerGroup => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map(column => (
              <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                {column.render('Header')}
                <span>
                  {/* Series of if checks. Display fa-sort if unsorted, fa-sort-down if isSortedDesc, and fa-sort-up if isSortedAsc*/}
                  {column.isSorted ? (
                    column.isSortedDesc ? (
                      <FontAwesomeIcon icon={faSortDown} />
                    ) : (
                      <FontAwesomeIcon icon={faSortUp} />
                    )
                  ) : (
                    <FontAwesomeIcon icon={faSort} />
                  )}
                </span>
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {rows.map((row, i) => {
          prepareRow(row);
          return (
            <tr {...row.getRowProps()}>
              {row.cells.map(cell => {
                return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>;
              })}
            </tr>
          );
        })}
      </tbody>
    </BootstrapTable>
  );
}

export default Table;
