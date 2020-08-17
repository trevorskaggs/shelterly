import React, { useEffect, useState } from 'react';
import axios from "axios";
import { Link } from 'raviger';
import { Button, Form, FormCheck, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBandAid, faCar, faClipboardList, faShieldAlt, faTrailer
} from '@fortawesome/free-solid-svg-icons';
import { CircleMarker, Map, Popup, TileLayer } from "react-leaflet";

import "../App.css";
import 'leaflet/dist/leaflet.css';

export function Dispatch() {

  const [data, setData] = useState({service_requests: [], isFetching: false, center:{lat:0, lng:0}});
  const [fillColor, setFillColor] = useState({});
  const [statusOptions, setStatusOptions] = useState({status:"open", aco_required:false});

  // Handle aco_required toggle.
  const handleACO = async event => { 
    setStatusOptions({status:statusOptions.status, aco_required:!statusOptions.aco_required})
  }

  // Handle dynamic SR state and map display.
  const handleMapState = (id) => {
    if (fillColor[id].checked === false) {
      setFillColor(prevState => ({ ...prevState, [id]: {color:"green", checked:true} }));
    }
    else {
      setFillColor(prevState => ({ ...prevState, [id]: {color:"red", checked:false} }));
    }
  }

  // Count animals of the same species and the same size for an SR.
  const countMatching = (service_request, size, species) => {
    const countMatches = service_request.animals.filter(animal => animal.size === size && animal.species === species);
    var size_and_species = size;
    if (species !== 'horse') {
      size_and_species = size + " " + species;
    }
    var plural = ""
    if (countMatches.length > 1) {
      plural = "s"
    }
    var text = countMatches.length + " " + size_and_species + plural;
    return text;
  }

  // Hook for initializing data.
  useEffect(() => {
    let source = axios.CancelToken.source();
    const fetchServiceRequests = async () => {
      // Use stored coords if we already have them, otherwise initialize coords.
      var coords = {}
      if (data.center.lat !== 0) {
        coords = data.center
      }
      else {
        coords = {lat:0, lng:0}
      }
      setData({service_requests: [], isFetching: true, center:coords});
      // Fetch ServiceRequest data.
      await axios.get('/hotline/api/servicerequests/?status=' + statusOptions.status + '&aco_required=' + (statusOptions.aco_required + ""), {
        cancelToken: source.token,
      })
      .then(response => {
        setData({service_requests: response.data, isFetching: false, center:{lat:response.data[0].latitude, lng:response.data[0].longitude}});

        // Initialize map options dict with all SRs on first load.
        if (Object.keys(fillColor).length === 0) {
          const map_dict = {};
          for (const service_request of response.data) {
            map_dict[service_request.id] = {color:"red", checked:false};

          }
          setFillColor(map_dict);
        }
      })
      .catch(error => {
        console.log(error.response);
        setData({service_requests: [], isFetching: false, center:{lat:0, lng:0}});
      });
    };
    fetchServiceRequests();

    // Cleanup.
    return () => {
      source.cancel();
    };
  }, [statusOptions]);

  return (
    <div className="container">
      <div className="row">
        <div className="col-12">
          <Map className="mx-auto d-block" center={data.center} zoom={12}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            />
            {data.service_requests.map(service_request => (
              <CircleMarker
                key={service_request.id}
                center={{lat:service_request.latitude, lng: service_request.longitude}}
                color={fillColor[service_request.id] ? fillColor[service_request.id].color : ""}
                fill={true}
                fillOpacity="1"
                onClick={() => handleMapState(service_request.id)}
                radius={5}
              >
                <Popup>
                  <span>
                    {service_request.full_address}<br />
                    {service_request.animals.map(animal => (
                      <span key={animal.id}>
                        {animal.size} {animal.species}
                      </span>
                    ))}
                  </span>
                </Popup>
              </CircleMarker>
            ))}
          </Map>
        </div>
        <Form>
          <FormCheck id="aco_required" name="aco_required" type="switch" label="ACO Required" checked={statusOptions.ACORequired} onChange={handleACO} />
          <Button type="submit" className="mt-2 mb-1">Deploy!</Button>
        </Form>
      </div>
      {data.service_requests.map(service_request => (
        <div key={service_request.id} className="mt-2">
          <div className="card-header">
            <span style={{display:"inline"}} className="custom-control-lg custom-control custom-checkbox">
              <input className="custom-control-input" type="checkbox" name={service_request.id} id={service_request.id} onChange={() => handleMapState(service_request.id)} checked={fillColor[service_request.id] ? fillColor[service_request.id].checked : false} />
              <label className="custom-control-label" htmlFor={service_request.id}></label>
            </span>
            {service_request.animals.filter((animal,i,animals)=>animals.findIndex(a=>(a.species === animal.species && a.size===animal.size))===i).map((animal, i) => (
              <span key={animal.id} style={{textTransform:"capitalize"}}>
                {i > 0 && ", "}{countMatching(service_request, animal.size, animal.species)}
              </span>
            ))}
            {service_request.aco_required ?
            <OverlayTrigger
              key={"aco"}
              placement="top"
              overlay={
                <Tooltip id={`tooltip-aco`}>
                  ACO required
                </Tooltip>
              }
            >
              <FontAwesomeIcon icon={faShieldAlt} inverse className="ml-1"/>
            </OverlayTrigger>
             : ""}
            {service_request.injured ?
            <OverlayTrigger
              key={"injured"}
              placement="top"
              overlay={
                <Tooltip id={`tooltip-injured`}>
                  Injured animal
                </Tooltip>
              }
            >
              <FontAwesomeIcon icon={faBandAid} inverse className="ml-1"/>
            </OverlayTrigger>
             : ""}
            {service_request.accessible ?
            <OverlayTrigger
              key={"accessible"}
              placement="top"
              overlay={
                <Tooltip id={`tooltip-accessible`}>
                  Easily accessible
                </Tooltip>
              }
            >
              <FontAwesomeIcon icon={faCar} inverse className="ml-1"/>
            </OverlayTrigger>
             : ""}
            {service_request.turn_around ?
            <OverlayTrigger
              key={"turnaround"}
              placement="top"
              overlay={
                <Tooltip id={`tooltip-turnaround`}>
                  Room to turn around
                </Tooltip>
              }
            >
              <FontAwesomeIcon icon={faTrailer} inverse className="ml-1"/>
            </OverlayTrigger>
             : ""}
            <span className="ml-2">| &nbsp;{service_request.full_address}</span>
            <Link href={"/hotline/servicerequest/" + service_request.id}> <FontAwesomeIcon icon={faClipboardList} inverse /></Link>
          </div>
        </div>
      ))}
    </div>
  )
}
