import React, { useEffect, useState } from 'react';
import axios from "axios";
import { Link } from 'raviger';
import { Button, CardGroup } from 'reactstrap';
import { ShelterDetailsTable } from "./ShelterDetails";
import { Fab, Card } from '@material-ui/core';
import AssignmentIcon from '@material-ui/icons/Assignment';

const header_style = {
  textAlign: "center",
};

const link_style = {
  textDecoration: "none",
};

export function ShelterTable() {

  const [data, setData] = useState({shelters: [], isFetching: false});
  // Hook for initializing data.
  useEffect(() => {
    let source = axios.CancelToken.source();
    const fetchShelters = async () => {
      setData({shelters: [], isFetching: true});
      // Fetch Shelter data.
      await axios.get('http://localhost:8000/shelter/api/shelter', {
        cancelToken: source.token,
      })
      .then(response => {
        setData({shelters: response.data, isFetching: false});
      })
      .catch(error => {
        console.log(error.response);
        setData({shelters: [], isFetching: false});
      });
    };
    fetchShelters();
    // Cleanup.
    return () => {
      source.cancel();
    };
  }, []);

  return (
    <div className="ml-2 mr-2">
      {data.shelters.map(shelter => (
        <div className="mt-5">
          <div className="card-header"> Shelter: {shelter.name} #{shelter.id}<Fab color="primary" href={"/shelter/" + shelter.id} className="mb-1" style={{width:23,height:23, minHeight:23}} title="Shelter Details" aria-label="details"><AssignmentIcon style={{fontSize:10}} /></Fab>
          <div style={{width:23,height:23, minHeight:23}}> Address: {shelter.address} {shelter.apartment} {shelter.city} {shelter.state} {shelter.zip_code}</div></div>
        
          <CardGroup>
            <Card key={shelter.id}>
              <Card.Body>
                <Card.Title>Buildings</Card.Title>
              </Card.Body>
            </Card>
            <Card>
              <Card.Body>
                <Card.Title>Rooms</Card.Title>
              </Card.Body>
            </Card>
          </CardGroup>
          
        </div>
      ))}
    </div>
  )
}

export const ShelterDetails = ({sid}) => (
  <div>
    <h1 style={header_style}>Shelters</h1>
    <br/>
    <ShelterDetailsTable sid={sid} />
  </div>
)
