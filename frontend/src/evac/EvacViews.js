import React, { useEffect, useState } from 'react';
import axios from "axios";
import { Link } from 'raviger';
import { Form, FormCheck, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBandAid, faClipboardList, faShieldAlt
} from '@fortawesome/free-solid-svg-icons';
import { Circle, Map, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";

import "../App.css";
import 'leaflet/dist/leaflet.css';

// let icon = L.icon({
//   iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
//   iconUrl: require('leaflet/dist/images/marker-icon.png'),
//   shadowUrl: require('leaflet/dist/images/marker-shadow.png')
// })

export function Dispatch() {

  const [data, setData] = useState({service_requests: [], isFetching: false, center:{lat:0, lng:0}});
  const [fillColor, setFillColor] = useState({});
  const [statusOptions, setStatusOptions] = useState({status:"open", aco_required:false});

  // Handle aco_required toggle.
  const handleACO = async event => { 
    setStatusOptions({status:statusOptions.status, aco_required:!statusOptions.aco_required})
  }

  // Handle SR checkbox selections.
  const handleCheckbox = (id, event) => {
    if (event.target.checked) {
      setFillColor(prevState => ({ ...prevState, [id]: {color:"green", checked:true} }));
    }
    else {
      setFillColor(prevState => ({ ...prevState, [id]: {color:"red", checked:false} }));
    }
  }

  // // Hook for initializing data.
  useEffect(() => {
    let source = axios.CancelToken.source();
    const fetchServiceRequests = async () => {
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
            map_dict[service_request.id] = {color:"red", checked:false}
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
              <Marker
                key={service_request.id}
                position={[
                  service_request.latitude,
                  service_request.longitude
                ]}
                // icon={icon}
                onClick={() => {
                  setFillColor(prevState => ({ ...prevState, [service_request.id]: {color:"green", checked:true} }));
                }}
              >
                <Popup>
                  <span>
                    {service_request.full_address}<br />
                    {service_request.animals.length} Animals
                  </span>
                </Popup>
                <Circle 
                  center={{lat:service_request.latitude, lng: service_request.longitude}}
                  color={fillColor[service_request.id] ? fillColor[service_request.id].color : ""}
                  fill={true}
                  fillOpacity="1"
                  radius={100}/>
              </Marker>
            ))}
          </Map>
        </div>
        <Form className="">
          <FormCheck id="aco_required" name="aco_required" type="switch" label="ACO Required" checked={statusOptions.ACORequired} onChange={handleACO} />
        </Form>
      </div>
      {data.service_requests.map(service_request => (
        <div key={service_request.id} className="mt-2">
          <div className="card-header">
            <input type="checkbox" name={service_request.id} id={service_request.id} onChange={(event) => handleCheckbox(service_request.id, event)} checked={fillColor[service_request.id] ? fillColor[service_request.id].checked : false} />
            &nbsp;{service_request.animals.length} Animals<Link href={"/hotline/servicerequest/" + service_request.id}> <FontAwesomeIcon icon={faClipboardList} inverse /></Link>
            {service_request.aco_required ?
            <OverlayTrigger
              key={"aco"}
              placement="top"
              overlay={
                <Tooltip id={`tooltip-aco`}>
                  ACO Required
                </Tooltip>
              }
            >
              <FontAwesomeIcon icon={faShieldAlt} inverse className="ml-1"/>
            </OverlayTrigger>
             : ""}
            {service_request.injured ?
            <OverlayTrigger
              key={"aco"}
              placement="top"
              overlay={
                <Tooltip id={`tooltip-aco`}>
                  Injured Animal
                </Tooltip>
              }
            >
              <FontAwesomeIcon icon={faBandAid} inverse className="ml-1"/>
            </OverlayTrigger>
             : ""}</div>
        </div>
      ))}
    </div>
  )
}
