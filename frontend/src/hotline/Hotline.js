import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from 'raviger';
import { Button, ButtonGroup, Col, ListGroup, Row } from 'react-bootstrap';
import { CircleMarker, Map, TileLayer, Tooltip as MapTooltip } from "react-leaflet";
import L from "leaflet";
import Moment from 'react-moment';
import { Legend } from "../components/Map";
import Header from "../components/Header";
import badge from "../static/images/badge-sheriff.png";
import bandaid from "../static/images/band-aid-solid.png";
import car from "../static/images/car-solid.png";
import trailer from "../static/images/trailer-solid.png";

function Hotline() {

  const [data, setData] = useState({service_requests: [], isFetching: false, bounds:L.latLngBounds([[0,0]])});
  const [mapState, setMapState] = useState({});
  const [statusOptions, setStatusOptions] = useState({status:"open", allColor: "secondary", openColor:"primary", assignedColor:"secondary", closedColor:"secondary"});

  // Takes in animal size, species, and count and returns a pretty string combination.
  const prettyText = (size, species, count) => {
    if (count <= 0) {
      return "";
    }
    var plural = ""
    if (count > 1) {
      plural = "s"
    }

    var size_and_species = size + " " + species + plural;
    // Exception for horses since they don't need an extra species output.
    if (species === 'horse') {
      // Exception for pluralizing ponies.
      if (size === 'pony' && count > 1) {
        size_and_species = 'ponies'
      }
      else {
        size_and_species = size + plural;
      }
    }

    var text = count + " " + size_and_species;
    return text;
  }

  // Counts the number of size/species matches for a service request by status.
  const countMatches = (service_request) => {
    var matches = {};

    service_request.animals.forEach((animal) => {
      if (!matches[[animal.species,animal.size]]) {
        matches[[animal.species,animal.size]] = 1;
      }
      else {
        matches[[animal.species,animal.size]] += 1;
      }
    });
    return matches
  }

  // Hook for initializing data.
  useEffect(() => {
    let unmounted = false;
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
        if (!unmounted) {
          setData({service_requests: response.data, isFetching: false, bounds:L.latLngBounds([[0,0]])});
          const map_dict = {};
          const bounds = [];
          for (const service_request of response.data) {
              const matches = countMatches(service_request);
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
        }
      })
      .catch(error => {
        if (!unmounted) {
          console.log(error.response);
          setData({service_requests: [], isFetching: false, bounds:L.latLngBounds([[0,0]])});
        }
      });
    };

    fetchServiceRequests();

    // Cleanup.
    return () => {
      unmounted = true;
      source.cancel();
    };
  }, [statusOptions.status]);

  return (
    <>
    <Header>Hotline</Header>
    <hr/>
    <Row className="mr-0">
      <Col xs={4}>
        <ListGroup className="pb-3">
          <Link href="/hotline/workflow/owner">
            <ListGroup.Item className="rounded" action>OWNER CALLING</ListGroup.Item>
          </Link>
          <Link href="/hotline/workflow/reporter">
            <ListGroup.Item className="rounded" action>NON-OWNER CALLING</ListGroup.Item>
          </Link>
          <Link href="/hotline/workflow/first_responder">
            <ListGroup.Item className="rounded" action>FIRST RESPONDER CALLING</ListGroup.Item>
          </Link>
          <Link href="/hotline/servicerequest/search">
            <ListGroup.Item className="rounded" action>SEARCH SERVICE REQUESTS</ListGroup.Item>
          </Link>
        </ListGroup>
      </Col>
      <Col xs={8} className="border rounded pl-0 pr-0">
        <Map className="d-block" bounds={data.bounds} className="landing-leaflet-container">
          <Legend position="bottomleft" metric={false} />
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          />
          {data.service_requests.map(service_request => (
            <CircleMarker
              key={service_request.id}
              center={{lat:service_request.latitude, lng: service_request.longitude}}
              color="black"
              weight="1"
              fillColor={mapState[service_request.id] ? mapState[service_request.id].color : ""}
              fill={true}
              fillOpacity="1"
              onClick={() => window.open("/hotline/servicerequest/" + service_request.id, "_blank")}
              radius={5}
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
            </CircleMarker>
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
