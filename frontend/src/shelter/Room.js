import React, { useEffect, useState } from 'react';
import axios from "axios";
import {RoomDetailsTable} from "./ShelterDetails";

const header_style = {
  textAlign: "center",
};

export function RoomList({bid}) {

    const [data, setData] = useState({rooms: [], isFetching: false});
    
    // Hook for initializing data.
    useEffect(() => {
      console.log('building id: ' + bid)
      let source = axios.CancelToken.source();
      const fetchShelterRooms = async () => {
        setData({rooms: [], isFetching: true});
        // Fetch EvacTeam data.
        await axios.get('http://0.0.0.0:8000/shelter/api/room/?building=' + bid, {
          cancelToken: source.token,
        })
        .then(response => {
          setData({rooms: response.data, isFetching: false});
        })
        .catch(e => {
          console.log(e);
          setData({rooms: [], isFetching: false});
        });
      };
      fetchShelterRooms();
      // Cleanup.
      return () => {
        source.cancel();
      };
    }, [bid]);
  
    return (
        <ul>
        {data.rooms.map(r => (
            <li><a href={"/shelter/room/"+r.id}>{r.name}</a></li>
        ))}
      </ul>
    )
  }


export const RoomDetails = ({rid}) => (
  <div>
    <h1 style={header_style}>Shelters</h1>
    <br/>
    <RoomDetailsTable rid={rid} />
  </div>
)