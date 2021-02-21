import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from 'raviger';
import { Col, ListGroup, Row } from 'react-bootstrap'
import { CircleMarker, Map, TileLayer, Tooltip as MapTooltip } from "react-leaflet";
import L from "leaflet";
import Moment from 'react-moment';
import randomColor from "randomcolor";
import { Legend } from "../components/Map";
import Header from "../components/Header";
import badge from "../static/images/badge-sheriff.png";
import bandaid from "../static/images/band-aid-solid.png";
import car from "../static/images/car-solid.png";
import trailer from "../static/images/trailer-solid.png";

function Dispatch() {

  const [data, setData] = useState({dispatch_assignments: [], isFetching: false, bounds:L.latLngBounds([[0,0]])});
  const [mapState, setMapState] = useState({});

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
    let source = axios.CancelToken.source();

    const fetchServiceRequests = async () => {

      // Fetch open DA data.
      axios.get('/evac/api/evacassignment/', {
        params: {
          status: 'open',
          map: true
        },
        cancelToken: source.token,
      })
      .then(response => {
        const map_dict = {};
        const bounds = [];
        const random_colors = randomColor({count:response.data.length});
        response.data.forEach((dispatch_assignment, index) => {
          let sr_dict = {}
          for (const service_request of dispatch_assignment.service_request_objects) {
            const matches = countMatches(service_request);
            sr_dict[service_request.id] = {id:service_request.id, matches:matches, latitude:service_request.latitude, longitude:service_request.longitude, assigned_evac:service_request.assigned_evac.id, full_address:service_request.full_address};
            bounds.push([service_request.latitude, service_request.longitude]);
          }
          map_dict[dispatch_assignment.id] = {color:random_colors[index], service_requests:sr_dict}
        });
        setMapState(map_dict);
        setData({dispatch_assignments: response.data, isFetching: false, bounds:L.latLngBounds(bounds)});
      })
      .catch(error => {
        console.log(error.response);
        setData({dispatch_assignments: [], isFetching: false, bounds:L.latLngBounds([[0,0]])});
      });
    };

    fetchServiceRequests();

    // Cleanup.
    return () => {
      source.cancel();
    };
  }, []);

  return (
    <>
    <Header>Dispatch</Header>
    <hr/>
    <Row className="mr-0">
      <Col xs={4}>
        <ListGroup className="flex-fill pb-3">
          <Link href="/dispatch/dispatchteammember/new">
            <ListGroup.Item className="rounded" action>ADD TEAM MEMBER</ListGroup.Item>
          </Link>
          <Link href="/dispatch/deploy">
            <ListGroup.Item className="rounded" action>DEPLOY TEAMS</ListGroup.Item>
          </Link>
          <Link href="/dispatch/dispatchassignment/search">
            <ListGroup.Item className="rounded" action>SEARCH DISPATCH ASSIGNMENTS</ListGroup.Item>
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
          {data.dispatch_assignments.map(dispatch_assignment => (
          <span key={dispatch_assignment.id}>
            {dispatch_assignment.service_request_objects.map(service_request => (
            <CircleMarker
              key={service_request.id}
              center={{lat:service_request.latitude, lng: service_request.longitude}}
              color="black"
              weight="1"
              fillColor={mapState[dispatch_assignment.id] ? mapState[dispatch_assignment.id].color : ""}
              fill={true}
              fillOpacity="1"
              onClick={() => window.open("/dispatch/summary/" + dispatch_assignment.id, "_blank")}
              radius={5}
            >
              <MapTooltip autoPan={false}>
                <span>
                  {mapState[dispatch_assignment.id] ?
                    <span>
                      {Object.keys(mapState[dispatch_assignment.id].service_requests[service_request.id].matches).map((key,i) => (
                        <span key={key} style={{textTransform:"capitalize"}}>
                          {i > 0 && ", "}{prettyText(key.split(',')[1], key.split(',')[0], mapState[dispatch_assignment.id].service_requests[service_request.id].matches[key])}
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
          </span>
          ))}
        </Map>
      </Col>
    </Row>
    </>
  )
}

export default Dispatch
