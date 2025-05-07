import React, { useContext, useState, useEffect } from "react";
import ReactDOMServer from 'react-dom/server';
import axios from "axios";
import { Link, navigate } from 'raviger';
import { Button, Col, Collapse, OverlayTrigger, Row, Tooltip } from 'react-bootstrap';
import { CircleMarker, Marker, Tooltip as MapTooltip } from "react-leaflet";
import L from "leaflet";
import Moment from 'react-moment';
import randomColor from "randomcolor";
import Map, { countMatches, countDictMatches, prettyText } from "../components/Map";
import { Checkbox } from "../components/Form"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronCircleDown, faChevronCircleRight, faClipboardList, faStar, faUsers
} from '@fortawesome/free-solid-svg-icons';
import { faRectanglePortrait } from '@fortawesome/pro-solid-svg-icons';
import { faCheckCircle } from '@fortawesome/pro-duotone-svg-icons';
import Header from '../components/Header';
import { AuthContext } from "../accounts/AccountsReducer";
import { SystemErrorContext } from '../components/SystemError';

function ServiceRequestDispatchAssignment({ id, incident, organization }) {

  const { state } = useContext(AuthContext);
  const { setShowSystemError } = useContext(SystemErrorContext);

  const [currentRequest, setCurrentRequest] = useState({id:'', id_for_incident:'', matches: {}, latitude:0, longitude:0, followup_date:''});
  const [data, setData] = useState({dispatch_assignments: [], isFetching: false, bounds:L.latLngBounds([[0,0]])});
  const [mapState, setMapState] = useState({});
  const [selected, setSelected] = useState(null);
  const [showSRs, setShowSRs] = useState({});
  const [activeDispatch, setActiveDispatch] = useState(null);

  // Takes in dispatch ID,
  const updateShowSRs = (dispatch_id) => {
    let tempSRs = {...showSRs};
    tempSRs[dispatch_id] = !showSRs[dispatch_id];
    setShowSRs(tempSRs);
  }

  // Show or hide list of DAs based on current map zoom
  const onMove = event => {
    for (const dispatch_assignment of data.dispatch_assignments) {
      let hidden = true;
      for (const assigned_request of dispatch_assignment.assigned_requests) {
        if (mapState[dispatch_assignment.id].service_requests[assigned_request.service_request_object.id]) {
          if (event.target.getBounds().contains(L.latLng(assigned_request.service_request_object.latitude, assigned_request.service_request_object.longitude))) {
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
    axios.patch('/evac/api/evacassignment/' + selected + '/', {new_service_request:currentRequest.id, reassign:activeDispatch ? "true" : "false"})
    .then(response => {
      navigate('/' + organization + '/' + incident + '/dispatch/summary/' + response.data.id_for_incident)
    })
    .catch(error => {
      setShowSystemError(true);
    });
  }

  // Hook for initializing data.
  useEffect(() => {
    let unmounted = false;
    let source = axios.CancelToken.source();

    const fetchServiceRequests = async () => {
      // Fetch current ServiceRequest data.
      await axios.get('/hotline/api/incident/' + (state ? state.incident.id : 'undefined')  + '/servicerequests/' + id + '/', {
        cancelToken: source.token,
      })
      .then(async (currentResponse) => {
        let dispatch_assignments = [];
        if (!unmounted) {
          // Fetch open DA data.
          const map_dict = {};
          const bounds = [];
          const active_assignment = currentResponse.data.assigned_requests.find(assigned_request => !assigned_request.dispatch_assignment.end_time)
          const active_dispatch = active_assignment ? active_assignment.dispatch_assignment : null;
          let nextUrl = '/evac/api/evacassignment/?page=1&page_size=100?incident=' + incident;
          do {
            const response = await axios.get(nextUrl, {
              params: {
                status: 'open',
                map: true,
                organization
              },
              cancelToken: source.token,
            })
            .catch(error => {
              setData({dispatch_assignments: [], isFetching: false, bounds:L.latLngBounds([[0,0]])});
              if (error.response) {
                setShowSystemError(true);
              }
            });

            const random_colors = randomColor({count:response.data.length});
            response.data.results.forEach((dispatch_assignment, index) => {
              let sr_dict = {}
              for (const assigned_request of dispatch_assignment.assigned_requests) {
                const matches = countDictMatches(assigned_request.animals);
                sr_dict[assigned_request.service_request_object.id] = {id:assigned_request.service_request_object.id, matches:matches, latitude:assigned_request.service_request_object.latitude, longitude:assigned_request.service_request_object.longitude, full_address:assigned_request.service_request_object.full_address};
                bounds.push([assigned_request.service_request_object.latitude, assigned_request.service_request_object.longitude]);
              }
              map_dict[dispatch_assignment.id] = {checked:(active_dispatch !== null) && (active_dispatch.id === dispatch_assignment.id), hidden: false, color:random_colors[index], service_requests:sr_dict}
            });
            dispatch_assignments.push(...response.data.results);
            nextUrl = response.data.next;
            if (nextUrl) {
              nextUrl = '/evac/' + response.data.next.split('/evac/')[1];
            }
          } while(nextUrl != null)

          const current_matches = countMatches(currentResponse.data.animals)[0];
          currentResponse.data['matches'] = current_matches;
          setCurrentRequest(currentResponse.data);
          setActiveDispatch(active_dispatch);
          bounds.push([currentResponse.data.latitude, currentResponse.data.longitude]);
          setMapState(map_dict);
          setData({dispatch_assignments: dispatch_assignments, isFetching: false, bounds:L.latLngBounds(bounds)});
        }
      })
    };

    fetchServiceRequests();
    // Cleanup.
    return () => {
      unmounted = true;
      source.cancel();
    };
  }, [id, incident]);

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
    <Header>
      {activeDispatch ? "Rea" : "A"}ssign Service Request
    </Header>
    <hr/>
    <Row className="d-flex flex-wrap" style={{marginLeft:"0px", marginRight:"0px"}}>
      <Col xs={12} className="border rounded pl-0 pr-0">
        <Map className="d-block" bounds={data.bounds} onMoveEnd={onMove}>
          <Marker
            position={[currentRequest.latitude, currentRequest.longitude]}
            icon={starMarkerIcon}
          >
            <MapTooltip autoPan={false}>
              <span>
                {currentRequest.id && Object.keys(currentRequest.matches).length > 0?
                  <span>
                    {Object.keys(currentRequest.matches).map((key,i) => (
                      <span key={key} style={{textTransform:"capitalize"}}>
                        {i > 0 && ", "}{prettyText(key.split(',')[0], currentRequest.matches[key])}
                      </span>
                    ))}
                  </span>
                :"0 Animals"}
                <br />
                SR#{currentRequest.id_for_incident}: {currentRequest.full_address}
                {currentRequest.followup_date ? <div>Followup Date: <Moment format="L">{currentRequest.followup_date}</Moment></div> : ""}
                <div>
                  {currentRequest.aco_required ? <img width={16} height={16} src="/static/images/badge-sheriff.png" alt="ACO Required" className="mr-1" /> : ""}
                  {currentRequest.injured ? <img width={16} height={16} src="/static/images/band-aid-solid.png" alt="Injured" className="mr-1" /> : ""}
                  {currentRequest.accessible ? <img width={16} height={16} src="/static/images/car-solid.png" alt="Accessible" className="mr-1" /> : <img width={16} height={16} src="/static/images/car-ban-solid.png" alt="Not Acessible" className="mr-1" />}
                  {currentRequest.turn_around ? <img width={16} height={16} src="/static/images/trailer-solid.png" alt="Turn Around" /> : <img width={16} height={16} src="/static/images/trailer-ban-solid.png" alt="No Turn Around" className="mr-1" />}
                </div>
              </span>
            </MapTooltip>
          </Marker>
          {data.dispatch_assignments.filter(dispatch_assignment => mapState[dispatch_assignment.id].checked === false && (activeDispatch ? (dispatch_assignment.id !== activeDispatch.id) : true)).map(dispatch_assignment => (
          <span key={dispatch_assignment.id}>
            {dispatch_assignment.assigned_requests.map(assigned_request => (
            <CircleMarker
              key={assigned_request.service_request_object.id}
              center={{lat:assigned_request.service_request_object.latitude, lng: assigned_request.service_request_object.longitude}}
              color="black"
              weight="1"
              fillColor={mapState[dispatch_assignment.id] ? mapState[dispatch_assignment.id].color : ""}
              fill={true}
              fillOpacity="1"
              onClick={() => handleMapState(dispatch_assignment.id)}
              radius={5}
            >
              <MapTooltip autoPan={false}>
                <span>
                  {mapState[dispatch_assignment.id] && Object.keys(mapState[dispatch_assignment.id].service_requests[assigned_request.service_request_object.id].matches).length ?
                    <span>
                      {Object.keys(mapState[dispatch_assignment.id].service_requests[assigned_request.service_request_object.id].matches).map((key,i) => (
                        <span key={key} style={{textTransform:"capitalize"}}>
                          {i > 0 && ", "}{prettyText(key.split(',')[0], mapState[dispatch_assignment.id].service_requests[assigned_request.service_request_object.id].matches[key])}
                        </span>
                      ))}
                    </span>
                  :"0 Animals"}
                  <br />
                  SR#{assigned_request.service_request_object.id_for_incident}: {assigned_request.service_request_object.full_address}
                  {assigned_request.service_request_object.followup_date ? <div>Followup Date: <Moment format="L">{assigned_request.service_request_object.followup_date}</Moment></div> : ""}
                  <div>
                    {assigned_request.service_request_object.aco_required ? <img width={16} height={16} src="/static/images/badge-sheriff.png" alt="ACO Required" className="mr-1" /> : ""}
                    {assigned_request.service_request_object.injured ? <img width={16} height={16} src="/static/images/band-aid-solid.png" alt="Injured" className="mr-1" /> : ""}
                    {assigned_request.service_request_object.accessible ? <img width={16} height={16} src="/static/images/car-solid.png" alt="Accessible" className="mr-1" /> : <img width={16} height={16} src="/static/images/car-ban-solid.png" alt="Not Acessible" className="mr-1" />}
                    {assigned_request.service_request_object.turn_around ? <img width={16} height={16} src="/static/images/trailer-solid.png" alt="Turn Around" /> : <img width={16} height={16} src="/static/images/trailer-ban-solid.png" alt="No Turn Around" className="mr-1" />}
                  </div>
                </span>
              </MapTooltip>
            </CircleMarker>
            ))}
          </span>
          ))}
          {Object.entries(mapState).filter(([key, value]) => (value.checked === true || (activeDispatch && (Number(key) === activeDispatch.id)))).map(([key, value]) => (
            <span key={key}>
            {Object.entries(value.service_requests).filter(([sr_id, service_request]) => (Number(sr_id) !== currentRequest.id)).map(([sr_id, service_request]) => (
              <Marker
                key={service_request.id} 
                position={[service_request.latitude, service_request.longitude]}
                icon={activeDispatch && Number(key) === activeDispatch.id ? checkMarkerIconGray : checkMarkerIcon}
                onClick={activeDispatch && Number(key) === activeDispatch.id ? undefined : () => handleMapState(activeDispatch.id)}
              >
                <MapTooltip autoPan={false}>
                  <span>
                    {service_request.id && Object.keys(service_request.matches).length ?
                      <span>
                        {Object.keys(service_request.matches).map((key,i) => (
                          <span key={key} style={{textTransform:"capitalize"}}>
                            {i > 0 && ", "}{prettyText(key.split(',')[0], service_request.matches[key])}
                          </span>
                        ))}
                      </span>
                    :"0 Animals"}
                    <br />
                    SR#{service_request.id_for_incident}: {service_request.full_address}
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
    <Row className="border rounded" style={{marginLeft:"0px", marginRight:"0px"}}>
      <Col xs={2} className="pl-0" style={{paddingRight:"0px"}}>
        <Button onClick={() => handleSubmit()} className="btn-block border" disabled={selected === null}>ASSIGN</Button>
      </Col>
      <Col xs={10} className="pl-0 pr-0">
        <div className="card-header d-flex align-items-center rounded" style={{height:"37px"}}><b style={{marginLeft:"-10px"}}>
          Service Request:</b>&nbsp;
          SR#{currentRequest.id_for_incident} - {currentRequest.full_address}
          {/* {Object.keys(currentRequest.matches).map((key,i) => (
            <span key={key} style={{textTransform:"capitalize"}}>
              {i > 0 && ", "}{prettyText(key.split(',')[0], currentRequest.matches[key])}
            </span>
          ))} */}
        </div>
      </Col>
    </Row>
    <Row className="d-flex flex-wrap" style={{marginTop:"-1px", marginRight:"0px", marginLeft:"0px", minHeight:"36vh"}}>
      <Col xs={12} className="border rounded" style={{marginLeft:"1px", height:"36vh", overflowY:"auto", paddingRight:"-1px"}}>
        {activeDispatch && data.dispatch_assignments.filter(dispatch_assignment => dispatch_assignment.id === activeDispatch.id).map(dispatch_assignment => (
        <div key={dispatch_assignment.id} className="mt-1 mb-1" style={{marginLeft:"-10px", marginRight:"-10px"}}>
          <div className="card-header rounded">
            <Checkbox
              id={String(dispatch_assignment.id)}
              name={String(dispatch_assignment.id)}
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
            <span>Current Dispatch Assignment</span>
            <OverlayTrigger
              key={"assignment-summary"}
              placement="top"
              overlay={
                <Tooltip id={`tooltip-assignment-summary`}>
                  Dispatch assignment summary
                </Tooltip>
              }
            >
              <Link href={"/" + organization + "/" + incident + "/dispatch/summary/" + dispatch_assignment.id_for_incident}><FontAwesomeIcon icon={faClipboardList} className="ml-1" inverse /></Link>
            </OverlayTrigger>&nbsp;&nbsp;|&nbsp;
            {dispatch_assignment.team ? dispatch_assignment.team_name : ""}
            {dispatch_assignment.team ?
              <OverlayTrigger
                key={"team-names"}
                placement="top"
                overlay={
                  <Tooltip id={`tooltip-team-names`}>
                    {dispatch_assignment.team_member_names}
                  </Tooltip>
                }
              >
                <FontAwesomeIcon icon={faUsers} className="ml-1" />
              </OverlayTrigger>
            : ""}
            &nbsp;|&nbsp;Service Requests<FontAwesomeIcon icon={faChevronCircleRight} hidden={showSRs[dispatch_assignment.id]} onClick={() => updateShowSRs(dispatch_assignment.id)} className="ml-1 fa-move-up" style={{verticalAlign:"middle"}} inverse /><FontAwesomeIcon icon={faChevronCircleDown} hidden={!showSRs[dispatch_assignment.id]} onClick={() => updateShowSRs(dispatch_assignment.id)} className="ml-1 fa-move-up" style={{verticalAlign:"middle"}} inverse />
            {dispatch_assignment.assigned_requests.map(assigned_request => (
            <Collapse key={assigned_request.service_request_object.id} in={showSRs[dispatch_assignment.id]}>
              <span>
                {mapState[dispatch_assignment.id] ?
                <li className="mt-1 mb-1" style={{marginLeft:"15%", marginRight:"-10px"}}>
                    {mapState[dispatch_assignment.id].service_requests[assigned_request.service_request_object.id] && Object.keys(mapState[dispatch_assignment.id].service_requests[assigned_request.service_request_object.id].matches).length ?
                    <span>
                      {Object.keys(mapState[dispatch_assignment.id].service_requests[assigned_request.service_request_object.id].matches).map((key,i) => (
                        <span key={key} style={{textTransform:"capitalize"}}>
                          {i > 0 && ", "}{prettyText(key.split(',')[0], mapState[dispatch_assignment.id].service_requests[assigned_request.service_request_object.id].matches[key])}
                        </span>
                      ))}
                    </span>
                    :"0 Animals"}
                    &nbsp;|&nbsp;SR#{assigned_request.service_request_object.id_for_incident} - <Link href={"/" + organization + "/" + incident + "/hotline/servicerequest/" + assigned_request.service_request_object.id_for_incident} className="text-link" style={{textDecoration:"none", color:"white"}}>{assigned_request.service_request_object.full_address}</Link>
                </li>
                : ""}
              </span>
            </Collapse>
            ))}
          </div>
        </div>
        ))}
        {data.dispatch_assignments.filter(dispatch_assignment => (mapState[dispatch_assignment.id].hidden === false) && (activeDispatch ? (dispatch_assignment.id !== activeDispatch.id) : true)).map((dispatch_assignment, index) => (
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
              <span>DA#{dispatch_assignment.id}</span>
              <OverlayTrigger
                key={"assignment-summary"}
                placement="top"
                overlay={
                  <Tooltip id={`tooltip-assignment-summary`}>
                    Dispatch assignment summary
                  </Tooltip>
                }
              >
                <Link href={"/" + organization + "/" + incident + "/dispatch/summary/" + dispatch_assignment.id_for_incident}><FontAwesomeIcon icon={faClipboardList} className="ml-1" inverse /></Link>
              </OverlayTrigger>&nbsp;&nbsp;|&nbsp;
              {dispatch_assignment.team ? dispatch_assignment.team_name : ""}
              {dispatch_assignment.team_member_names ?
                <OverlayTrigger
                  key={"team-names"}
                  placement="top"
                  overlay={
                    <Tooltip id={`tooltip-team-names`}>
                      {dispatch_assignment.team_member_names}
                    </Tooltip>
                  }
                >
                  <FontAwesomeIcon icon={faUsers} className="ml-1" />
                </OverlayTrigger>
              : ""}
              &nbsp;|&nbsp;Service Requests<FontAwesomeIcon icon={faChevronCircleRight} hidden={showSRs[dispatch_assignment.id]} onClick={() => updateShowSRs(dispatch_assignment.id)} className="ml-1 fa-move-up" style={{verticalAlign:"middle"}} inverse /><FontAwesomeIcon icon={faChevronCircleDown} hidden={!showSRs[dispatch_assignment.id]} onClick={() => updateShowSRs(dispatch_assignment.id)} className="ml-1 fa-move-up" style={{verticalAlign:"middle"}} inverse />
              {dispatch_assignment.assigned_requests.map(assigned_request => (
              <Collapse key={assigned_request.service_request_object.id} in={showSRs[dispatch_assignment.id]}>
                <span>
                  {mapState[dispatch_assignment.id] ?
                  <li className="mt-1 mb-1" style={{marginLeft:"15%", marginRight:"-10px"}}>
                      {mapState[dispatch_assignment.id].service_requests[assigned_request.service_request_object.id] && Object.keys(mapState[dispatch_assignment.id].service_requests[assigned_request.service_request_object.id].matches).length > 0 ?
                      <span>
                        {Object.keys(mapState[dispatch_assignment.id].service_requests[assigned_request.service_request_object.id].matches).map((key,i) => (
                          <span key={key} style={{textTransform:"capitalize"}}>
                            {i > 0 && ", "}{prettyText(key.split(',')[0], mapState[dispatch_assignment.id].service_requests[assigned_request.service_request_object.id].matches[key])}
                          </span>
                        ))}
                      </span>
                      :"0 Animals"}
                      &nbsp;|&nbsp;SR#{assigned_request.service_request_object.id_for_incident} - {assigned_request.service_request_object.full_address}
                      <OverlayTrigger
                        key={"request-details"}
                        placement="top"
                        overlay={
                          <Tooltip id={`tooltip-request-details`}>
                            Service request details
                          </Tooltip>
                        }
                      >
                        <Link href={"/" + organization + "/" + incident + "/hotline/servicerequest/" + assigned_request.service_request_object.id_for_incident}><FontAwesomeIcon icon={faClipboardList} className="ml-1" inverse /></Link>
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
