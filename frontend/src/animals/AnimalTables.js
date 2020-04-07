import React, {useEffect, useState} from 'react';
import axios from "axios";
import Table from ".././components/Table";

const ANIMALS_URL = 'http://127.0.0.1:8000/animals/list';
function AnimalTable() {
    const columns = React.useMemo(
        () => [
            {
                Header: 'Name',
                accessor: 'name'
            }
        ]
    )

    const [data, setData] = useState([]);

    // why async? i don't know!
    async function getData() {
      const response = await fetch(
        'ANIMALS_URL',
      );
      const data = await response.json();
      // Previously initialized setter for data const.
      setData(data.results);
    }
  
    // Hook interface, use this instead of extending from Component
    // and using componentDidMount, etc.
    useEffect(() => {
      getData();
    }, []);

    return (
        <div>
          <Table columns={columns} data={data} />
        </div>
    );
}
export default AnimalTable;
