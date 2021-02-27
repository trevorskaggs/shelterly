import React, { useState, useEffect } from "react";
import ReactDOMServer from 'react-dom/server';
import axios from "axios";
import { Link, navigate } from 'raviger';
import { Button, Col, Collapse, OverlayTrigger, Row, Tooltip } from 'react-bootstrap';
import { CircleMarker, Map, Marker, TileLayer, Tooltip as MapTooltip } from "react-leaflet";
import L from "leaflet";
import Moment from 'react-moment';
import randomColor from "randomcolor";
import { Legend } from "../components/Map";
import { Checkbox } from "../components/Form"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronCircleDown, faChevronCircleRight, faClipboardList, faStar
} from '@fortawesome/free-solid-svg-icons';
import { faRectanglePortrait } from '@fortawesome/pro-solid-svg-icons';
import { faCheckCircle } from '@fortawesome/pro-duotone-svg-icons';
import badge from "../static/images/badge-sheriff.png";
import bandaid from "../static/images/band-aid-solid.png";
import car from "../static/images/car-solid.png";
import trailer from "../static/images/trailer-solid.png";

function ServiceRequestDispatchAssignment({id}) {

  const [currentRequest, setCurrentRequest] = useState({id:'', matches: {}, latitude:0, longitude:0, followup_date:'', latest_evac:{id:0, start_time:null, end_time:null}});
  const [data, setData] = useState({dispatch_assignments: [], isFetching: false, bounds:L.latLngBounds([[0,0]])});
  const [mapState, setMapState] = useState({});
  const [selected, setSelected] = useState(null);
  const [showSRs, setShowSRs] = useState({});

  // Takes in dispatch ID,
  const updateShowSRs = (dispatch_id) => {
    let tempSRs = {...showSRs};
    tempSRs[dispatch_id] = !showSRs[dispatch_id];
    setShowSRs(tempSRs);
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

  // Show or hide list of DAs based on current map zoom
  const onMove = event => {
    for (const dispatch_assignment of data.dispatch_assignments) {
      let hidden = true;
      for (const service_request of dispatch_assignment.service_request_objects) {
        if (mapState[dispatch_assignment.id].service_requests[service_request.id]) {
          if (event.target.getBounds().contains(L.latLng(service_request.latitude, service_request.longitude))) {
            hidden = false;
          }
        }
      }
      setMapState(prevState => ({ ...prevState, [dispatch_assignment.id]: {...prevState[dispatch_assignment.id], hidden:hidden} }));
    }
  }

  // Handle dynamic SR state and map display when an SR is selected or deselected.
  const handleMapState = (id) => {

    // If selected.
    if (mapState[id].checked === false) {
      const tempMapState = {...mapState};

      // Deselect any other selected DA SRs.
      Object.keys(tempMapState).filter(key => tempMapState[key].checked === true).forEach(key => {
        tempMapState[key] = {...tempMapState[key], "checked":false};
      });
      tempMapState[id] = {...tempMapState[id], "checked":true};
      setMapState(tempMapState)
      setSelected(id);
    }
    // Else deselect.
    else {
      setMapState(prevState => ({ ...prevState, [id]: {...prevState[id], "checked":false} }));
      setSelected(null);
    }
  }

  const handleSubmit = () => {
    axios.patch('/evac/api/evacassignment/' + selected + '/', {new_service_request:currentRequest.id})
    .then(response => {
      navigate('/dispatch/summary/' + selected)
    })
    .catch(error => {
      console.log(error.response);
    });
  }

  // Hook for initializing data.
  useEffect(() => {
    let source = axios.CancelToken.source();

    const fetchServiceRequests = async () => {

      // Fetch current ServiceRequest data.
      await axios.get('/hotline/api/servicerequests/' + id + '/', {
        cancelToken: source.token,
      })
      .then(currentResponse => {

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
              sr_dict[service_request.id] = {id:service_request.id, matches:matches, latitude:service_request.latitude, longitude:service_request.longitude, latest_evac:service_request.latest_evac, full_address:service_request.full_address};
              bounds.push([service_request.latitude, service_request.longitude]);
            }
            map_dict[dispatch_assignment.id] = {checked:(currentResponse.data.latest_evac !== null) && (currentResponse.data.latest_evac.end_time === null) && (currentResponse.data.latest_evac.id === dispatch_assignment.id), hidden: false, color:random_colors[index], service_requests:sr_dict}
          });
          const current_matches = countMatches(currentResponse.data);
          currentResponse.data['matches'] = current_matches;
          setCurrentRequest(currentResponse.data);
          bounds.push([currentResponse.data.latitude, currentResponse.data.longitude]);
          setMapState(map_dict);
          setData({dispatch_assignments: response.data, isFetching: false, bounds:L.latLngBounds(bounds)});
        })
        .catch(error => {
          console.log(error.response);
          setData({dispatch_assignments: [], isFetching: false, bounds:L.latLngBounds([[0,0]])});
        });
      })
    };

    // fetchCurrentRequest();
    fetchServiceRequests();

    // Cleanup.
    return () => {
      source.cancel();
    };
  }, [id]);

  const starIconHTML = ReactDOMServer.renderToString(<FontAwesomeIcon color="gold" size="lg" className="icon-border" icon={faStar} />);
  const starMarkerIcon = new L.DivIcon({
    html: starIconHTML,
    iconSize: [0, 0],
    iconAnchor: [9, 10],
    className: "star-icon",
    popupAnchor: null,
    shadowUrl: null,
    shadowSize: null,
    shadowAnchor: null
  });

  const checkIconHTML = ReactDOMServer.renderToString(<FontAwesomeIcon icon={faCheckCircle} className="icon-border" style={{"--fa-primary-color":'white', "--fa-secondary-color":'green', "--fa-secondary-opacity": 1}} />);
  const checkMarkerIcon = new L.DivIcon({
    html: checkIconHTML,
    iconSize: [0, 0],
    iconAnchor: [6,9],
    className: "check-icon",
    popupAnchor: null,
    shadowUrl: null,
    shadowSize: null,
    shadowAnchor: null
  });

  const checkIconHTMLGray = ReactDOMServer.renderToString(<FontAwesomeIcon icon={faCheckCircle} className="icon-border" style={{"--fa-primary-color":'white', "--fa-secondary-color":'gray', "--fa-secondary-opacity": 1}} />);
  const checkMarkerIconGray = new L.DivIcon({
    html: checkIconHTMLGray,
    iconSize: [0, 0],
    iconAnchor: [6,9],
    className: "check-icon-gray",
    popupAnchor: null,
    shadowUrl: null,
    shadowSize: null,
    shadowAnchor: null
  });

  return (
    <>
    <Row className="d-flex flex-wrap mt-3">
      <Col xs={12} className="border rounded pl-0 pr-0">
        <Map className="d-block" bounds={data.bounds} onMoveEnd={onMove}>
          <Legend position="bottomleft" metric={false} />
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          />
          <Marker
            position={[currentRequest.latitude, currentRequest.longitude]}
            icon={starMarkerIcon}
            onClick={() => window.open("/hotline/servicerequest/" + currentRequest.id, "_blank")}
          >
            <MapTooltip autoPan={false}>
              <span>
                {currentRequest.id ?
                  <span>
                    {Object.keys(currentRequest.matches).map((key,i) => (
                      <span key={key} style={{textTransform:"capitalize"}}>
                        {i > 0 && ", "}{prettyText(key.split(',')[1], key.split(',')[0], currentRequest.matches[key])}
                      </span>
                    ))}
                  </span>
                :""}
                <br />
                {currentRequest.full_address}
                {currentRequest.followup_date ? <div>Followup Date: <Moment format="L">{currentRequest.followup_date}</Moment></div> : ""}
                <div>
                  {currentRequest.aco_required ? <img width={16} height={16} src={badge} alt="" className="mr-1" /> : ""}
                  {currentRequest.injured ? <img width={16} height={16} src={bandaid} alt="" className="mr-1" /> : ""}
                  {currentRequest.accessible ? <img width={16} height={16} src={car} alt="" className="mr-1" /> : ""}
                  {currentRequest.turn_around ? <img width={16} height={16} src={trailer} alt="" /> : ""}
                </div>
              </span>
            </MapTooltip>
          </Marker>
          {data.dispatch_assignments.filter(dispatch_assignment => mapState[dispatch_assignment.id].checked === false && (currentRequest.latest_evac ? (dispatch_assignment.id !== currentRequest.latest_evac.id) : true)).map(dispatch_assignment => (
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
              onClick={() => handleMapState(service_request.latest_evac.id)}
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
          {Object.entries(mapState).filter(([key, value]) => (value.checked === true || (currentRequest.latest_evac && (Number(key) === currentRequest.latest_evac.id)))).map(([key, value]) => (
            <span key={key}>
            {Object.entries(value.service_requests).filter(([sr_id, service_request]) => (Number(sr_id) !== currentRequest.id)).map(([sr_id, service_request]) => (
              <Marker
                key={service_request.id} 
                position={[service_request.latitude, service_request.longitude]}
                icon={currentRequest.latest_evac && Number(key) === currentRequest.latest_evac.id ? checkMarkerIconGray : checkMarkerIcon}
                onClick={currentRequest.latest_evac ? (Number(key) === currentRequest.latest_evac.id) : true ? () => handleMapState(service_request.latest_evac.id) : undefined}
              >
                <MapTooltip autoPan={false}>
                  <span>
                    {service_request.id ?
                      <span>
                        {Object.keys(service_request.matches).map((key,i) => (
                          <span key={key} style={{textTransform:"capitalize"}}>
                            {i > 0 && ", "}{prettyText(key.split(',')[1], key.split(',')[0], service_request.matches[key])}
                          </span>
                        ))}
                      </span>
                    :""}
                    <br />
                    {service_request.full_address}
                    {service_request.followup_date ? <div>Followup Date: <Moment format="L">{service_request.followup_date}</Moment></div> : ""}
                  </span>
                </MapTooltip>
              </Marker>
            ))}
            </span>
          ))}
        </Map>
      </Col>
    </Row>
    <Row className="mt-2 mb-3" style={{marginRight:"-18px"}}>
      <Col xs={2} className="pl-0" style={{marginLeft:"-2px", paddingRight:"7px"}}>
        <Button onClick={() => handleSubmit()} className="btn-block" disabled={selected === null}>ASSIGN</Button>
      </Col>
      <Col xs={10} className="pl-0 pr-0">
        <div className="card-header d-flex align-items-center rounded" style={{height:"37px"}}><b style={{marginLeft:"-10px"}}>
          Service Request:</b>&nbsp;
            {Object.keys(currentRequest.matches).map((key,i) => (
              <span key={key} style={{textTransform:"capitalize"}}>
                {i > 0 && ", "}{prettyText(key.split(',')[1], key.split(',')[0], currentRequest.matches[key])}
              </span>
            ))}
          &nbsp;| {currentRequest.full_address}</div>
      </Col>
    </Row>
    <Row className="d-flex flex-wrap" style={{marginTop:"-8px", marginRight:"-19px", marginLeft:"-17px", minHeight:"36vh", paddingRight:"4px"}}>
      <Col xs={12} className="border rounded" style={{marginLeft:"1px", height:"36vh", overflowY:"auto", paddingRight:"-1px"}}>
        {currentRequest.latest_evac && data.dispatch_assignments.filter(dispatch_assignment => dispatch_assignment.id === currentRequest.latest_evac.id).map(dispatch_assignment => (
        <div className="mt-1 mb-1" style={{marginLeft:"-10px", marginRight:"-10px"}}>
          <div className="card-header rounded">
            <Checkbox
              id={dispatch_assignment.id}
              name={dispatch_assignment.id}
              checked={mapState[dispatch_assignment.id] ? mapState[dispatch_assignment.id].checked : false}
              style={{
                transform: "scale(1.25)",
                marginLeft: "-14px",
                marginTop: "-5px",
                marginBottom: "-5px"
              }}
              disabled={true}
            />
            <FontAwesomeIcon icon={faRectanglePortrait} className="icon-thin mr-1" color="gray" style={{marginLeft:"-9px", marginBottom:"-2px"}} />
            <span>Active Dispatch Assignment</span>
            <OverlayTrigger
              key={"assignment-summary"}
              placement="top"
              overlay={
                <Tooltip id={`tooltip-assignment-summary`}>
                  Dispatch assignment summary
                </Tooltip>
              }
            >
              <Link href={"/dispatch/summary/" + dispatch_assignment.id} target="_blank"><FontAwesomeIcon icon={faClipboardList} className="ml-1" inverse /></Link>
            </OverlayTrigger>&nbsp;&nbsp;|&nbsp;
            Team Members: {dispatch_assignment.team_member_objects.map((member, i) => (
                <span key={member.id}>{i > 0 && ", "}{member.first_name} {member.last_name}</span>))}
            &nbsp;|&nbsp;Service Requests<FontAwesomeIcon icon={faChevronCircleRight} hidden={showSRs[dispatch_assignment.id]} onClick={() => updateShowSRs(dispatch_assignment.id)} className="ml-1 fa-move-up" style={{verticalAlign:"middle"}} inverse /><FontAwesomeIcon icon={faChevronCircleDown} hidden={!showSRs[dispatch_assignment.id]} onClick={() => updateShowSRs(dispatch_assignment.id)} className="ml-1 fa-move-up" style={{verticalAlign:"middle"}} inverse />
            {dispatch_assignment.service_request_objects.map(service_request => (
            <Collapse key={service_request.id} in={showSRs[dispatch_assignment.id]}>
              <span>
                {mapState[dispatch_assignment.id] ?
                <li className="mt-1 mb-1" style={{marginLeft:"15%", marginRight:"-10px"}}>
                    {mapState[dispatch_assignment.id].service_requests[service_request.id] ?
                    <span>
                      {Object.keys(mapState[dispatch_assignment.id].service_requests[service_request.id].matches).map((key,i) => (
                        <span key={key} style={{textTransform:"capitalize"}}>
                          {i > 0 && ", "}{prettyText(key.split(',')[1], key.split(',')[0], mapState[dispatch_assignment.id].service_requests[service_request.id].matches[key])}
                        </span>
                      ))}
                    </span>
                    :""}
                    &nbsp;|&nbsp;{service_request.full_address}
                    <OverlayTrigger
                      key={"request-details"}
                      placement="top"
                      overlay={
                        <Tooltip id={`tooltip-request-details`}>
                          Service request details
                        </Tooltip>
                      }
                    >
                      <Link href={"/hotline/servicerequest/" + service_request.id} target="_blank"><FontAwesomeIcon icon={faClipboardList} className="ml-1" inverse /></Link>
                    </OverlayTrigger>
                </li>
                : ""}
              </span>
            </Collapse>
            ))}
          </div>
        </div>
        ))}
        {data.dispatch_assignments.filter(dispatch_assignment => (mapState[dispatch_assignment.id].hidden === false) && (currentRequest.latest_evac ? (dispatch_assignment.id !== currentRequest.latest_evac.id) : true)).map((dispatch_assignment, index) => (
        <span key={dispatch_assignment.id}>
          <div className="mt-1 mb-1" style={{marginLeft:"-10px", marginRight:"-10px"}}>
            <div className="card-header rounded" style={{height:""}}>
              <Checkbox
                id={String(dispatch_assignment.id)}
                name={String(dispatch_assignment.id)}
                checked={mapState[dispatch_assignment.id] ? mapState[dispatch_assignment.id].checked : false}
                onChange={() => handleMapState(dispatch_assignment.id)}
                style={{
                  transform: "scale(1.25)",
                  marginLeft: "-14px",
                  marginTop: "-5px",
                  marginBottom: "-5px"
                }}
              />
              <FontAwesomeIcon icon={faRectanglePortrait} className="icon-thin mr-1" color={mapState[dispatch_assignment.id].color} style={{marginLeft:"-9px", marginBottom:"-2px"}} />
              <span>Dispatch Assignment #{index+1}</span>
              <OverlayTrigger
                key={"assignment-summary"}
                placement="top"
                overlay={
                  <Tooltip id={`tooltip-assignment-summary`}>
                    Dispatch assignment summary
                  </Tooltip>
                }
              >
                <Link href={"/dispatch/summary/" + dispatch_assignment.id} target="_blank"><FontAwesomeIcon icon={faClipboardList} className="ml-1" inverse /></Link>
              </OverlayTrigger>&nbsp;&nbsp;|&nbsp;
              Team Members: {dispatch_assignment.team_member_objects.map((member, i) => (
                  <span key={member.id}>{i > 0 && ", "}{member.first_name} {member.last_name}</span>))}
              &nbsp;|&nbsp;Service Requests<FontAwesomeIcon icon={faChevronCircleRight} hidden={showSRs[dispatch_assignment.id]} onClick={() => updateShowSRs(dispatch_assignment.id)} className="ml-1 fa-move-up" style={{verticalAlign:"middle"}} inverse /><FontAwesomeIcon icon={faChevronCircleDown} hidden={!showSRs[dispatch_assignment.id]} onClick={() => updateShowSRs(dispatch_assignment.id)} className="ml-1 fa-move-up" style={{verticalAlign:"middle"}} inverse />
              {dispatch_assignment.service_request_objects.map(service_request => (
              <Collapse key={service_request.id} in={showSRs[dispatch_assignment.id]}>
                <span>
                  {mapState[dispatch_assignment.id] ?
                  <li className="mt-1 mb-1" style={{marginLeft:"15%", marginRight:"-10px"}}>
                      {mapState[dispatch_assignment.id].service_requests[service_request.id] ?
                      <span>
                        {Object.keys(mapState[dispatch_assignment.id].service_requests[service_request.id].matches).map((key,i) => (
                          <span key={key} style={{textTransform:"capitalize"}}>
                            {i > 0 && ", "}{prettyText(key.split(',')[1], key.split(',')[0], mapState[dispatch_assignment.id].service_requests[service_request.id].matches[key])}
                          </span>
                        ))}
                      </span>
                      :""}
                      &nbsp;|&nbsp;{service_request.full_address}
                      <OverlayTrigger
                        key={"request-details"}
                        placement="top"
                        overlay={
                          <Tooltip id={`tooltip-request-details`}>
                            Service request details
                          </Tooltip>
                        }
                      >
                        <Link href={"/hotline/servicerequest/" + service_request.id} target="_blank"><FontAwesomeIcon icon={faClipboardList} className="ml-1" inverse /></Link>
                      </OverlayTrigger>
                  </li>
                  : ""}
                </span>
              </Collapse>
              ))}
            </div>
          </div>
        </span>
        ))}
        <div className="card-header mt-1 mb-1 rounded" style={{marginLeft:"-10px", marginRight:"-10px"}} hidden={data.dispatch_assignments.length > 0}>
          No open Dispatch Assignments found.
        </div>
      </Col>
    </Row>
  </>
  )
}

export default ServiceRequestDispatchAssignment
