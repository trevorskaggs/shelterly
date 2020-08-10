import React, { useEffect, useState } from 'react';
import axios from "axios";
import { Link } from 'raviger';
import { Button, ButtonGroup, Card, CardGroup, Col, Form, FormCheck, FormControl, InputGroup, ListGroup} from 'react-bootstrap';
import Moment from 'react-moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClipboardList, faShieldAlt
} from '@fortawesome/free-solid-svg-icons';
import { Label } from 'reactstrap';
import { Map, Marker, Popup, TileLayer } from "react-leaflet";
import L, { Icon } from "leaflet";

import "../App.css";
import 'leaflet/dist/leaflet.css';
// import * as parkData from "./data/skateboard-parks.json";

// export default function App() {
//   return (
//     <Map center={[45.4, -75.7]} zoom={12}>
//       <TileLayer
//         url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//         attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
//       />
//     </Map>
//   );
// }

let icon = L.icon({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
})

export function Dispatch() {

  const [data, setData] = useState({service_requests: [], isFetching: false, center:{lat:0, lng:0}});
  // const [searchTerm, setSearchTerm] = useState("");
  const [statusOptions, setStatusOptions] = useState({status:"open", aco_required:false});

  // Handle aco_required toggle.
  const handleChange = async event => { 
    setStatusOptions({status:statusOptions.status, aco_required:!statusOptions.aco_required})
  }

  // // Hook for initializing data.
  useEffect(() => {
    let source = axios.CancelToken.source();
    const fetchServiceRequests = async () => {
      setData({service_requests: [], isFetching: true, center:{lat:0, lng:0}});
      // Fetch ServiceRequest data.
      await axios.get('/hotline/api/servicerequests/?status=' + statusOptions.status + '&aco_required=' + (statusOptions.aco_required + ""), {
        cancelToken: source.token,
      })
      .then(response => {
        setData({service_requests: response.data, isFetching: false, center:{lat:response.data[0].latitude, lng:response.data[0].longitude}});
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
                icon={icon}
                // onClick={() => {
                //   setActivePark(park);
                // }}
              />
            ))}
          </Map>
        </div>
        <Form className="">
          <FormCheck id="aco_required" name="aco_required" type="switch" label="ACO Required" checked={statusOptions.ACORequired} onChange={handleChange} />
        </Form>
      </div>
      {data.service_requests.map(service_request => (
        <div key={service_request.id} className="mt-3">
          <div className="card-header"><input type="checkbox"/> {service_request.animals.length} Animals<Link href={"/hotline/servicerequest/" + service_request.id}> <FontAwesomeIcon icon={faClipboardList} inverse /></Link>
          {service_request.aco_required ? <FontAwesomeIcon icon={faShieldAlt} inverse className="ml-1"/> : ""}</div>
        </div>
      ))}
    </div>
  )
}
