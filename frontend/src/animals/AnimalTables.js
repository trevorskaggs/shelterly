import React, {useEffect, useState} from 'react';
import axios from "axios";
import Table from ".././components/Table";

const ANIMALS_URL = 'http://127.0.0.1:8000/animals/api/animals';
function AnimalTable() {
    const columns = React.useMemo(
        () => [
            {
                Header: 'Name',
                accessor: 'name'
            }
        ],
        []
    )

    const [data, setData] = useState({animals: [], isFetching: false});

    // why async? i don't know!
    useEffect(() => {
        let source = axios.CancelToken.source();
        const fetchAnimals = async () => {
          setData({animals: data.animals, isFetching: true});
          // Fetch EvacTeam data.
          await axios.get(ANIMALS_URL, {
            cancelToken: source.token,
          })
          .then(response => {
            setData({animals: response.data, isFetching: false});
          })
          .catch(e => {
            console.log(e);
            setData({animals: data.animals, isFetching: false});
          });
        };
        fetchAnimals();
        // Cleanup.
        return () => {
          source.cancel();
        };
      }, []);

    return (
        <div>
          <Table columns={columns} data={data.animals} />
        </div>
    );
}
export default AnimalTable;
