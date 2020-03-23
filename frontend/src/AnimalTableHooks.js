import React, {useEffect, useState} from 'react';
import axios from "axios";
import AnimalTable from "./AnimalTable";

const ANIMALS_URL = 'http://127.0.0.1:8000/animals/api/animals';
function AnimalTableHooks() {
    const [data, setData] = useState({animals: [], isFetching: false});
    
    useEffect(() => {
        const fetchAnimals = async () => {
            try {
                setData({animals: data.animals, isFetching: true});
                const response = await axios.get(ANIMALS_URL);
                setData({animals: response.data, isFetching: false});
            } catch (e) {
                console.log(e);
                setData({animals: data.animals, isFetching: false});
            }
        };
        fetchAnimals();
    }, []);
    
    return <AnimalTable data={data.table}
        isFetching={data.isFetching}
    />
}

export default AnimalTableHooks
