import React, { useEffect, useState } from 'react';
import axios from "axios";
import { Link, navigate } from 'raviger';
import { Form, Formik } from 'formik';
import { Button, Card, Col, FormCheck, ListGroup, OverlayTrigger, Row, Tooltip } from 'react-bootstrap';
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
import { Typeahead } from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import 'leaflet/dist/leaflet.css';

const header_style = {
  textAlign: "center",
}

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

  // Team Member Selector Code
  const [teamData, setTeamData] = useState({options: [], isFetching: false});

  useEffect(() => {
    let source = axios.CancelToken.source();
    const fetchTeamMembers = async () => {
      setTeamData({options: [], isFetching: true});
      await axios.get('/evac/api/evacteammember/', {
        cancelToken: source.token,
      })
      .then(response => {
        var options = []
        response.data.forEach(function(teammember){
          options.push({id: teammember.id, label: teammember.display_name})
        });
        setTeamData({options: options, isFetching: false});
      })
      .catch(error => {
        console.log(error.response);
        setTeamData({options: [], isFetching: false});
      });
    };
    fetchTeamMembers();
    return () => {
      source.cancel();
    };
  }, [])
  // End Team Selector Code

  // Handle aco_required toggle.
  const handleACO = async event => {
    setStatusOptions({aco_required:!statusOptions.aco_required})
  }

  // Handle radius circle toggles.
  const handleRadius = (id) => {
    if (mapState[id].radius === "disabled") {
      setMapState(prevState => ({ ...prevState, [id]: {...prevState[id], ["radius"]:"enabled"} }));
    }
    else {
      setMapState(prevState => ({ ...prevState, [id]: {...prevState[id], ["radius"]:"disabled"} }));
    }
  }

  // Handle dynamic SR state and map display when an SR is selected or deselected.
  const handleMapState = (id) => {
    // If selected.
    if (mapState[id].checked === false) {
      setMapState(prevState => ({ ...prevState, [id]: {...prevState[id], ["color"]:"green", ["checked"]:true} }));
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
      setMapState(prevState => ({ ...prevState, [id]: {...prevState[id], ["color"]:"red", ["checked"]:false} }));
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
          setMapState(prevState => ({ ...prevState, [service_request.id]: {...prevState[service_request.id], hidden:true} }));
        }
        else {
          setMapState(prevState => ({ ...prevState, [service_request.id]: {...prevState[service_request.id], hidden:false} }));
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
            map_dict[service_request.id] = {color:"red", checked:false, hidden:false, matches:matches, radius:"disabled", latitude:service_request.latitude, longitude:service_request.longitude};
            bounds.push([service_request.latitude, service_request.longitude]);
          }
          setMapState(map_dict);
          if (bounds.length > 0) {
            setData(prevState => ({ ...prevState, ["bounds"]:L.latLngBounds(bounds) }));
          }
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
    <Formik
      initialValues={{
        team_members: [],
        service_requests: [],
      }}
      onSubmit={(values, { setSubmitting }) => {
        values.service_requests = Object.keys(mapState).filter(key => mapState[key].checked === true)
        setTimeout(() => {
          axios.post('/evac/api/evacassignment/', values)
          .then(response => {
            navigate('/evac/summary/' + response.data.id);
          })
          .catch(error => {
            console.log(error.response);
          });
          setSubmitting(false);
        }, 500);
      }}
    >
    {props => (
      <Form style={{paddingRight:"10px"}}>
        <Row className="d-flex flex-wrap mt-3">
          <Col xs={12} className="border rounded pl-0 pr-0"  style={{marginLeft:"-3px"}}>
            <Map className="d-block" bounds={data.bounds} onMoveEnd={onMove}>
              <Legend position="bottomleft" metric={false} />
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              />
              {data.service_requests.map(service_request => (
                <CircleMarker
                  key={service_request.id}
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
              ))}
              {Object.entries(mapState).filter(([key, value]) => value.radius === "enabled").map(([key, value]) => (
                <Circle key={key} center={{lat:value.latitude, lng: value.longitude}} radius={805} interactive={false} />
              ))}
            </Map>
          </Col>
        </Row>
        <Row className="mt-2">
          <Col xs={12} className="pl-0">
            <div className="form-row">
              <Typeahead
                id="team_members"
                multiple
                onChange={(values) => {props.setFieldValue('team_members', values.map(item => item.id))}}
                options={teamData.options}
                placeholder="Choose team members..."
                className="col-sm-8 pl-0"
              />
              <Button type="submit" className="btn-block col-sm-2" disabled={selectedCount.disabled || props.values.team_members.length === 0}>DEPLOY</Button>
              <FormCheck id="aco_required" className="col-sm-2 mt-2" style={{paddingLeft:"60px"}} name="aco_required" type="switch" label="ACO Required" checked={statusOptions.ACORequired} onChange={handleACO} />
            </div>
          </Col>
        </Row>
      <Row className="d-flex flex-wrap" style={{marginTop:"-15px", minHeight:"36vh"}}>
        <Col xs={2} className="mt-4 border rounded mr-1" style={{marginLeft:"-5px", height:"250", minHeight:"250"}}>
          <p className="text-center mt-3 mb-2">Selected Animals</p>
          <hr/>
          {Object.keys(totalSelectedState).map(key => (
            <div key={key} style={{textTransform:"capitalize"}}>{prettyText(key.split(',')[1], key.split(',')[0], totalSelectedState[key])}</div>
          ))}
        </Col>
        <Col xs={10} className="mt-4 border rounded" style={{marginLeft:"1px"}}>
          {data.service_requests.map(service_request => (
            <div key={service_request.id} className="mt-1 mb-1" style={{marginLeft:"-10px", marginRight:"-10px"}} hidden={mapState[service_request.id] && !mapState[service_request.id].checked ? mapState[service_request.id].hidden : false}>
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
                <FontAwesomeIcon icon={faBullseye} className="ml-1" onClick={() => handleRadius(service_request.id)} />
                <Link href={"/hotline/servicerequest/" + service_request.id} target="_blank"> <FontAwesomeIcon icon={faClipboardList} inverse /></Link>
              </div>
            </div>
          ))}
          <div className="card-header mt-1 mb-1"  style={{marginLeft:"-10px", marginRight:"-10px"}} hidden={data.service_requests.length > 0}>
            No open Service Requests found.
          </div>
        </Col>
        </Row>
      </Form>
    )}
  </Formik>
  )
}

export function EvacSummary({id}) {

  // Initial animal data.
  const [data, setData] = useState({
    team_members: [],
    team_member_objects: [],
    service_requests: [],
    service_request_objects: [],
    start_time: null,
    end_time: null,
  });

  // Hook for initializing data.
  useEffect(() => {
    let source = axios.CancelToken.source();
    const fetchEvacSummaryData = async () => {
      // Fetch Animal data.
      await axios.get('/evac/api/evacassignment/' + id + '/', {
        cancelToken: source.token,
      })
      .then(response => {
        setData(response.data);
      })
      .catch(error => {
        console.log(error.response);
      });
    };
    fetchEvacSummaryData();
  }, [id]);

  return (
    <>
    <div className="row mt-3" style={{marginBottom:"-8px"}}>
      <div className="col-12 d-flex">
        <h1 style={header_style}>
          Evac Summary
        </h1>
      </div>
    </div>
    <hr/>
    <div className="row mb-2">
      <div className="col-10 d-flex" style={{marginRight:"-15px"}}>
        <Card className="mb-2 border rounded" style={{width:"100%"}}>
          <Card.Body>
            <Card.Title>
              Team Members
            </Card.Title>
            <hr/>
            <ListGroup variant="flush">
              {data.team_member_objects.map(team_member => (
                <ListGroup.Item key={team_member.id}>{team_member.first_name} {team_member.last_name} - {team_member.phone} ({team_member.agency_id})</ListGroup.Item>
              ))}
            </ListGroup>
          </Card.Body>
        </Card>
      </div>
    </div>
    <div className="row">
      <div className="col-10" style={{marginRight:"-15px"}}>
      {data.service_request_objects.map(service_request => (
        <div key={service_request.id} className="mt-3">
            <Card className="mb-2 border rounded">
              <Card.Body>
                <Card.Title>Service Request #{service_request.id}<Link href={"/hotline/servicerequest/" + service_request.id}> <FontAwesomeIcon icon={faClipboardList} inverse /></Link> | {service_request.status}</Card.Title>
                <hr/>
                <ListGroup>
                  <ListGroup.Item><b>Address:</b> {service_request.address ? <span>{service_request.full_address}</span> : 'N/A'}</ListGroup.Item>
                  <ListGroup.Item><b>Owner:</b> {service_request.owner ? <span>{service_request.owner_object.first_name} {service_request.owner_object.last_name} {service_request.owner_object.phone} <Link href={"/hotline/owner/" + service_request.owner}> <FontAwesomeIcon icon={faClipboardList} inverse /></Link></span> : "N/A"}</ListGroup.Item>
                  <ListGroup.Item><b>Reporter:</b> {service_request.reporter ? <span>{service_request.reporter_object.first_name} {service_request.reporter_object.last_name} {service_request.reporter_object.phone} <Link href={"/hotline/reporter/" + service_request.reporter}> <FontAwesomeIcon icon={faClipboardList} inverse /></Link></span> : "N/A"}</ListGroup.Item>
                </ListGroup>
              </Card.Body>
            </Card>
        </div>
      ))}
      </div>
    </div>
    </>
  )
}
