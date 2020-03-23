import React from 'react'
import BootstrapTable from 'react-bootstrap-table-next'
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';

const columns = [
    {
        dataField: 'id',
        text: 'Product ID'
    }, 
    {
        dataField: 'name',
        text: 'Product ID'
    },
    {
        dataField: 'owner',
        text: 'Product ID'
    },
    {
        dataField: 'species',
        text: 'Product ID'
    },
    {
        dataField: 'breed',
        text: 'Product ID'
    },
    {
        dataField: 'sex',
        text: 'Product ID'
    }
];

const AnimalTable = (props) => {
    return (
        <div>
            <BootstrapTable keyField='id' data={ props.data } columns={ columns } />
            <p>{props.isFetching ? 'Fetching animals...' : ''}</p>
        </div>
    )
};
export default AnimalTable;