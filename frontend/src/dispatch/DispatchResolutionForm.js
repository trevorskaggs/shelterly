import React, { useContext, useEffect, useRef, useState } from 'react';
import axios from "axios";
import { Link, navigate } from "raviger";
import { Field, Form, Formik } from 'formik';
import { Switch } from 'formik-material-ui';
import {
  Form as BootstrapForm,
  ButtonGroup,
  Card,
  Col,
  ListGroup,
  OverlayTrigger,
  Row,
  Tooltip,
} from 'react-bootstrap';
import * as Yup from 'yup';
import {
  useOrderedNodes
} from "react-register-nodes";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClipboardList
} from '@fortawesome/free-solid-svg-icons';
import smoothScrollIntoView from "smooth-scroll-into-view-if-needed";
import Moment from 'react-moment';
import Header from '../components/Header';
import { Checkbox, DateTimePicker, DropDown, TextInput } from '../components/Form';
import { statusChoices } from '../animals/constants';
import ButtonSpinner from '../components/ButtonSpinner';
import { priorityChoices } from '../constants';
import { SystemErrorContext } from '../components/SystemError';

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
          options={statusChoices}
          value={`sr_updates.${props.index}.animals.${props.inception}.status`}
          key={`sr_updates.${props.index}.animals.${props.inception}.status`}
          isClearable={false}
          onChange={(instance) => {
            props.formikProps.setFieldValue(`sr_updates.${props.index}.animals.${props.inception}.status`, instance === null ? '' : instance.value);
            props.formikProps.setFieldValue(`sr_updates.${props.index}.animals.${props.inception}.shelter`, '');
            if (shelterRef.current) shelterRef.current.select.clearValue();
            // Hack to proprly update Cannot Remain Reported error display.
            if (instance.value.includes('REPORTED')) {
              props.formikProps.setFieldTouched(`sr_updates.${props.index}.animals.${props.inception}.status`)
            }
          }}
        />
      </Col>
      <span style={{ marginTop:"-3px", marginBottom: "-4px", fontSize: "26px", textTransform:"capitalize" }}>
        A#{props.animal.id} - {props.animal.name || "Unknown"}&nbsp;-&nbsp;{props.animal.species}
        {props.animal.color_notes ?
        <OverlayTrigger
          key={"animal-color-notes"}
          placement="top"
          overlay={
            <Tooltip id={`tooltip-animal-color-notes`}>
              {props.animal.color_notes}
            </Tooltip>
          }
        >
          <FontAwesomeIcon icon={faClipboardList} className="ml-1" inverse />
        </OverlayTrigger>
        : ""}
        {props.animal.pcolor || props.animal.scolor ? <span className="ml-1">({props.animal.pcolor ? props.animal.pcolor : "" }{props.animal.scolor ? <span>{props.animal.pcolor ? <span>/</span> : ""}{props.animal.scolor}</span> : ""})</span>: ""}
      </span>
    </Row>
    {props.formikProps.values && props.formikProps.values.sr_updates[props.index] && props.formikProps.values.sr_updates[props.index].animals[props.inception] && props.formikProps.values.sr_updates[props.index].animals[props.inception].status === 'SHELTERED' ?
    <Row>
      <Col xs={4} className="pl-0" style={{marginLeft:"-5px"}}>
        <DropDown
          id={`sr_updates.${props.index}.animals.${props.inception}.shelter`}
          name={`sr_updates.${props.index}.animals.${props.inception}.shelter`}
          type="text"
          ref={shelterRef}
          className="mt-3"
          options={props.shelters.options}
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
          options={props.shelters.room_options[props.formikProps.values.sr_updates[props.index].animals[props.inception].shelter] ? props.shelters.room_options[props.formikProps.values.sr_updates[props.index].animals[props.inception].shelter] : []}
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

function DispatchResolutionForm({ id, incident }) {

  const { setShowSystemError } = useContext(SystemErrorContext);

  // Initial animal data.
  const [data, setData] = useState({
    id: null,
    closed: false,
    team_members: [],
    team_member_objects: [],
    team: null,
    team_object: {name:''},
    service_requests: [],
    assigned_requests: [],
    start_time: null,
    end_time: null,
    sr_updates: [],
    incident_slug: incident,
  });

  const [shelters, setShelters] = useState({options: [], room_options: {}, isFetching: false});
  const [ownerChoices, setOwnerChoices] = useState({});
  const [saveClose, setSaveClose] = useState(false);

  const ordered = useOrderedNodes();
  const [shouldCheckForScroll, setShouldCheckForScroll] = React.useState(false);

  // Hook for initializing data.
  useEffect(() => {
    let unmounted = false;
    let source = axios.CancelToken.source();

    const fetchEvacAssignmentData = () => {
      // Fetch Evac Assignment data.
      axios.get('/evac/api/evacassignment/' + id + '/', {
        cancelToken: source.token,
      })
      .then(response => {
        if (!unmounted) {
          let ownerChoices = {}
          response.data["sr_updates"] = [];
          response.data.assigned_requests.forEach((assigned_request, index) => {
            ownerChoices[assigned_request.service_request_object.id] = []
            assigned_request.service_request_object.owner_objects.forEach(owner => {
              ownerChoices[assigned_request.service_request_object.id].push({value: owner.id, label: owner.first_name + ' ' + owner.last_name})
            })
            response.data.sr_updates.push({
              id: assigned_request.service_request_object.id,
              followup_date: assigned_request.followup_date,
              priority: assigned_request.service_request_object.priority,
              date_completed: assigned_request.visit_note ? assigned_request.visit_note.date_completed : new Date(),
              notes: assigned_request.visit_note ? assigned_request.visit_note.notes : '',
              forced_entry: assigned_request.visit_note ? assigned_request.visit_note.forced_entry : false,
              animals: Object.keys(assigned_request.animals).map(animal_id => {return {id:animal_id, name:assigned_request.animals[animal_id].name, species:assigned_request.animals[animal_id].species, status:assigned_request.animals[animal_id].status, color_notes:assigned_request.animals[animal_id].color_notes, pcolor:assigned_request.animals[animal_id].pcolor, scolor:assigned_request.animals[animal_id].scolor, request:assigned_request.service_request_object.id, shelter:assigned_request.animals[animal_id].shelter || '', room:assigned_request.animals[animal_id].room || ''}}),
              owner: assigned_request.service_request_object.owners.length > 0,
              owner_contact_id: assigned_request.owner_contact ? assigned_request.owner_contact.owner : '',
              owner_contact_time: assigned_request.owner_contact ? assigned_request.owner_contact.owner_contact_time : null,
              owner_contact_note: assigned_request.owner_contact ? assigned_request.owner_contact.owner_contact_note : '',
              unable_to_complete: false,
            });
          });
          setOwnerChoices(ownerChoices);
          setData(response.data);
        }
      })
      .catch(error => {
        if (!unmounted) {
          setShowSystemError(true);
        }
      });
    };

    const fetchShelters = () => {
      setShelters({options: [], room_options: [], isFetching: true});
      // Fetch Shelter data.
      axios.get('/shelter/api/shelter/?incident=' + incident, {
        cancelToken: source.token,
      })
      .then(response => {
        if (!unmounted) {
          let options = [];
          let room_options = {};
          response.data.forEach(shelter => {
            options.push({value: shelter.id, label: shelter.name});
            room_options[shelter.id] = [];
            shelter.buildings.forEach(building => {
              building.rooms.forEach(room => {
                // Build room option list identified by shelter ID.
                room_options[shelter.id].push({value: room.id, label: room.building_name + ' - ' + room.name + ' (' + room.animal_count + ' animals)'});
              });
            });
          });
          setShelters({options: options, room_options: room_options, isFetching: false});
        }
      })
      .catch(error => {
        if (!unmounted) {
          setShelters({options: [], room_options: [], isFetching: false});
          setShowSystemError(true);
        }
      });
    };

    fetchEvacAssignmentData();
    fetchShelters();

    // Cleanup.
    return () => {
      unmounted = true;
      source.cancel();
    };
  }, [id, incident]);

  // Hook scrolling to top error.
  useEffect(() => {
    if (shouldCheckForScroll && ordered.length > 0) {
      smoothScrollIntoView(ordered[0], {
        scrollMode: "if-needed",
        block: "center",
        inline: "start"
      }).then(() => {
        if (ordered[0].querySelector("input")) {
          ordered[0].querySelector("input").focus();
        }
        setShouldCheckForScroll(false);
      });
    }
    // Cleanup.
    return () => {
    };
  }, [shouldCheckForScroll, ordered]);

  return (
    <Formik
      initialValues={data}
      enableReinitialize={true}
      validationSchema={Yup.object({
        start_time: Yup.date(),
        end_time: Yup.date().nullable(),
        service_requests: Yup.array(),
        team_members: Yup.array(),
        sr_updates: Yup.array().of(
          Yup.object().shape({
            id: Yup.number().required(),
            owner: Yup.boolean(),
            priority: Yup.number(),
            unable_to_complete: Yup.boolean(),
            followup_date: Yup.date().nullable(),
            animals: Yup.array().of(
              Yup.object().shape({
                id: Yup.number().required(),
                status: Yup.string(),
                  // .test('required-check', 'Animal cannot remain REPORTED.',
                  //   function(value) {
                  //     let required = true;
                  //     data.sr_updates.filter(sr => sr.id === this.parent.request).forEach(sr_update => {
                  //       if (sr_update.unable_to_complete || sr_update.incomplete) {
                  //         required = false;
                  //       }
                  //     })
                  //     if (value.includes('REPORTED') && required) {
                  //       return false;
                  //     }
                  //     return true;
                  //   }),
                shelter: Yup.number().nullable(),
                room: Yup.number().nullable(),
              })
            ),
            date_completed: Yup.date().nullable().when(['unable_to_complete'], {
              is: false,
              then: Yup.date().required('Required.')}),
            notes: Yup.string(),
            forced_entry: Yup.boolean(),
            owner_contact_id: Yup.number().nullable(),
            owner_contact_time: Yup.date().nullable(),
            owner_contact_note: Yup.string(),
          })
        ),
      })}
      onSubmit={(values, { setSubmitting }) => {
        setTimeout(() => {
          values['closed'] = saveClose;
          axios.put('/evac/api/evacassignment/' + id + '/', values)
            .then(response => {
              if (response.data.service_requests.length === 0) {
                navigate('/' + incident + '/dispatch');
              }
              else {
                navigate('/' + incident + '/dispatch/summary/' + response.data.id);
              }
            })
            .catch(error => {
              setSubmitting(false);
              setShowSystemError(true);
            });
        }, 500);
      }}
    >
      {props => (
        <>
          <BootstrapForm as={Form}>
            <Header>Dispatch Assignment and Resolution
              <div style={{ fontSize: "18px", marginTop: "10px" }}><b>Opened: </b><Moment format="MMMM Do YYYY, HH:mm">{data.start_time}</Moment>{data.closed && data.end_time ? <span style={{ fontSize: "16px", marginTop: "5px" }}> | <b>Closed: </b><Moment format="MMMM Do YYYY, HH:mm">{data.end_time}</Moment></span> : ""}</div>
            </Header>
            <hr/>
            <Card className="mt-3 border rounded">
              <Card.Body>
                <Card.Title>
                  <h4>{data.team_object.name}</h4>
                </Card.Title>
                <hr />
                <ListGroup variant="flush" style={{ marginTop: "-13px", marginBottom: "-13px", textTransform: "capitalize" }}>
                  {data.team && data.team_object.team_member_objects.map(team_member => (
                    <ListGroup.Item key={team_member.id}>
                      {team_member.first_name + " " + team_member.last_name}{team_member.agency_id ? <span>&nbsp;({team_member.agency_id})</span> : ""}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card.Body>
            </Card>
            {data.assigned_requests.filter(request => request.service_request_object.animals.length > 0).map((assigned_request, index) => (
              <Card key={assigned_request.service_request_object.id} className="mt-3 border rounded">
                <Card.Body>
                  <Card.Title style={{marginBottom:"-5px", marginTop:"-5px"}}>
                    <h4>
                      SR#{assigned_request.service_request_object.id} -&nbsp;
                      <Link href={"/" + incident + "/hotline/servicerequest/" + assigned_request.service_request_object.id} className="text-link" style={{textDecoration:"none", color:"white"}}>{assigned_request.service_request_object.full_address}</Link> |&nbsp;
                      <Checkbox
                        label={"Unable to Complete:"}
                        name={`sr_updates.${index}.unable_to_complete`}
                        disabled={data.closed ? true : false}
                        checked={(props.values.sr_updates[index] && props.values.sr_updates[index].unable_to_complete) || false}
                        onChange={() => {
                          if (props.values.sr_updates[index] && props.values.sr_updates[index].unable_to_complete) {
                            props.setFieldValue(`sr_updates.${index}.owner`, assigned_request.service_request_object.owners.length > 0);
                            const newItems = [...data.sr_updates];
                            newItems[index].unable_to_complete = false;
                            setData(prevState => ({...prevState, sr_updates: newItems}))
                            props.setFieldValue(`sr_updates.${index}.unable_to_complete`, false);
                          }
                          else {
                            props.setFieldValue(`sr_updates.${index}.owner`, false);
                            const newItems = [...data.sr_updates];
                            newItems[index].unable_to_complete = true;
                            setData(prevState => ({...prevState, sr_updates: newItems}))
                            props.setFieldValue(`sr_updates.${index}.unable_to_complete`, true);
                            props.setFieldValue(`sr_updates.${index}.date_completed`, null);
                          }
                        }}
                        style={{
                          transform: "scale(1.5)",
                          marginTop: "-4px"
                        }}
                      />
                    </h4>
                  </Card.Title>
                  <hr />
                  <ListGroup variant="flush" style={{ marginTop: "-13px", marginBottom: "-13px" }}>
                    {assigned_request.service_request_object.owner_objects.map(owner => (
                      <ListGroup.Item key={owner.id}><b>Owner: </b>{owner.first_name} {owner.last_name}</ListGroup.Item>
                    ))}
                    {assigned_request.service_request_object.owners.length < 1 ? <ListGroup.Item><b>Owner: </b>No Owner</ListGroup.Item> : ""}
                      <ListGroup.Item><b>Instructions for Field Team: </b>{ assigned_request.service_request_object.directions ? assigned_request.service_request_object.directions : "N/A"}</ListGroup.Item>
                      <ListGroup.Item>
                        <b>Accessible: </b>{ assigned_request.service_request_object.accessible ? "Yes" : "No"},&nbsp;
                        <b>Turn Around: </b>{ assigned_request.service_request_object.turn_around ? "Yes" : "No"}
                      </ListGroup.Item>
                  </ListGroup>
                  <hr />
                  <ListGroup variant="flush" style={{ marginTop: "-13px", marginBottom: "-13px" }}>
                    <h4 className="mt-2" style={{ marginBottom: "-2px" }}>Animals</h4>
                    {data.sr_updates[index].animals.filter(animal => animal.status !== 'CANCELED' && Object.keys(assigned_request.animals).includes(String(animal.id))).map((animal, inception) => (
                      <ListGroup.Item key={animal.id}>
                        <AnimalStatus formikProps={props} index={index} inception={inception} animal={animal} shelters={shelters} />
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                  <hr />
                  <BootstrapForm.Row className="mb-3">
                    <Col xs={"4"}>
                      <DropDown
                        label="Priority"
                        id={`sr_updates.${index}.priority`}
                        name={`sr_updates.${index}.priority`}
                        type="text"
                        key={`my_unique_priority_select_key__${props.values.priority}`}
                        options={priorityChoices}
                        value={props.values.sr_updates[index] ? props.values.sr_updates[index].priority : 2}
                        isClearable={false}
                        onChange={(instance) => {
                          props.setFieldValue(`sr_updates.${index}.priority`, instance === null ? '' : instance.value);
                        }}
                      />
                    </Col>
                  </BootstrapForm.Row>
                  <BootstrapForm.Row className="mt-3">
                    <DateTimePicker
                      label="Date Completed"
                      name={`sr_updates.${index}.date_completed`}
                      id={`sr_updates.${index}.date_completed`}
                      xs="4"
                      data-enable-time={false}
                      clearable={false}
                      onChange={(date, dateStr) => {
                        props.setFieldValue(`sr_updates.${index}.date_completed`, dateStr)
                      }}
                      disabled={false}
                      value={props.values.sr_updates[index] ? props.values.sr_updates[index].date_completed : new Date()}
                    />
                  </BootstrapForm.Row>
                  <BootstrapForm.Row className="mt-3">
                    <DateTimePicker
                      label="Service Request Followup Date"
                      name={`sr_updates.${index}.followup_date`}
                      id={`sr_updates.${index}.followup_date`}
                      more_options={{minDate:new Date()}}
                      xs="4"
                      data-enable-time={false}
                      onChange={(date, dateStr) => {
                        props.setFieldValue(`sr_updates.${index}.followup_date`, dateStr)
                      }}
                      value={assigned_request.followup_date || null}
                      disabled={data.end_time !== null && assigned_request.followup_date !== assigned_request.service_request_object.followup_date}
                    />
                  </BootstrapForm.Row>
                  <BootstrapForm.Row className="mt-3">
                    <TextInput
                      id={`sr_updates.${index}.notes`}
                      name={`sr_updates.${index}.notes`}
                      xs="9"
                      as="textarea"
                      rows={5}
                      label="Visit Notes"
                    />
                  </BootstrapForm.Row>
                  <BootstrapForm.Row>
                    <Col>
                      <BootstrapForm.Label htmlFor={`sr_updates.${index}.forced_entry`} className="mt-1">Forced Entry</BootstrapForm.Label>
                      <Field component={Switch} name={`sr_updates.${index}.forced_entry`} type="checkbox" color="primary" />
                    </Col>
                  </BootstrapForm.Row>
                  {assigned_request.service_request_object.owners.length > 0 ?
                    <span>
                      <BootstrapForm.Row className="mt-2">
                        <Col xs="4">
                         <DropDown
                          label="Owner Contacted"
                          id={`sr_updates.${index}.owner_contact_id`}
                          name={`sr_updates.${index}.owner_contact_id`}
                          key={`sr_updates.${index}.owner_contact_id`}
                          type="text"
                          xs="4"
                          options={ownerChoices[assigned_request.service_request_object.id]}
                          value={props.values.sr_updates[index] ? props.values.sr_updates[index].owner_contact_id : null}
                          isClearable={true}
                        />
                        </Col>
                      </BootstrapForm.Row>
                      <BootstrapForm.Row className="mt-3">
                        <DateTimePicker
                          label="Owner Contact Time"
                          name={`sr_updates.${index}.owner_contact_time`}
                          id={`sr_updates.${index}.owner_contact_time`}
                          xs="4"
                          data-enable-time={true}
                          clearable={true}
                          onChange={(date, dateStr) => {
                            props.setFieldValue(`sr_updates.${index}.owner_contact_time`, dateStr)
                          }}
                          value={props.values.sr_updates[index] ? props.values.sr_updates[index].owner_contact_time : null}
                        />
                      </BootstrapForm.Row>
                      <BootstrapForm.Row className="mt-3" style={{marginBottom:"-15px"}}>
                        <TextInput
                          id={`sr_updates.${index}.owner_contact_note`}
                          name={`sr_updates.${index}.owner_contact_note`}
                          xs="9"
                          as="textarea"
                          rows={5}
                          label="Owner Contact Note"
                        />
                      </BootstrapForm.Row>
                    </span>
                    : ""}
                </Card.Body>
              </Card>
            ))}
            <ButtonGroup size="lg" className="col-12 pl-0 pr-0 mt-3 mb-3">
              <ButtonSpinner isSubmitting={props.isSubmitting} isSubmittingText="Saving..." className="btn btn-block border col-6" type="submit" onClick={() => { setSaveClose(false); setShouldCheckForScroll(true); }}>
                Save
              </ButtonSpinner>
              <ButtonSpinner isSubmitting={props.isSubmitting} isSubmittingText="Saving..." className="btn border col-6" type="submit" onClick={() => { setSaveClose(true); setShouldCheckForScroll(true); }}>
                Save and Close
              </ButtonSpinner>
            </ButtonGroup>
          </BootstrapForm>
        </>
      )}
    </Formik>
  )
}

export default DispatchResolutionForm;
