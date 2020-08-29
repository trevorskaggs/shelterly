import React, { useEffect, useState } from 'react';
import axios from "axios";
import { Link } from 'raviger';
import {RoomDetailsTable} from "./ShelterDetails";
import { RoomForm, EditRoomForm } from "./ShelterForms";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClipboardList, faEdit, faPlusSquare,
} from '@fortawesome/free-solid-svg-icons';

const btn_style = {
  width: "50%",
  margin: "0 auto",
};

const link_style = {
  textDecoration: "none",
};

const card_style = {
  width: "90%",
}

const header_style = {
  textAlign: "center",
}

export function RoomList({bid}) {

    const [data, setData] = useState({rooms: [], isFetching: false});
    
    // Hook for initializing data.
    useEffect(() => {
      console.log('building id: ' + bid)
      let source = axios.CancelToken.source();
      const fetchShelterRooms = async () => {
        setData({rooms: [], isFetching: true});
        // Fetch EvacTeam data.
        await axios.get('/shelter/api/room/?building=' + bid, {
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
      <div style={card_style} className="card card-body bg-light mb-2 mx-auto">
        <div className="row">
          <div className="col-8">
            <p><b>Rooms</b></p>
              <ul>
                {data.rooms.map(room => (
                    <li key={room.id}>{room.name}
                      <Link href={"/shelter/room/" + room.id}> <FontAwesomeIcon icon={faClipboardList} inverse /></Link>
                    </li>
                ))}
              </ul>
          </div>
        </div>
      </div>
    )    
  }

  export function ShelterRoomList({sid}) {

    const [data, setData] = useState({rooms: [], isFetching: false});
    
    // Hook for initializing data.
    useEffect(() => {
      console.log('shelter id: ' + sid)
      let source = axios.CancelToken.source();
      const fetchShelterRooms = async () => {
        setData({rooms: [], isFetching: true});
        // Fetch EvacTeam data.
        await axios.get('/shelter/api/room/?shelter=' + sid, {
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
    }, [sid]);
  
    return (
      <div style={card_style} className="card card-body bg-light mb-2 mx-auto">
        <div className="row">
          <div className="col-8">
            <p><b>Rooms</b></p>
              <ul>
                {data.rooms.map(room => (
                    <li key={room.id}>{room.name}
                      <Link href={"/shelter/room/" + room.id}> <FontAwesomeIcon icon={faClipboardList} inverse /></Link>
                    </li>
                ))}
              </ul>
          </div>
        </div>
      </div>
    )    
  }

export const RoomDetails = ({rid}) => (
  <div>
    <RoomDetailsTable rid={rid} />
  </div>
)

export const NewRoom = ({bid}) => (
  <div>
    <h1 style={header_style}>Buildings</h1>
    <RoomForm bid={bid} />
  </div>
)

export const UpdateRoom = ({rid}) => (
  <div>
    <EditRoomForm rid={rid}/>
  </div>
)