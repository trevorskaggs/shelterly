import React, { useEffect, useState } from 'react';
import axios from "axios";
import {BuildingDetailsTable} from "./ShelterDetails";

const header_style = {
  textAlign: "center",
};

export function BuildingList({sid}) {

    const [data, setData] = useState({buildings: [], isFetching: false});
    
    // Hook for initializing data.
    useEffect(() => {
      console.log('shelter id: ' + sid)
      let source = axios.CancelToken.source();
      const fetchShelterBuildings = async () => {
        setData({buildings: [], isFetching: true});
        // Fetch EvacTeam data.
        await axios.get('http://localhost:8000/shelter/api/building/?shelter=' + sid, {
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
    }, [sid]);
  
    return (
        <ul>
        {data.buildings.map(r => (
            <li><a href={"/shelter/building/"+r.id}>{r.name}</a></li>
        ))}
      </ul>
    )
  }


export const BuildingDetails = ({bid}) => (
  <div>
    <BuildingDetailsTable bid={bid} />
  </div>
)