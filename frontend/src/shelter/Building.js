import React, { useEffect, useState } from 'react';
import axios from "axios";

export function BuildingList({s_id}) {

    const [data, setData] = useState({buildings: [], isFetching: false});
    
    // Hook for initializing data.
    useEffect(() => {
      console.log('shelter id: ' + s_id)
      let source = axios.CancelToken.source();
      const fetchShelterBuildings = async () => {
        setData({buildings: [], isFetching: true});
        // Fetch EvacTeam data.
        await axios.get('http://localhost:8000/shelter/api/building/?shelter=' + s_id, {
          cancelToken: source.token,
        })
        .then(response => {
          setData({buildings: response.data, isFetching: false});
        })
        .catch(e => {
          console.log(e);
          setData({buildings: [], isFetching: false});
        });
      };
      fetchShelterBuildings();
      // Cleanup.
      return () => {
        source.cancel();
      };
    }, [s_id]);
  
    return (
        <ul>
        {data.buildings.map(r => (
            <li>{r.name}</li>
        ))}
      </ul>
    )
  }