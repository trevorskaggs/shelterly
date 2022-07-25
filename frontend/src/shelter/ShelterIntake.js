import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Link, navigate } from 'raviger';
import { ButtonGroup, Card, Col, Form as BootstrapForm, ListGroup, OverlayTrigger, Row, Tooltip } from 'react-bootstrap';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClipboardList, faArrowAltCircleLeft
} from '@fortawesome/free-solid-svg-icons';
import { DropDown } from '../components/Form';
import Header from '../components/Header';
import ButtonSpinner from '../components/ButtonSpinner';

const statusLabelLookup = {
  'REPORTED':'Reported',
  'SHELTERED IN PLACE':'Sheltered In Place (SIP)',
  'UNABLE TO LOCATE':'Unable To Locate (UTL)',
  'UNABLE TO LOCATE - NFA':'Unable To Locate - No Further Action',
  'DECEASED':'Deceased',
}

function AnimalStatus(props) {

  const roomRef = useRef(null);
  const shelterRef = useRef(null);

  return (
    <>
    <Row>
      <Col xs={4} className="pl-0" style={{marginLeft:"-5px"}}>
        <DropDown
          id={`sr_updates.${props.index}.animals.${props.inception}.status`}
          name={`sr_updates.${props.index}.animals.${props.inception}.status`}
          type="text"
          className="mt-0"
          options={[{value:props.animal.status, label:statusLabelLookup[props.animal.status]}, {value:'SHELTERED', label:'Sheltered'}]}
          value={`sr_updates.${props.index}.animals.${props.inception}.status`}
          key={`sr_updates.${props.index}.animals.${props.inception}.status`}
          isClearable={false}
          onChange={(instance) => {
            props.formikProps.setFieldValue(`sr_updates.${props.index}.animals.${props.inception}.status`, instance === null ? '' : instance.value);
            props.formikProps.setFieldValue(`sr_updates.${props.index}.animals.${props.inception}.shelter`, '');
            if (shelterRef.current) shelterRef.current.select.clearValue();
          }}
        />
      </Col>
      <span style={{ marginTop:"-6px", marginBottom: "-4px", fontSize: "30px", textTransform:"capitalize" }}>
        A#{props.animal.id} - {props.animal.name || "Unknown"}&nbsp;-&nbsp;{props.animal.species}
        {props.animal.color_notes ?
        <OverlayTrigger
          key={"animal-color-notes"}
          placement="top"
          overlay={
            <Tooltip id={"tooltip-animal-color-notes"}>
              {props.animal.color_notes}
            </Tooltip>
          }
        >
          <FontAwesomeIcon icon={faClipboardList} className="ml-1 mr-1" inverse />
        </OverlayTrigger>
        : ""}
        {props.animal.pcolor || props.animal.scolor ? <span>({props.animal.pcolor ? props.animal.pcolor : "" }{props.animal.scolor ? <span>{props.animal.pcolor ? <span>, </span> : ""}{props.animal.scolor}</span> : ""})</span>: ""}
      </span>
    </Row>
    {props.formikProps.values && props.formikProps.values.sr_updates[props.index] && props.formikProps.values.sr_updates[props.index].animals[props.inception].status === 'SHELTERED' ?
    <Row>
      <Col xs={4} className="pl-0" style={{marginLeft:"-5px"}}>
        <DropDown
          id={`sr_updates.${props.index}.animals.${props.inception}.shelter`}
          name={`sr_updates.${props.index}.animals.${props.inception}.shelter`}
          type="text"
          ref={shelterRef}
          className="mt-3"
          options={props.shelter_options}
          value={`sr_updates.${props.index}.animals.${props.inception}.shelter`}
          isClearable={false}
          placeholder="Select Shelter..."
          onChange={(instance) => {
            props.formikProps.setFieldValue(`sr_updates.${props.index}.animals.${props.inception}.room`, '');
            props.formikProps.setFieldValue(`sr_updates.${props.index}.animals.${props.inception}.shelter`, instance === null ? '' : instance.value);
            roomRef.current.select.clearValue();
          }}
        />
      </Col>
      <Col xs={6} className="pl-0">
        <DropDown
          id={`sr_updates.${props.index}.animals.${props.inception}.room`}
          name={`sr_updates.${props.index}.animals.${props.inception}.room`}
          type="text"
          ref={roomRef}
          className="mt-3"
          options={props.room_options[props.formikProps.values.sr_updates[props.index].animals[props.inception].shelter] ? props.room_options[props.formikProps.values.sr_updates[props.index].animals[props.inception].shelter] : []}
          isClearable={true}
          placeholder="Select Room..."
          value={`sr_updates.${props.index}.animals.${props.inception}.room`}
          onChange={(instance) => {
            props.formikProps.setFieldValue(`sr_updates.${props.index}.animals.${props.inception}.room`, instance === null ? '' : instance.value);
          }}
        />
      </Col>
    </Row>
    : ""}
    </>
  )
}

function ShelterIntake({ id, incident }) {

  const [options, setOptions] = useState({shelter_options:[], room_options: {}, da_options:[]});
  const [data, setData] = useState({shelter: {}, dispatch_assignments: [], sr_updates: [], isFetching: false});
  const [selected, setSelected] = useState(null);

  // Hook for initializing data.
  useEffect(() => {
    let unmounted = false;
    let source = axios.CancelToken.source();

    const fetchShelter = async () => {
      // Fetch current ServiceRequest data.
      await axios.get('/shelter/api/shelter/' + id + '/', {
        cancelToken: source.token,
      })
      .then(currentResponse => {
        if (!unmounted) {
          let room_options = {};
          let shelter_options = [{value: currentResponse.data.id, label: currentResponse.data.name}];
          room_options[currentResponse.data.id] = [];
          currentResponse.data.buildings.forEach(building => {
            building.rooms.forEach(room => {
              // Build room option list identified by shelter ID.
              room_options[currentResponse.data.id].push({value: room.id, label: room.building_name + ' - ' + room.name + ' (' + room.animal_count + ' animals)'});
            });
          });
          // Fetch active DA data.
          axios.get('/evac/api/evacassignment/?incident=' + incident, {
            params: {
              status: 'active',
              map: true
            },
            cancelToken: source.token,
          })
          .then(response => {
            if (!unmounted) {
              let da_options = [];
              response.data.forEach((da, index) => {
                da_options.push({value: da.id, label: "DA#" + da.id + " | " + da.team_name + ": " + da.team_object.display_name});
                response.data[index]["sr_updates"] = [];
                da.assigned_requests.forEach((assigned_request, inception) => {
                  response.data[index].sr_updates.push({
                    id: assigned_request.service_request_object.id,
                    animals: Object.keys(assigned_request.animals).map(animal_id => {return {id:animal_id, name:assigned_request.animals[animal_id].name, species:assigned_request.animals[animal_id].species, status:assigned_request.animals[animal_id].status, color_notes:assigned_request.animals[animal_id].color_notes, pcolor:assigned_request.animals[animal_id].pcolor, scolor:assigned_request.animals[animal_id].scolor, request:assigned_request.service_request_object.id, shelter:assigned_request.animals[animal_id].shelter || '', room:assigned_request.animals[animal_id].room || ''}}),
                  });
                });
              });
              setData({shelter: currentResponse.data, dispatch_assignments: response.data, sr_updates: [], isFetching: false});
              setOptions({shelter_options:shelter_options, room_options: room_options, da_options:da_options});
              console.log(response.data)
            }
          })
          .catch(error => {
            if (!unmounted) {
              setData({shelter: {}, dispatch_assignments: [], sr_updates: [], isFetching: false});
            }
          });
        }
      })
    };

    fetchShelter();
    // Cleanup.
    return () => {
      unmounted = true;
      source.cancel();
    };
  }, [id, incident]);

  return (
    <Formik
      initialValues={data}
      enableReinitialize={true}
      validationSchema={Yup.object({
        sr_updates: Yup.array().of(
          Yup.object().shape({
            id: Yup.number().required(),
            animals: Yup.array().of(
              Yup.object().shape({
                id: Yup.number().required(),
                status: Yup.string(),
                shelter: Yup.number().nullable(),
                room: Yup.number().nullable(),
              })
            ),
          })
        ),
      })}
      onSubmit={(values, { setSubmitting }) => {
        setTimeout(() => {
          axios.put('/evac/api/evacassignment/' + selected + '/', values)
            .then(response => {
              if (response.data.service_requests.length === 0) {
                navigate('/' + incident + '/dispatch/dispatchassignment/search');
              }
              else {
                navigate('/' + incident + '/dispatch/summary/' + response.data.id);
              }
            })
            .catch(error => {
              setSubmitting(false);
            });
        }, 500);
      }}
    >
      {props => (
        <BootstrapForm as={Form}>
          <Header>
            <span style={{cursor:'pointer'}} onClick={() => window.history.back()} className="mr-2"><FontAwesomeIcon icon={faArrowAltCircleLeft} size="sm" inverse /></span>
            {data.shelter.name}
            &nbsp;- Dispatch Intake
          </Header>
          <hr/>
          <Row>
            <Col xs={12}>
              <DropDown
                id={"da_select"}
                name={"da_select"}
                type="text"
                size="lg"
                options={options.da_options}
                isClearable={false}
                placeholder="Select Dispatch..."
                onChange={(instance) => {
                  instance.value ? setSelected(instance.value) : setSelected(null);
                  let selected_da = data.dispatch_assignments.filter(da => da.id === instance.value)[0];
                  setData(prevState => ({ ...prevState, "sr_updates":selected_da.sr_updates }));
                }}
              />
            </Col>
          </Row>
          {selected ?
          <Row>
            {data.dispatch_assignments.filter(da => da.id === selected)[0].assigned_requests.map((assigned_request, index) => (
            <Col xs={10} key={assigned_request.service_request_object.id} className="pl-0" >
              <Card className="mt-3 ml-3 border rounded">
                <Card.Body>
                  <Card.Title style={{marginBottom:"-5px"}}>
                    <h4>
                      SR#{assigned_request.service_request_object.id} -&nbsp;
                      <Link href={"/" + incident + "/hotline/servicerequest/" + assigned_request.service_request_object.id} className="text-link" style={{textDecoration:"none", color:"white"}}>{assigned_request.service_request_object.full_address}</Link>
                    </h4>
                  </Card.Title>
                  <hr />
                  <ListGroup variant="flush" style={{ marginTop: "-13px", marginBottom: "-13px" }}>
                    <h4 className="mt-2" style={{ marginBottom: "-2px" }}>Animals</h4>
                    {data.sr_updates[index] && data.sr_updates[index].animals.map((animal, inception) => (
                      <ListGroup.Item key={animal}>
                        <AnimalStatus formikProps={props} index={index} inception={inception} animal={animal} shelter_options={options.shelter_options} room_options={options.room_options} />
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </Card.Body>
              </Card>
            </Col>
            ))}
          </Row> : ""}
          {selected ?
          <ButtonGroup size="lg" className="col-12 pl-0 pr-0 mt-3 mb-3">
            <ButtonSpinner isSubmitting={props.isSubmitting} isSubmittingText="Saving..." className="btn btn-block" type="submit">
              Save
            </ButtonSpinner>
          </ButtonGroup> : ""}
        </BootstrapForm>
      )}
    </Formik>
  )
}

export default ShelterIntake
