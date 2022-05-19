import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, navigate } from 'raviger';
import { Button, Col, OverlayTrigger, Row, Tooltip } from 'react-bootstrap';
import { Marker, Tooltip as MapTooltip } from "react-leaflet";
import L from "leaflet";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBullhorn, faMapMarkedAlt, faUsers
} from '@fortawesome/free-solid-svg-icons';
import { faChevronCircleDown, faChevronCircleUp } from '@fortawesome/pro-duotone-svg-icons';
import Map, { countMatches, prettyText, reportedMarkerIcon, SIPMarkerIcon, UTLMarkerIcon } from "../components/Map";
import Header from "../components/Header";
import Scrollbar from '../components/Scrollbars';

function Dispatch() {

  const [data, setData] = useState({dispatch_assignments: [], isFetching: false, bounds:L.latLngBounds([[0,0]])});
  const [mapState, setMapState] = useState({});
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showActive, setShowActive] = useState(true);
  const [showPreplanned, setShowPreplanned] = useState(true);

  // Hook for initializing data.
  useEffect(() => {
    let unmounted = false;
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
        if (!unmounted) {
          const map_dict = {};
          const bounds = [];
          response.data.forEach((dispatch_assignment, index) => {
            let sr_dict = {}
            for (const assigned_request of dispatch_assignment.assigned_requests) {
              const matches = countMatches(assigned_request.service_request_object)[0];
              sr_dict[assigned_request.service_request_object.id] = {id:assigned_request.service_request_object.id, matches:matches, latitude:assigned_request.service_request_object.latitude, longitude:assigned_request.service_request_object.longitude, full_address:assigned_request.service_request_object.full_address};
              bounds.push([assigned_request.service_request_object.latitude, assigned_request.service_request_object.longitude]);
            }
            map_dict[dispatch_assignment.id] = {service_requests:sr_dict}
          });
          setMapState(map_dict);
          setData({dispatch_assignments: response.data, isFetching: false, bounds:bounds.length > 0 ? bounds : L.latLngBounds([[0,0]])});
        }
      })
      .catch(error => {
        if (!unmounted) {
          setData({dispatch_assignments: [], isFetching: false, bounds:L.latLngBounds([[0,0]])});
        }
      });
    };

    fetchServiceRequests();

    // Cleanup.
    return () => {
      unmounted = true;
      source.cancel();
    };
  }, []);

  return (
    <>
    <Header>Dispatch</Header>
    <hr/>
    <Row className="ml-0 mr-0 pl-0 pr-0 mb-0">
      <Col xs={4} className="pl-0 pr-0">
        <Link href="/hotline/workflow/owner" style={{textDecoration:"none"}}>
          <Button className="rounded border btn-block" style={{height:"100px", fontSize:"20px"}} action><FontAwesomeIcon icon={faBullhorn} className="mr-1 fa-move-up" inverse />DEPLOY TEAMS</Button>
        </Link>
      </Col>
      <Col xs={4} className="pl-0 pr-0">
        <Link href="/hotline/workflow/reporter" style={{textDecoration:"none"}}>
          <Button className="rounded border btn-block" style={{height:"100px", fontSize:"20px"}} action><FontAwesomeIcon icon={faMapMarkedAlt} className="mr-1 fa-move-up" inverse />PREPLAN ASSIGNMENTS</Button>
        </Link>
      </Col>
      <Col xs={4} className="pl-0 pr-0">
        <Link href="/hotline/workflow/first_responder" style={{textDecoration:"none"}}>
          <Button className="rounded border btn-block" style={{height:"100px", fontSize:"20px"}} action><FontAwesomeIcon icon={faUsers} className="mr-1 fa-move-up" inverse />TEAM MANAGEMENT</Button>
        </Link>
      </Col>
    </Row>
    <Row xs={12} className="ml-0 mr-0 pl-0 pr-0" style={{marginBottom:"-1px"}}>
      <Col xs={10} className="border rounded pl-0 pr-0">
        <Map bounds={data.bounds} className="landing-leaflet-container">
          {data.dispatch_assignments.filter(da => da.id === selectedTeam ? da : showActive && showPreplanned ? da : showActive ? da.team_member_names.length > 0 : showPreplanned ? da.team_member_names.length === 0 : null)
                                    .filter(dispatch_assignment => (selectedTeam == null || dispatch_assignment.id === selectedTeam)).map(dispatch_assignment => (
          <span key={dispatch_assignment.id}>
            {dispatch_assignment.assigned_requests.map((assigned_request, index) => (
              <Marker
                key={assigned_request.service_request_object.id}
                position={[assigned_request.service_request_object.latitude, assigned_request.service_request_object.longitude]}
                icon={assigned_request.service_request_object.sheltered_in_place > 0 ? SIPMarkerIcon : assigned_request.service_request_object.unable_to_locate > 0 ? UTLMarkerIcon : reportedMarkerIcon}
                onClick={() => navigate("/dispatch/summary/" + dispatch_assignment.id)}
              >
              <MapTooltip key={`${index}-${selectedTeam}`} autoPan={false} closeButton={true} permanent={selectedTeam === dispatch_assignment.id ? true : false}>
                <span>
                  <div>{dispatch_assignment.team_object ? dispatch_assignment.team_object.name : ""}</div>
                  {mapState[dispatch_assignment.id] ?
                    <span>
                      {assigned_request.service_request_object.sheltered_in_place > 0 ? 'SIP: ' : assigned_request.service_request_object.unable_to_locate > 0 ? 'UTL: ' : 'Reported: '}
                      {Object.keys(mapState[dispatch_assignment.id].service_requests[assigned_request.service_request_object.id].matches).map((key,i) => (
                        <span key={key} style={{textTransform:"capitalize"}}>
                          {i > 0 && ", "}{prettyText(key.split(',')[1], key.split(',')[0], mapState[dispatch_assignment.id].service_requests[assigned_request.service_request_object.id].matches[key])}
                        </span>
                      ))}
                    </span>
                  :""}
                  <br />
                  SR#{assigned_request.service_request_object.id}: {assigned_request.service_request_object.full_address}
                  <div>
                    {assigned_request.service_request_object.aco_required ? <img width={16} height={16} src="/static/images/badge-sheriff.png" alt="ACO Required" className="mr-1" /> : ""}
                    {assigned_request.service_request_object.injured ? <img width={16} height={16} src="/static/images/band-aid-solid.png" alt="Injured" className="mr-1" /> : ""}
                    {assigned_request.service_request_object.accessible ? <img width={16} height={16} src="/static/images/car-solid.png" alt="Accessible" className="mr-1" /> : <img width={16} height={16} src="/static/images/car-ban-solid.png" alt="Not Acessible" className="mr-1" />}
                    {assigned_request.service_request_object.turn_around ? <img width={16} height={16} src="/static/images/trailer-solid.png" alt="Turn Around" /> : <img width={16} height={16} src="/static/images/trailer-ban-solid.png" alt="No Turn Around" className="mr-1" />}
                  </div>
                </span>
              </MapTooltip>
            </Marker>
            ))}
          </span>
          ))}
        </Map>
      </Col>
      <Col xs={2} className="ml-0 mr-0 pl-0 pr-0 border rounded">
        <Scrollbar no_shadow="true" style={{height:"450px"}} renderThumbHorizontal={props => <div {...props} style={{...props.style, display: 'none'}} />}>
        <Button variant={"info"} className="border" onClick={() => setShowActive(!showActive)} style={{maxHeight:"36px", width:"100%", marginTop:"-1px"}}>Active {showActive ? <FontAwesomeIcon icon={faChevronCircleUp} size="sm" /> : <FontAwesomeIcon icon={faChevronCircleDown} size="sm" />}</Button>
        {data.dispatch_assignments.filter(da => showActive ? da.team_member_names.length > 0 : null).map(dispatch_assignment => (
          <Button key={dispatch_assignment.id} title={dispatch_assignment.team ? dispatch_assignment.team.name : ""} variant={dispatch_assignment.id === selectedTeam ? "primary" : "secondary"} className="border" onClick={() => setSelectedTeam(selectedTeam === dispatch_assignment.id ? null : dispatch_assignment.id)} style={{maxHeight:"36px", width:"100%", marginTop:"-1px"}}>
            {dispatch_assignment.team ? dispatch_assignment.team_object.name : "Preplanned"}
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
          </Button>
        ))}
        <Button variant={"info"} className="border" onClick={() => setShowPreplanned(!showPreplanned)} style={{maxHeight:"36px", width:"100%", marginTop:"-1px"}}>Preplanned {showPreplanned ? <FontAwesomeIcon icon={faChevronCircleUp} size="sm" /> : <FontAwesomeIcon icon={faChevronCircleDown} size="sm" />}</Button>
        {data.dispatch_assignments.filter(da => showPreplanned ? da.team_member_names.length === 0 : null).map(dispatch_assignment => (
          <Button key={dispatch_assignment.id} title={dispatch_assignment.team ? dispatch_assignment.team.name : ""} variant={dispatch_assignment.id === selectedTeam ? "primary" : "secondary"} className="border" onClick={() => setSelectedTeam(selectedTeam === dispatch_assignment.id ? null : dispatch_assignment.id)} style={{maxHeight:"36px", width:"100%", marginTop:"-1px"}}>
            {dispatch_assignment.team ? dispatch_assignment.team_object.name : "Preplanned"}
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
          </Button>
        ))}
        </Scrollbar>
      </Col>
    </Row>
    <Row className="ml-0 mr-0 border rounded" style={{maxHeight:"38px"}}>
      <h4 className="card-header text-center" style={{paddingTop:"4px", paddingLeft:"10px", paddingRight:"10px", height:"36px", width:"100%", backgroundColor:"#808080"}}>Dispatch Assignments</h4>
    </Row>
    </>
  )
}

export default Dispatch
