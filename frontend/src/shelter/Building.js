import React, { useEffect, useState } from 'react';
import axios from "axios";
import {BuildingDetailsTable} from "./ShelterDetails";
import { BuildingForm, EditBuildingForm } from "./ShelterForms";
import { Link } from 'raviger';
import { Card, ListGroup } from 'react-bootstrap';
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
      <div style={card_style} className="card card-body bg-light mb-2 mx-auto">
        <div className="row">
          <div className="col-8">
            <p><b>Buildings</b></p>
              <ul>
                {data.buildings.map(building => (
                    <li key={building.id}>{building.name}
                      <Link href={"/shelter/building/" + building.id}> <FontAwesomeIcon icon={faClipboardList} inverse /></Link>
                    </li>
                ))}
              </ul>
          </div>
        </div>
      </div>
    )
  }


export const BuildingDetails = ({bid}) => (
  <div>
    <BuildingDetailsTable bid={bid} />
  </div>
)

export const NewBuilding = ({sid}) => (
  <div>
    <h1 style={header_style}>Buildings</h1>
    <BuildingForm sid={sid} />
  </div>
)

export const UpdateBuilding = ({bid}) => (
  <div>
    <EditBuildingForm bid={bid}/>
  </div>
)