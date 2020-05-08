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
function Table({ columns, data, hide_thead, show_border }) {
  // Use the state and functions returned from useTable to build your UI
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
    },
    useSortBy,
  );

  // Show border by default if show_border isn't passed in.
  if (show_border === undefined) {
    show_border = true;
  }

  // Render the UI for your table
  return (
    <BootstrapTable bordered={show_border} hover size="sm" {...getTableProps()}>
      <thead hidden={hide_thead}>
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
