import React, { useEffect, useState } from 'react';
import axios from "axios";
import { Link } from 'raviger';
import { Button, Col, Container, Form, FormCheck, OverlayTrigger, Row, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBandAid, faBullseye, faCar, faClipboardList, faShieldAlt, faTrailer
} from '@fortawesome/free-solid-svg-icons';
import { Circle, CircleMarker, Map, TileLayer, Tooltip as MapTooltip, useLeaflet } from "react-leaflet";
import L from "leaflet";
import shield from "../static/images/shield-alt-solid.png";
import bandaid from "../static/images/band-aid-solid.png";
import car from "../static/images/car-solid.png";
import trailer from "../static/images/trailer-solid.png";

import "../App.css";
import 'leaflet/dist/leaflet.css';

const Legend = (props) => {
  const { map } = useLeaflet();

  useEffect(() => {
    const legend = L.control.scale(props);
    legend.addTo(map);
  }, []);
  return null;
};

export function Dispatch() {

  const [data, setData] = useState({service_requests: [], isFetching: false, bounds:L.latLngBounds([[0,0]])});
  const [mapState, setMapState] = useState({});
  const [totalSelectedState, setTotalSelectedState] = useState({});
  const [selectedCount, setSelectedCount] = useState({count:0, disabled:true});
  const [statusOptions, setStatusOptions] = useState({aco_required:false});
  const [radiusCircles, setRadiusCircles] = useState({circles:[]});

  // Handle aco_required toggle.
  const handleACO = async event => {
    setStatusOptions({aco_required:!statusOptions.aco_required})
  }

  // Handle radius circle toggles.
  const handleRadius = (latitude, longitude, id) => {
    if (mapState[id].radius === "disabled") {
      setMapState(prevState => ({ ...prevState, [id]: {color:mapState[id].color, checked:mapState[id].checked, hidden:mapState[id].hidden, matches:mapState[id].matches, radius:"enabled"} }));
      setRadiusCircles(prevState => ({
        circles: [...prevState.circles, {latitude: latitude, longitude:longitude}]
      }));
    }
    else {
      setMapState(prevState => ({ ...prevState, [id]: {color:mapState[id].color, checked:mapState[id].checked, hidden:mapState[id].hidden, matches:mapState[id].matches, radius:"disabled"} }));
      setRadiusCircles(prevState => ({
        circles: prevState.circles.filter(circle => (circle.latitude != latitude && circle.longitude !=longitude) )
    }));
    }
  }

  // Handle dynamic SR state and map display when an SR is selected or deselected.
  const handleMapState = (id) => {
    // If selected.
    if (mapState[id].checked === false) {
      setMapState(prevState => ({ ...prevState, [id]: {color:"green", checked:true, hidden:mapState[id].hidden, matches:mapState[id].matches, radius:mapState[id].radius} }));
      var matches = {};
      // Add each match count to the running total state tracker.
      for (var key in mapState[id].matches) {
        var total = 0;
        if (!totalSelectedState[key]) {
          total = mapState[id].matches[key];
        } else {
          total = totalSelectedState[key] += mapState[id].matches[key];
        }
        matches[key] = total;
      }
      setTotalSelectedState(Object.assign(totalSelectedState, matches));
      // Enable DEPLOY button.
      setSelectedCount((prevState) => ({count: prevState.count + 1, disabled: false}))
    }
    // Else deselect.
    else {
      setMapState(prevState => ({ ...prevState, [id]: {color:"red", checked:false, hidden:mapState[id].hidden, matches:mapState[id].matches, radius:mapState[id].radius} }));
      // Remove matches from the running total state tracker.
      for (var key in mapState[id].matches) {
        var total = totalSelectedState[key] -= mapState[id].matches[key];;
        setTotalSelectedState(prevState => ({ ...prevState, [key]:total}));
      }
      // Disable DEPLOY button is none selected.
      var disabled = false;
      if (selectedCount.count-1 === 0) {
        disabled = true;
      }
      setSelectedCount((prevState) => ({count: prevState.count - 1, disabled: disabled}))
    }
  }

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

  // Counts the number of size/species matches for a service request.
  const countMatches = (service_request) => {
    var matches = {};

    service_request.animals.forEach((animal) => {
      if (!matches[[animal.species,animal.size]]) {
          matches[[animal.species,animal.size]] = 1;
      } else {
          matches[[animal.species,animal.size]] += 1;
      }
    });
    return matches
  }

  // Show or hide list of SRs based on current map zoom
  const onMove = event => {
    for (const service_request of data.service_requests) {
      if (mapState[service_request.id]) {
        if (!event.target.getBounds().contains(L.latLng(service_request.latitude, service_request.longitude))) {
          setMapState(prevState => ({ ...prevState, [service_request.id]: {color:mapState[service_request.id].color, checked:mapState[service_request.id].checked, hidden:true, matches:mapState[service_request.id].matches, radius:mapState[service_request.id].radius} }));
        }
        else {
          setMapState(prevState => ({ ...prevState, [service_request.id]: {color:mapState[service_request.id].color, checked:mapState[service_request.id].checked, hidden:false, matches:mapState[service_request.id].matches, radius:mapState[service_request.id].radius} }));
        }
      }
    }
  }

  // Hook for initializing data.
  useEffect(() => {
    let source = axios.CancelToken.source();
    const fetchServiceRequests = async () => {
      // Fetch ServiceRequest data.
      await axios.get('/hotline/api/servicerequests/', {
        params: {
          status: 'open',
          aco_required: statusOptions.aco_required,
          map: true
        },
        cancelToken: source.token,
      })
      .then(response => {
        setData({service_requests: response.data, isFetching: false, bounds:data.bounds});

        // Initialize map options dict with all SRs on first load.
        if (Object.keys(mapState).length === 0) {
          const map_dict = {};
          const bounds = [];
          for (const service_request of response.data) {
            const matches = countMatches(service_request);
            map_dict[service_request.id] = {color:"red", checked:false, hidden:false, matches:matches, radius:"disabled"};
            bounds.push([service_request.latitude, service_request.longitude]);
          }
          setMapState(map_dict);
          setData(prevState => ({ ...prevState, ["bounds"]:L.latLngBounds(bounds) }));
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
  }, [statusOptions]);

  return (
    <Container>
      <Row className="d-flex flex-wrap">
        <Col xs={2} className="mt-4">
          <br/>
          <FormCheck id="aco_required" name="aco_required" type="switch" label="ACO Required" checked={statusOptions.ACORequired} onChange={handleACO} />
          <hr/>
          {Object.keys(totalSelectedState).map(key => (
            <div key={key} style={{textTransform:"capitalize"}}>{prettyText(key.split(',')[1], key.split(',')[0], totalSelectedState[key])}</div>
          ))}
          <Button type="submit" className="mt-2 mb-1 btn-block" disabled={selectedCount.disabled}>DEPLOY</Button>
        </Col>
        <Col xs={10}>
          <Map className="d-block" bounds={data.bounds} onMoveEnd={onMove}>
            <Legend position="bottomright" metric={false} />
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            />
            {data.service_requests.map(service_request => (<span key={service_request.id}>
              <CircleMarker
                center={{lat:service_request.latitude, lng: service_request.longitude}}
                color={mapState[service_request.id] ? mapState[service_request.id].color : ""}
                fill={true}
                fillOpacity="1"
                onClick={() => handleMapState(service_request.id)}
                radius={5}
              >
                <MapTooltip autoPan={false}>
                  <span>
                    {mapState[service_request.id] ? <span>{Object.keys(mapState[service_request.id].matches).map((key,i) => (
                      <span key={key} style={{textTransform:"capitalize"}}>
                        {i > 0 && ", "}{prettyText(key.split(',')[1], key.split(',')[0], mapState[service_request.id].matches[key])}
                      </span>
                    ))}</span>:""}
                    <br />
                    {service_request.full_address}
                    <div>
                      {service_request.aco_required ? <img width={16} height={16} src={shield} alt="" className="mr-1" /> : ""}
                      {service_request.injured ? <img width={16} height={16} src={bandaid} alt="" className="mr-1" /> : ""}
                      {service_request.accessible ? <img width={16} height={16} src={car} alt="" className="mr-1" /> : ""}
                      {service_request.turn_around ? <img width={16} height={16} src={trailer} alt="" /> : ""}
                    </div>
                  </span>
                </MapTooltip>
              </CircleMarker>
              {radiusCircles.circles.map(circle => (
                <Circle key={circle} center={{lat:circle.latitude, lng: circle.longitude}} radius={805} />
              ))}
              </span>
            ))}
          </Map>
        </Col>
      </Row>
      {data.service_requests.map(service_request => (
        <div key={service_request.id} className="mt-2" hidden={mapState[service_request.id] && !mapState[service_request.id].checked ? mapState[service_request.id].hidden : false}>
          <div className="card-header">
            <span style={{display:"inline"}} className="custom-control-lg custom-control custom-checkbox">
              <input className="custom-control-input" type="checkbox" name={service_request.id} id={service_request.id} onChange={() => handleMapState(service_request.id)} checked={mapState[service_request.id] ? mapState[service_request.id].checked : false} />
              <label className="custom-control-label" htmlFor={service_request.id}></label>
            </span>
            {mapState[service_request.id] ?
            <span>{Object.keys(mapState[service_request.id].matches).map((key,i) => (
              <span key={key} style={{textTransform:"capitalize"}}>
                {i > 0 && ", "}{prettyText(key.split(',')[1], key.split(',')[0], mapState[service_request.id].matches[key])}
              </span>
            ))}</span>:""}
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
              <FontAwesomeIcon icon={faShieldAlt} className="ml-1"/>
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
              <FontAwesomeIcon icon={faBandAid} className="ml-1"/>
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
              <FontAwesomeIcon icon={faCar} className="ml-1"/>
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
              <FontAwesomeIcon icon={faTrailer} className="ml-1"/>
            </OverlayTrigger>
             : ""}
            <span className="ml-2">| &nbsp;{service_request.full_address}</span>
            <FontAwesomeIcon icon={faBullseye} className="ml-1" onClick={() => handleRadius(service_request.latitude, service_request.longitude, service_request.id)} />
            <Link href={"/hotline/servicerequest/" + service_request.id} target="_blank"> <FontAwesomeIcon icon={faClipboardList} inverse /></Link>
          </div>
        </div>
      ))}
    </Container>
  )
}
