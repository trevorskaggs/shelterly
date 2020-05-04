import React from 'react';
import { useTable, useSortBy } from 'react-table';
import { Table as BootstrapTable } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSort,
  faSortUp,
  faSortDown,
} from '@fortawesome/free-solid-svg-icons';

// This is a new component. Why a function and not a const?
function Table({ columns, data }) {
  // Use the state and functions returned from useTable to build your UI
  const {
    getTableProps,
    // getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable(
    {
      // Must be an array of Column objs, memoized.
      columns,
      // An array of anything, memoized
      data,
    },
    useSortBy,
  );

  // Render the UI for your table
  return (
    <BootstrapTable striped bordered hover size="sm" {...getTableProps()}>
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
