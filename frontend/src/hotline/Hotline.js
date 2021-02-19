import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from 'raviger';
import { Button, ButtonGroup, Col, ListGroup, Row } from 'react-bootstrap'
import { Marker, Tooltip as MapTooltip } from "react-leaflet";
import L from "leaflet";
import Moment from 'react-moment';
import Map, { countMatches, prettyText, reportedMarkerIcon, SIPMarkerIcon, UTLMarkerIcon } from "../components/Map";
import badge from "../static/images/badge-sheriff.png";
import bandaid from "../static/images/band-aid-solid.png";
import car from "../static/images/car-solid.png";
import trailer from "../static/images/trailer-solid.png";

function Hotline() {

  const [data, setData] = useState({service_requests: [], isFetching: false, bounds:L.latLngBounds([[0,0]])});
  const [mapState, setMapState] = useState({});
  const [statusOptions, setStatusOptions] = useState({status:"open", allColor: "secondary", openColor:"primary", assignedColor:"secondary", closedColor:"secondary"});

  // Hook for initializing data.
  useEffect(() => {
    let source = axios.CancelToken.source();

    const fetchServiceRequests = async () => {
      // Fetch ServiceRequest data.
      await axios.get('/hotline/api/servicerequests/', {
        params: {
          status: statusOptions.status,
          map: true
        },
        cancelToken: source.token,
      })
      .then(response => {
        setData({service_requests: response.data, isFetching: false, bounds:L.latLngBounds([[0,0]])});
        const map_dict = {};
        const bounds = [];
        for (const service_request of response.data) {
            const matches = countMatches(service_request)[0];
            let color = 'green';
            if  (service_request.status === 'assigned') {
              color = 'yellow';
            }
            else if (service_request.status === 'closed') {
              color = 'red';
            }
            map_dict[service_request.id] = {color:color, matches:matches, latitude:service_request.latitude, longitude:service_request.longitude};
          bounds.push([service_request.latitude, service_request.longitude]);
        }
        setMapState(map_dict);
        if (bounds.length > 0) {
          setData({service_requests: response.data, isFetching: false, bounds:L.latLngBounds(bounds)});
        }
      })
      .catch(error => {
        console.log(error.response);
        setData({service_requests: [], isFetching: false, bounds:L.latLngBounds([[0,0]])});
      });
    };

    fetchServiceRequests();

    // Cleanup.
    return () => {
      source.cancel();
    };
  }, [statusOptions.status]);

  return (
    <>
    <ListGroup className="p-5">
      <Link href="/hotline/workflow/owner">
        <ListGroup.Item action>OWNER CALLING</ListGroup.Item>
      </Link>
      <Link href="/hotline/workflow/reporter">
        <ListGroup.Item action>NON-OWNER CALLING</ListGroup.Item>
      </Link>
      <Link href="/hotline/workflow/first_responder">
        <ListGroup.Item action>FIRST RESPONDER CALLING</ListGroup.Item>
      </Link>
      <Link href="/hotline/servicerequest/search">
        <ListGroup.Item action>SEARCH SERVICE REQUESTS</ListGroup.Item>
      </Link>
    </ListGroup>
    <Row className="d-flex flex-wrap">
      <Col xs={10} className="border rounded pl-0 pr-0 m-auto">
        <Map bounds={data.bounds}>
          {data.service_requests.map(service_request => (
            <Marker
              position={[service_request.latitude, service_request.longitude]}
              icon={service_request.sheltered_in_place > 0 ? SIPMarkerIcon : service_request.unable_to_locate > 0 ? UTLMarkerIcon : reportedMarkerIcon}
              onClick={() => window.open("/hotline/servicerequest/" + service_request.id, "_blank")}
            >
              <MapTooltip autoPan={false}>
                <span>
                  {mapState[service_request.id] ?
                    <span>
                      {Object.keys(mapState[service_request.id].matches).map((key,i) => (
                        <span key={key} style={{textTransform:"capitalize"}}>
                          {i > 0 && ", "}{prettyText(key.split(',')[1], key.split(',')[0], mapState[service_request.id].matches[key])}
                        </span>
                      ))}
                    </span>
                  :""}
                  <br />
                  {service_request.full_address}
                  {service_request.followup_date ? <div>Followup Date: <Moment format="L">{service_request.followup_date}</Moment></div> : ""}
                  <div>
                    {service_request.aco_required ? <img width={16} height={16} src={badge} alt="" className="mr-1" /> : ""}
                    {service_request.injured ? <img width={16} height={16} src={bandaid} alt="" className="mr-1" /> : ""}
                    {service_request.accessible ? <img width={16} height={16} src={car} alt="" className="mr-1" /> : ""}
                    {service_request.turn_around ? <img width={16} height={16} src={trailer} alt="" /> : ""}
                  </div>
                </span>
              </MapTooltip>
            </Marker>
          ))}
        </Map>
        <ButtonGroup>
          <Button variant={statusOptions.allColor} onClick={() => setStatusOptions({status:"all", allColor:"primary", openColor:"secondary", assignedColor:"secondary", closedColor:"secondary"})}>All</Button>
          <Button variant={statusOptions.openColor} onClick={() => setStatusOptions({status:"open", allColor:"secondary", openColor:"primary", assignedColor:"secondary", closedColor:"secondary"})}>Open</Button>
          <Button variant={statusOptions.assignedColor} onClick={() => setStatusOptions({status:"assigned", allColor:"secondary", openColor:"secondary", assignedColor:"primary", closedColor:"secondary"})}>Assigned</Button>
          <Button variant={statusOptions.closedColor} onClick={() => setStatusOptions({status:"closed", allColor:"secondary", openColor:"secondary", assignedColor:"secondary", closedColor:"primary"})}>Closed</Button>
        </ButtonGroup>
      </Col>
    </Row>
  </>
  )
}

export default Hotline
