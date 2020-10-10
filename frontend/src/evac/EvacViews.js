import React, { useEffect, useState } from 'react';
import axios from "axios";
import { Link, navigate } from 'raviger';
import { Form, Formik } from 'formik';
import { Button, Col, Container, FormGroup, FormCheck, OverlayTrigger, Row, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBandAid, faCar, faClipboardList, faShieldAlt, faTrailer
} from '@fortawesome/free-solid-svg-icons';
import { CircleMarker, Map, TileLayer, Tooltip as MapTooltip } from "react-leaflet";
import L from "leaflet"
import { Typeahead } from 'react-bootstrap-typeahead';

import 'react-bootstrap-typeahead/css/Typeahead.css';
import 'leaflet/dist/leaflet.css';

export function Dispatch() {

  const [data, setData] = useState({service_requests: [], isFetching: false, bounds:L.latLngBounds([[0,0]])});
  const [mapState, setMapState] = useState({});
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

  // Handle dynamic SR state and map display.
  const handleMapState = (id, form) => {
    if (mapState[id].checked === false) {
      setMapState(prevState => ({ ...prevState, [id]: {color:"green", checked:true, hidden:false, matches:mapState[id].matches} }));
    }
    else {
      setMapState(prevState => ({ ...prevState, [id]: {color:"red", checked:false, hidden:false, matches:mapState[id].matches} }));
    }
    form.setFieldValue('service_requests', Object.keys(mapState).filter(key => mapState[key].checked === true))
  }

  // Takes in animal size, species, and count and returns a pretty string combination.
  const prettyText = (size, species, count) => {
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
          setMapState(prevState => ({ ...prevState, [service_request.id]: {color:mapState[service_request.id].color, checked:mapState[service_request.id].checked, hidden:true, matches:mapState[service_request.id].matches} }));
        }
        else {
          setMapState(prevState => ({ ...prevState, [service_request.id]: {color:mapState[service_request.id].color, checked:mapState[service_request.id].checked, hidden:false, matches:mapState[service_request.id].matches} }));
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
            map_dict[service_request.id] = {color:"red", checked:false, hidden:false, matches:matches};
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
    <Formik
      initialValues={{
        team_members: [],
        service_requests: [],
      }}
      onSubmit={(values, { setSubmitting }) => {
        setTimeout(() => {
          axios.post('/evac/api/evacassignment/', values)
          .then(function() {
            navigate('/evac');
          })
          .catch(error => {
            console.log(error.response);
          });
          setSubmitting(false);
        }, 500);
      }}
    >
    {form => (
      <Form>
        <Container>
          <Row>
            <FormGroup style={{ marginTop: '20px' }}>
              <Typeahead
                id="team-members"
                multiple
                onChange={(values) => {form.setFieldValue('team_members', values.map(item => item.id))}}
                options={teamData.options}
                placeholder="Choose team members..."
              />
            </FormGroup>
            </Row>
            <Row>
              <Col xs={12}>
                <Map className="mx-auto d-block" bounds={data.bounds} onMoveEnd={onMove}>
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
                      onClick={() => handleMapState(service_request.id, form)}
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
                        </span>
                      </MapTooltip>
                    </CircleMarker>
                  ))}
                </Map>
              </Col>
            </Row>
            <Row>
              <FormCheck id="aco_required" name="aco_required" type="switch" label="ACO Required" checked={statusOptions.ACORequired} onChange={handleACO} />
              <Button type="submit" className="mt-2 mb-1">Deploy!</Button>
            {data.service_requests.map(service_request => (
              <div key={service_request.id} className="mt-2" hidden={mapState[service_request.id] ? mapState[service_request.id].hidden : false}>
                <div className="card-header">
                  <span style={{display:"inline"}} className="custom-control-lg custom-control custom-checkbox">
                    <input className="custom-control-input" type="checkbox" name={service_request.id} id={service_request.id} onChange={() => handleMapState(service_request.id, form)} checked={mapState[service_request.id] ? mapState[service_request.id].checked : false} />
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
                    <FontAwesomeIcon icon={faShieldAlt} inverse className="ml-1"/>
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
                    <FontAwesomeIcon icon={faBandAid} inverse className="ml-1"/>
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
                    <FontAwesomeIcon icon={faCar} inverse className="ml-1"/>
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
                    <FontAwesomeIcon icon={faTrailer} inverse className="ml-1"/>
                  </OverlayTrigger>
                   : ""}
                  <span className="ml-2">| &nbsp;{service_request.full_address}</span>
                  <Link href={"/hotline/servicerequest/" + service_request.id}> <FontAwesomeIcon icon={faClipboardList} inverse /></Link>
                </div>
              </div>
            ))}
            </Row>
        </Container>
      </Form>
    )}
  </Formik>
  )
}
