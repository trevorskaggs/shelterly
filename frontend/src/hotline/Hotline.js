import React, { useContext, useState, useEffect } from "react";
import axios from "axios";
import { Link, navigate } from 'raviger';
import { Button, Card, Col, Row } from 'react-bootstrap';
import { Marker, Tooltip as MapTooltip } from "react-leaflet";
import L from "leaflet";
import Moment from 'react-moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircle, faExclamationCircle, faPhone } from '@fortawesome/free-solid-svg-icons';
import { faQuestionCircle as faQuestionCircleDuo } from '@fortawesome/pro-duotone-svg-icons';
import { faHomeAlt as faHomeAltReg } from '@fortawesome/pro-regular-svg-icons';
import { faHomeAlt } from '@fortawesome/pro-solid-svg-icons';
import Map, { prettyText, closedMarkerIcon, reportedMarkerIcon, SIPMarkerIcon, UTLMarkerIcon } from "../components/Map";
import Header from "../components/Header";
import { SystemErrorContext } from '../components/SystemError';

function Hotline({ incident }) {

  const { setShowSystemError } = useContext(SystemErrorContext);

  const [data, setData] = useState({service_requests: [], isFetching: false, bounds:L.latLngBounds([[0,0]])});
  const [mapState, setMapState] = useState({});
  const [statusOptions, setStatusOptions] = useState("all");

  // Counts the number of species matches for a service request.
  const countMatches = (service_request) => {
    let species_matches = {};

    service_request.animals.forEach((animal) => {
      if (!species_matches[[animal.species]]) {
        species_matches[[animal.species]] = 1;
      }
      else {
        species_matches[[animal.species]] += 1;
      }
    });
    return species_matches
  }

  // Hook for initializing data.
  useEffect(() => {
    let unmounted = false;
    let source = axios.CancelToken.source();

    const fetchServiceRequests = async () => {
      setData({service_requests: [], isFetching: true, bounds:L.latLngBounds([[0,0]])});
      // Fetch ServiceRequest data.
      await axios.get('/hotline/api/servicerequests/?incident=' + incident, {
        params: {
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
            map_dict[service_request.id] = {matches:matches, latitude:service_request.latitude, longitude:service_request.longitude};
            bounds.push([service_request.latitude, service_request.longitude]);
          }
          setMapState(map_dict);
          if (bounds.length > 0) {
            setData({service_requests: response.data, isFetching: false, bounds:bounds});
          }
        }
      })
      .catch(error => {
        if (!unmounted) {
          setData({service_requests: [], isFetching: false, bounds:L.latLngBounds([[0,0]])});
          setShowSystemError(true);
        }
      });
    };

    fetchServiceRequests();

    // Cleanup.
    return () => {
      unmounted = true;
      source.cancel();
    };
  }, [incident]);

  return (
    <>
    <Header>Hotline</Header>
    <hr/>
    <Row className="ml-0 mr-0 pl-0 pr-0 mb-0">
      <Col xs={4} className="pl-0 pr-0">
        <Link href={"/" + incident + "/hotline/workflow/owner"} style={{textDecoration:"none"}}>
          <Button className="rounded border btn-block" style={{height:"100px", fontSize:"20px"}}><FontAwesomeIcon icon={faPhone} className="mr-1 fa-move-up" inverse />OWNER CALLING</Button>
        </Link>
      </Col>
      <Col xs={4} className="pl-0 pr-0">
        <Link href={"/" + incident + "/hotline/workflow/reporter"} style={{textDecoration:"none"}}>
          <Button className="rounded border btn-block" style={{height:"100px", fontSize:"20px"}}><FontAwesomeIcon icon={faPhone} className="mr-1 fa-move-up" inverse />NON-OWNER CALLING</Button>
        </Link>
      </Col>
      <Col xs={4} className="pl-0 pr-0">
        <Link href={"/" + incident + "/hotline/workflow/first_responder"} style={{textDecoration:"none"}}>
          <Button className="rounded border btn-block" style={{height:"100px", fontSize:"20px"}}><FontAwesomeIcon icon={faPhone} className="mr-1 fa-move-up" inverse />FIRST RESPONDER CALLING</Button>
        </Link>
      </Col>
    </Row>
    <Row xs={12} className="ml-0 mr-0 pl-0 pr-0" style={{marginBottom:"-1px"}}>
      <Col xs={10} className="border rounded pl-0 pr-0">
        {data.service_requests.length ?
          <Map zoom={11} bounds={data.bounds} className="landing-leaflet-container">
            {data.service_requests.filter(service_request => (service_request.status === statusOptions || statusOptions === "all")).map(service_request => (
              <Marker
                key={service_request.id}
                position={[service_request.latitude, service_request.longitude]}
                icon={service_request.reported_animals > 0 ? reportedMarkerIcon : service_request.sheltered_in_place > 0 ? SIPMarkerIcon : service_request.unable_to_locate > 0 ? UTLMarkerIcon : closedMarkerIcon}
                onClick={() => navigate("/" + incident + "/hotline/servicerequest/" + service_request.id)}
              >
                <MapTooltip autoPan={false}>
                  <span>
                    SR#{service_request.id}: {service_request.full_address}
                    <br/>
                    {mapState[service_request.id] ?
                      <span>
                        {Object.keys(mapState[service_request.id].matches).map((key,i) => (
                          <span key={key} style={{textTransform:"capitalize"}}>
                            {i > 0 && ", "}{prettyText(key.split(',')[0], mapState[service_request.id].matches[key])}
                          </span>
                        ))}
                      </span>
                    :""}
                    {service_request.followup_date ? <div>Followup Date: <Moment format="L">{service_request.followup_date}</Moment></div> : ""}
                    <div>
                      {service_request.aco_required ? <img width={16} height={16} src="/static/images/badge-sheriff.png" alt="ACO Required" className="mr-1" /> : ""}
                      {service_request.injured ? <img width={16} height={16} src="/static/images/band-aid-solid.png" alt="Injured" className="mr-1" /> : ""}
                      {service_request.accessible ? <img width={16} height={16} src="/static/images/car-solid.png" alt="Accessible" className="mr-1" /> : <img width={16} height={16} src="/static/images/car-ban-solid.png" alt="Not Acessible" className="mr-1" />}
                      {service_request.turn_around ? <img width={16} height={16} src="/static/images/trailer-solid.png" alt="Turn Around" /> : <img width={16} height={16} src="/static/images/trailer-ban-solid.png" alt="No Turn Around" className="mr-1" />}
                    </div>
                  </span>
                </MapTooltip>
              </Marker>
            ))}
          </Map>
        :
          <Card className="text-center" style={{height:"450px", marginRight:"-1px", paddingTop:"225px", fontSize:"30px"}}>{data.isFetching ? "Fetching" : "No"} Service Requests.</Card>
        }
      </Col>
      <Col xs={2} className="ml-0 mr-0 pl-0 pr-0 border rounded">
        <Button variant={statusOptions === "all" ? "primary" : "secondary"} className="border" onClick={() => setStatusOptions("all")} style={{maxHeight:"36px", width:"100%", marginTop:"-1px"}}>All</Button>
        <Button variant={statusOptions === "open" ? "primary" : "secondary"} className="border" onClick={() => setStatusOptions("open")} style={{maxHeight:"36px", width:"100%", marginTop:"-1px"}}>Open</Button>
        <Button variant={statusOptions === "assigned" ? "primary" : "secondary"} className="border" onClick={() => setStatusOptions("assigned")} style={{maxHeight:"36px", width:"100%", marginTop:"-1px"}}>Assigned</Button>
        <Button variant={statusOptions === "closed" ? "primary" : "secondary"} className="border" onClick={() => setStatusOptions("closed")} style={{maxHeight:"36px", width:"100%", marginTop:"-1px"}}>Closed</Button>
      </Col>
    </Row>
    <Row className="ml-0 mr-0 border rounded" style={{maxHeight:"38px"}}>
      <h4 className="card-header text-center" style={{paddingTop:"4px", paddingLeft:"10px", paddingRight:"10px", height:"36px", width:"100%", backgroundColor:"#808080"}}>
        Service Requests&nbsp;&nbsp; -
        <span className="fa-layers mr-1 ml-3">
          <FontAwesomeIcon icon={faCircle} className="fa-move-down" color="white" />
          <FontAwesomeIcon icon={faExclamationCircle} className="icon-border fa-move-down" color="#ff4c4c" />
        </span>
        Reported
        <span style={{paddingRight:"15px", paddingLeft:"15px"}}>
          <span className="fa-layers ml-1" style={{marginRight:"6px"}}>
            <FontAwesomeIcon icon={faCircle} className="icon-border fa-move-down" color="#f5ee0f" transform={'grow-2'} />
            <FontAwesomeIcon icon={faHomeAlt} className="fa-move-down" style={{color:"white"}} transform={'shrink-3 left-1'} inverse />
            <FontAwesomeIcon icon={faHomeAltReg} className="fa-move-down" style={{color:"#444"}} transform={'shrink-3 left-1'} inverse />
          </span>
          SIP
        </span>
        <span className="fa-layers ml-1 mr-1">
          <FontAwesomeIcon icon={faCircle} className="fa-move-down" color="white" />
          <FontAwesomeIcon icon={faQuestionCircleDuo} className="icon-border fa-move-down" style={{"--fa-primary-color":'white', "--fa-secondary-color":'#5f5fff', "--fa-secondary-opacity": 1}}  />
        </span>
        UTL
      </h4>
    </Row>
  </>
  )
}

export default Hotline
