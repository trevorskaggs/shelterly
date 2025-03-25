import React, { useContext, useEffect, useRef, useState } from 'react';
import axios from "axios";
import { Link, navigate } from "raviger";
import { Field, Form, Formik } from 'formik';
import { Switch } from 'formik-material-ui';
import {
  Form as BootstrapForm,
  Button,
  ButtonGroup,
  Card,
  Col,
  ListGroup,
  Modal,
  OverlayTrigger,
  Row,
  Tooltip,
} from 'react-bootstrap';
import * as Yup from 'yup';
import RangeSlider from 'react-bootstrap-range-slider';
import {
  useOrderedNodes
} from "react-register-nodes";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClipboardList, faPlusSquare
} from '@fortawesome/free-solid-svg-icons';
import smoothScrollIntoView from "smooth-scroll-into-view-if-needed";
import Moment from 'react-moment';
import Header from '../components/Header';
import { Checkbox, DateTimePicker, DropDown, TextInput } from '../components/Form';
import { statusChoices, statusChoicesNFA } from '../animals/constants';
import ButtonSpinner from '../components/ButtonSpinner';
import { priorityChoices } from '../constants';
import { AuthContext } from "../accounts/AccountsReducer";
import { SystemErrorContext } from '../components/SystemError';
import { titleCase } from '../components/Utils';
import ActionsDropdown from '../components/ActionsDropdown';
import LoadingLink from "../components/LoadingLink";
import { faSparkles, faSplit } from '@fortawesome/pro-solid-svg-icons';
import { catAgeChoices, dogAgeChoices, horseAgeChoices, otherAgeChoices, catColorChoices, dogColorChoices, horseColorChoices, otherColorChoices, sexChoices, dogSizeChoices, catSizeChoices, horseSizeChoices, otherSizeChoices, reportedStatusChoices, unknownChoices, otherAgeChoice } from '../animals/constants';
import CustomSelect from "../components/CustomSelect.js";

function AnimalStatus(props) {

  const roomRef = useRef(null);
  const shelterRef = useRef(null);

  let newStatusChoices = statusChoices;
  let newStatusChoicesNFA = statusChoicesNFA;
  if (props.formikProps.values.assigned_requests[props.index] && props.formikProps.values.assigned_requests[props.index].animals[props.animal.id].is_new) {
    newStatusChoices = [ ...statusChoicesNFA, {value:'DID NOT SEARCH FOR', label:'Did Not Search For'} ]
    newStatusChoicesNFA = [ ...statusChoicesNFA, {value:'DID NOT SEARCH FOR', label:'Did Not Search For'} ]
  }

  return (
    <>
    <Row>
      <Col xs={4} className="pl-0 mr-2" style={{marginLeft:"-5px", paddingRight:"3px"}}>
        <DropDown
          id={`sr_updates.${props.index}.animals.${props.inception}.status`}
          name={`sr_updates.${props.index}.animals.${props.inception}.status`}
          type="text"
          className="mt-0"
          options={props.formikProps.values && props.formikProps.values.sr_updates[props.index] && props.formikProps.values.sr_updates[props.index].animals[props.inception] && ['UNABLE TO LOCATE', 'NO FURTHER ACTION'].includes(props.formikProps.values.sr_updates[props.index].animals[props.inception].status) ? newStatusChoicesNFA : newStatusChoices}
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
      <span style={{ marginTop:"-3px", marginBottom: "-4px", fontSize: "26px"}}>
        {props.animal.id_for_incident ? <span>A#{props.animal.id_for_incident} - </span> : ""}{props.animal.animal_count > 1 ? <span>{props.animal.animal_count} <span style={{textTransform:"capitalize"}}>{props.animal.species}</span>{props.animal.animal_count > 1 && !["sheep", "cattle"].includes(props.animal.species) ? "s" : ""}</span> : <span>{props.animal.name||"Unknown"}&nbsp;-&nbsp;{titleCase(props.animal.species)}</span>}
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
          <FontAwesomeIcon icon={faClipboardList} size="sm" className="ml-1" inverse />
        </OverlayTrigger>
        : ""}
        {props.formikProps.values.assigned_requests[props.index] && props.formikProps.values.assigned_requests[props.index].animals[props.animal.id].is_new ?
          <OverlayTrigger
            key={"animal-is-new"}
            placement="top"
            overlay={
              <Tooltip id={`tooltip-animal-is-new`}>
                This animal was added to the Service Request while it was already assigned to this active Dispatch Assignment.
              </Tooltip>
            }
          >
            <FontAwesomeIcon icon={faSparkles} className="ml-1" size="sm" inverse />
          </OverlayTrigger>
        : ""}
        {props.animal.pcolor || props.animal.scolor ? <span className="ml-1">({props.animal.pcolor ? titleCase(props.animal.pcolor) : "" }{props.animal.scolor ? <span>{titleCase(props.animal.pcolor) ? <span>/</span> : ""}{titleCase(props.animal.scolor)}</span> : ""})</span>: ""}
      </span>
      {props.animal.animal_count > 1 && props.animal.id ?
        <ActionsDropdown alignRight={true} variant="dark" title="Actions" className="pt-0 ml-3">
          <LoadingLink onClick={() => {props.setShowSplit(true);props.setSelectedIndex(props.index);props.setSelectedInception(props.inception);props.setSelectedAnimal(props.animal)}} isLoading={false} className="text-white d-block py-1 px-3">
            <FontAwesomeIcon icon={faSplit} style={{cursor:'pointer'}} className='mr-1' size="lg" inverse />
            Split Animal Group
          </LoadingLink>
        </ActionsDropdown> : ""}
    </Row>
    {props.formikProps.values && props.formikProps.values.sr_updates[props.index] && props.formikProps.values.sr_updates[props.index].animals[props.inception] && props.formikProps.values.sr_updates[props.index].animals[props.inception].status === 'SHELTERED' ?
    <Row>
      <Col xs={4} className="pl-0 mr-2" style={{marginLeft:"-5px", paddingRight:"3px"}}>
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
      <Col xs={6} className="pl-0" style={{paddingRight:"3px"}}>
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

function DispatchResolutionForm({ id, incident, organization }) {

  const { state } = useContext(AuthContext);
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
    dispatch_date: null,
    sr_updates: [],
    incident_slug: incident,
  });

  const [showSplit, setShowSplit] = useState(false);
  const handleCloseSplit = () => setShowSplit(false);

  const [shelters, setShelters] = useState({options: [], room_options: {}, isFetching: false});
  const [ownerChoices, setOwnerChoices] = useState({});
  const [saveClose, setSaveClose] = useState(false);
  const [species, setSpecies] = useState({options: []});
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [selectedInception, setSelectedInception] = useState(null);
  const [selectedSR, setSelectedSR] = useState(null);
  const [selectedAnimal, setSelectedAnimal] = useState({'id':null, 'animal_count':1});

  const pcolorRef = useRef(null);
  const scolorRef = useRef(null);
  const sexRef = useRef(null);
  const sizeRef = useRef(null);
  const ageChoices = {'':[], 'dog':dogAgeChoices, 'cat':catAgeChoices, 'horse':horseAgeChoices, 'other':otherAgeChoices}
  const colorChoices = {'':[], 'dog':dogColorChoices, 'cat':catColorChoices, 'horse':horseColorChoices, 'other':otherColorChoices}
  const sizeChoices = {'':[], 'dog':dogSizeChoices, 'cat':catSizeChoices, 'horse':horseSizeChoices, 'other':otherSizeChoices}
  const [placeholder, setPlaceholder] = useState("Select a species...");

  const ordered = useOrderedNodes();
  const [shouldCheckForScroll, setShouldCheckForScroll] = React.useState(false);

  const [showAddNew, setShowAddNew] = useState(false);
  const [newData, setNewData] = useState({'name': '', sex:'', age:'', size:'', last_seen:null, 'animal_count':1, 'species':'', 'pcolor':'', 'scolor':'', 'behavior_notes':'', 'color_notes':'', 'medical_notes':'', aggressive:'unknown', aco_required:'unknown', injured:'unknown', confined:'unknown', fixed:'unknown', request:null})
  const handleCloseAddNew = () => setShowAddNew(false);

  // Hook for initializing data.
  useEffect(() => {
    let unmounted = false;
    let source = axios.CancelToken.source();

    const fetchEvacAssignmentData = () => {
      // Fetch Evac Assignment data.
      axios.get('/evac/api/incident/' + state.incident.id + '/evacassignment/' + id + '/', {
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
              followup_date: assigned_request.followup_date ? assigned_request.followup_date : new Date(new Date().setDate(new Date().getDate() + state.incident.default_followup_days)),
              priority: assigned_request.service_request_object.priority,
              date_completed: assigned_request.visit_note && assigned_request.visit_note.date_completed ? assigned_request.visit_note.date_completed : new Date(),
              directions: assigned_request.service_request_object.directions ? assigned_request.service_request_object.directions : '',
              notes: assigned_request.visit_note ? assigned_request.visit_note.notes : '',
              forced_entry: assigned_request.visit_note ? assigned_request.visit_note.forced_entry : false,
              status: assigned_request.service_request_object.status ? assigned_request.service_request_object.status : 'open',
              animals: Object.keys(assigned_request.animals).map(animal_id =>{return {
                id:animal_id,
                id_for_incident:assigned_request.animals[animal_id].id_for_incident,
                animal_count:assigned_request.animals[animal_id].animal_count,
                name:assigned_request.animals[animal_id].name,
                age:assigned_request.animals[animal_id].age,
                sex:assigned_request.animals[animal_id].sex,
                size:assigned_request.animals[animal_id].size,
                last_seen:assigned_request.animals[animal_id].last_seen,
                species:assigned_request.animals[animal_id].species,
                status:assigned_request.animals[animal_id].status,
                color_notes:assigned_request.animals[animal_id].color_notes,
                pcolor:assigned_request.animals[animal_id].pcolor,
                scolor:assigned_request.animals[animal_id].scolor,
                animal_notes:assigned_request.animals[animal_id].animal_notes,
                medical_notes:assigned_request.animals[animal_id].medical_notes,
                aggressive:assigned_request.animals[animal_id].aggressive,
                confined:assigned_request.animals[animal_id].confined,
                fixed:assigned_request.animals[animal_id].fixed,
                aco_required:assigned_request.animals[animal_id].aco_required,
                injured:assigned_request.animals[animal_id].injured,
                request:assigned_request.service_request_object.id,
                shelter:assigned_request.animals[animal_id].shelter || '',
                room:assigned_request.animals[animal_id].room || '',
                is_new:assigned_request.animals[animal_id].is_new,}}),
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
      axios.get('/shelter/api/shelter/?incident=' + incident + '&organization=' + organization +'&training=' + state.incident.training, {
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

    const fetchSpecies = () => {
      setSpecies({options: []});
      // Fetch Species data.
      axios.get('/animals/api/species/', {
        cancelToken: source.token,
      })
      .then(response => {
        if (!unmounted) {
          let species_options = [];
          response.data.forEach(result => {
            // Build species option list.
            species_options.push({value: result.id, label: result.name});
          });
          setSpecies({options: species_options});
        }
      })
      .catch(error => {
        if (!unmounted) {
          setSpecies({options: []});
          setShowSystemError(true);
        }
      });
    };
    fetchSpecies();

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
    <>
    <Formik
      initialValues={data}
      enableReinitialize={true}
      validationSchema={Yup.object({
        start_time: Yup.date(),
        dispatch_date: Yup.date(),
        end_time: Yup.date().nullable(),
        service_requests: Yup.array(),
        team_members: Yup.array(),
        sr_updates: Yup.array().of(
          Yup.object().shape({
            id: Yup.number().required(),
            owner: Yup.boolean(),
            priority: Yup.number(),
            unable_to_complete: Yup.boolean(),
            directions: Yup.string(),
            status: Yup.string()
              .test('required-check', 'Service Request cannot remain assigned.',
                function(value) {
                  let required = true;
                  data.sr_updates.filter(sr => sr.id === this.parent.id).forEach(sr_update => {
                    if (sr_update.animals.length || sr_update.unable_to_complete || !saveClose) {
                      required = false;
                    }
                  })
                  if (value && value.includes('assigned') && required) {
                    return false;
                  }
                  return true;
                }),
            followup_date: Yup.date().nullable().when(['unable_to_complete'], {
              is: false,
              then: Yup.date().test('required-check', 'Follow-up date is required',
                function(value){
                  if (saveClose) {
                   // Field is required when saveClose is true
                   return value != null; // Valid if the value is not null
                  }
                  return true
                }
              )
            }),
            animals: Yup.array().of(
              Yup.object().shape({
                id: Yup.number().nullable(),
                status: Yup.string()
                  .test('required-check', 'Animal cannot remain REPORTED.',
                    function(value) {
                      let required = true;
                      data.sr_updates.filter(sr => sr.id === this.parent.request).forEach(sr_update => {
                        if (sr_update.unable_to_complete || !saveClose) {
                          required = false;
                        }
                      })
                      if (value && value.includes('REPORTED') && required) {
                        return false;
                      }
                      return true;
                    }),
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
          // Clean out dummy value for Did Not Search For
          values.sr_updates.forEach((sr, index) => {
            sr.animals.forEach((animal, inception) => {
              values.sr_updates[index].animals[inception].status = animal.status.replace("$", "");
            })
          })
          axios.put('/evac/api/evacassignment/' + data.id + '/?incident=' + incident, values)
            .then(response => {
              if (response.data.service_requests.length === 0) {
                navigate('/' + organization + '/' + incident + '/dispatch');
              }
              else {
                navigate('/' + organization + '/' + incident + '/dispatch/summary/' + id);
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
            <Header>Dispatch Assignment and Resolution</Header>
            <hr/>
            <Card className="mt-3 border rounded">
              <Card.Body>
                <Card.Title>
                  <h4>{data.team_name}</h4>
                </Card.Title>
                <hr />
                <ListGroup variant="flush" style={{ marginTop: "-13px", marginBottom: "-13px", textTransform: "capitalize" }}>
                  {data.team && data.team_object.team_member_objects.map(team_member => (
                    <ListGroup.Item key={team_member.id}>
                      {team_member.first_name + " " + team_member.last_name}{team_member.agency_id ? <span>&nbsp;({team_member.agency_id})</span> : ""}
                    </ListGroup.Item>
                  ))}
                  <ListGroup.Item className="ml-0 pl-0">
                    <DateTimePicker
                      label="Dispatch Date"
                      name={"dispatch_date"}
                      id={"dispatch_date"}
                      xs="4"
                      data-enable-time={false}
                      clearable={false}
                      onChange={(date, dateStr) => {
                        props.setFieldValue("dispatch_date", dateStr)
                      }}
                      disabled={false}
                      // value={props.values.sr_updates[index] ? props.values.sr_updates[index].date_completed : new Date()}
                    />
                  </ListGroup.Item>
                </ListGroup>
              </Card.Body>
            </Card>
            {data.assigned_requests.map((assigned_request, index) => (
              <Card key={assigned_request.service_request_object.id} className="mt-3 border rounded">
                <Card.Body>
                  <Card.Title style={{marginBottom:"-5px", marginTop:"-5px"}}>
                    <h4>
                      SR#{assigned_request.service_request_object.id_for_incident} -&nbsp;
                      <Link href={"/" + organization + "/" + incident + "/hotline/servicerequest/" + assigned_request.service_request_object.id_for_incident} className="text-link" style={{textDecoration:"none", color:"white"}}>{assigned_request.service_request_object.full_address}</Link> |&nbsp;
                      <Checkbox
                        label={"Unable to Complete:"}
                        name={`sr_updates.${index}.unable_to_complete`}
                        disabled={data.end_time ? true : false}
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
                      <ListGroup.Item>
                        <Row>
                          <Col xs={2}>
                            <b>Accessible: </b>{ assigned_request.service_request_object.accessible ? "Yes" : "No"}
                          </Col>
                          <Col xs={2}>
                            <b>Turn Around: </b>{ assigned_request.service_request_object.turn_around ? "Yes" : "No"}
                          </Col>
                        </Row>
                      </ListGroup.Item>
                  </ListGroup>
                  <hr />
                  <BootstrapForm.Row className="mt-2" style={{marginBottom:"-13px"}}>
                    <TextInput
                      id={`sr_updates.${index}.notes`}
                      name={`sr_updates.${index}.notes`}
                      xs="9"
                      as="textarea"
                      rows={5}
                      label="Visit Notes"
                    />
                  </BootstrapForm.Row>
                  {assigned_request.service_request_object.visit_notes.length > 0 ? <hr/> : <div style={{marginBottom:"7px"}}></div>}
                  {assigned_request.service_request_object.visit_notes.length > 0 ? <h4 className="mt-2" style={{marginBottom:"-2px"}}>Previous Visit Notes</h4> : ""}
                  <ListGroup variant="flush" style={{marginBottom:"-13px"}}>
                  {assigned_request.service_request_object.visit_notes.map(visit_note =>
                    <ListGroup.Item key={visit_note.id} style={{whiteSpace:"pre-line"}}>
                      <Moment format="l">{visit_note.date_completed}</Moment>: {visit_note.notes || "No information available."}
                    </ListGroup.Item>
                  ) || "None"}
                  </ListGroup>
                  <hr/>
                  <ListGroup variant="flush" style={{ marginTop: "-13px", marginBottom: "-13px" }}>
                    <h4 className="mt-2" style={{ marginBottom: data.sr_updates[index].animals.length ? "-2px" : "5px" }}>Animals
                      {!data.end_time ? <OverlayTrigger
                        key={"add-new-animal"}
                        placement="top"
                        overlay={
                          <Tooltip id={`tooltip-add-new-animal`}>
                            Add a new animal to this dispatch assignment
                          </Tooltip>
                        }
                      >
                        <FontAwesomeIcon icon={faPlusSquare} onClick={() => {setShowAddNew(true);setSelectedSR(assigned_request.service_request_object.id);setSelectedIndex(index)}} style={{cursor:'pointer'}} className='ml-1' inverse />
                      </OverlayTrigger> : ""}
                    </h4>
                    {data.sr_updates[index].animals.filter(animal => animal.status !== 'CANCELED').map((animal, inception) => (
                      <ListGroup.Item key={inception}>
                        <AnimalStatus formikProps={props} sr_updates={data.sr_updates} setData={setData} setSelectedIndex={setSelectedIndex} setSelectedInception={setSelectedInception} setSelectedAnimal={setSelectedAnimal} setShowSplit={setShowSplit} showAddNew={showAddNew} setShowAddNew={setShowAddNew} index={animal.index ? animal.index : index} inception={inception} animal={animal} service_request_object_id={assigned_request.service_request_object.id} shelters={shelters} species_options={species.options} />
                      </ListGroup.Item>
                    ))}
                    {data.sr_updates[index].animals.filter(animal => animal.status !== 'CANCELED').length === 0 ?
                    <ListGroup.Item className="pl-0">
                      <BootstrapForm.Row style={{marginRight:"-22px", marginTop:"-5px"}}>
                        <Col xs={"4"}>
                          <DropDown
                            label="Operation Status"
                            id={`sr_updates.${index}.status`}
                            name={`sr_updates.${index}.status`}
                            type="text"
                            key={`my_unique_status_select_key__${props.values.status}`}
                            options={[{label:"Keep Open", value:"open"}, {label:"Assigned", value:"assigned"}, {label:"Close", value:"closed"}]}
                            value={props.values.sr_updates[index] ? props.values.sr_updates[index].status : "open"}
                            isClearable={false}
                            onChange={(instance) => {
                              props.setFieldValue(`sr_updates.${index}.status`, instance === null ? '' : instance.value);
                            }}
                          />
                        </Col>
                      </BootstrapForm.Row>
                    </ListGroup.Item> : ""}
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
                      label={`Followup Date (Default: ${state.incident.default_followup_days} days)`}
                      name={`sr_updates.${index}.followup_date`}
                      id={`sr_updates.${index}.followup_date`}
                      more_options={{minDate:'today'}}
                      xs="4"
                      data-enable-time={false}
                      clearable={false}
                      onChange={(date, dateStr) => {
                        props.setFieldValue(`sr_updates.${index}.followup_date`, dateStr)
                      }}
                      value={props.values.sr_updates[index] && props.values.sr_updates[index].followup_date ? props.values.sr_updates[index].followup_date : new Date().setDate(new Date().getDate() + state.incident.default_followup_days)}
                      disabled={data.end_time !== null && assigned_request.followup_date !== assigned_request.service_request_object.followup_date}
                    />
                  </BootstrapForm.Row>
                  <BootstrapForm.Row className="mt-3">
                    <TextInput
                      id={`sr_updates.${index}.directions`}
                      name={`sr_updates.${index}.directions`}
                      xs="9"
                      as="textarea"
                      rows={5}
                      label="Instructions for Field Team"
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
            <ButtonGroup size="lg" className="col-12 pl-0 pr-0 mb-3" style={{marginTop:"-1px"}}>
              <ButtonSpinner isSubmitting={props.isSubmitting} isSubmittingText="Saving..." className="btn btn-block border" type="submit" onClick={() => { setSaveClose(false); setShouldCheckForScroll(true); }}>
                Save
              </ButtonSpinner>
              {data.end_time ? "" : <ButtonSpinner isSubmitting={props.isSubmitting} isSubmittingText="Saving..." className="btn border col-6" type="submit" onClick={() => { setSaveClose(true); setShouldCheckForScroll(true); }}>
                Save and Close
              </ButtonSpinner>}
            </ButtonGroup>
          </BootstrapForm>
          <Formik
            initialValues={newData}
            enableReinitialize={true}
            validationSchema={Yup.object({
              name: Yup.string(),
              animal_count: Yup.number(),
              species: Yup.string(),
              pcolor: Yup.string(),
              scolor: Yup.string(),
              behavior_notes: Yup.string(),
            })}
            onSubmit={(values, { setSubmitting, setValues }) => {
              let sr_updates_copy = [...data.sr_updates]
              sr_updates_copy[selectedIndex].animals.push({
                id:null,
                id_for_incident:null,
                animal_count:values.animal_count,
                name:values.name,
                species:values.species_string,
                age:values.age,
                sex:values.sex,
                size:values.size,
                status:'REPORTED',
                pcolor:values.pcolor,
                scolor:values.scolor,
                animal_notes:values.behavior_notes,
                color_notes:values.color_notes,
                medical_notes:values.medical_notes,
                last_seen:values.last_seen,
                aggressive:values.aggressive,
                aco_required:values.aco_required,
                injured:values.injured,
                confined:values.confined,
                fixed:values.fixed,
                request:selectedSR,
                shelter:'',
                room:'',
                is_new:false
              });
              setData(prevState => ({ ...prevState, "sr_updates":sr_updates_copy}));
              props.setValues(prevState => ({ ...prevState, "sr_updates":sr_updates_copy}));
              setNewData({'name': '', sex:'', age:'', size:'', last_seen:null, 'animal_count':1, 'species':'', 'pcolor':'', 'scolor':'', 'behavior_notes':'', 'color_notes':'', 'medical_notes':'', aggressive:'unknown', aco_required:'unknown', injured:'unknown', confined:'unknown', fixed:'unknown', request:null});
              setValues({'name': '', sex:'', age:'', size:'', last_seen:null, 'animal_count':1, 'species':'', 'pcolor':'', 'scolor':'', 'behavior_notes':'', 'color_notes':'', 'medical_notes':'', aggressive:'unknown', aco_required:'unknown', injured:'unknown', confined:'unknown', fixed:'unknown', request:null});
              setShowAddNew(false);
            }}
          >
            {formikProps => (
            <Modal show={showAddNew} onHide={handleCloseAddNew} dialogClassName="wide-modal">
              <Modal.Header closeButton>
                <Modal.Title>Add New Animal</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <BootstrapForm.Row>
                  <TextInput
                    id="name"
                    name="name"
                    type="text"
                    label="Animal Name"
                    xs="4"
                  />
                  <Col xs="6" style={{textTransform:'capitalize'}}>
                    <DropDown
                      label="Species*"
                      id="speciesDropdown"
                      name="species"
                      type="text"
                      key={`my_unique_species_select_key__${formikProps.values.species}`}
                      options={species.options}
                      value={formikProps.values.species}
                      isClearable={false}
                      onChange={(instance) => {
                        setPlaceholder("Select...")
                        pcolorRef.current.select.clearValue();
                        scolorRef.current.select.clearValue();
                        formikProps.setFieldValue("species", instance.value);
                        formikProps.setFieldValue("species_string", instance.label);
                      }}
                    />
                  </Col>
                  <TextInput
                    id="animal_count"
                    name="animal_count"
                    type="text"
                    xs="2"
                    label="No. of Animals"
                  />
                </BootstrapForm.Row>
                <BootstrapForm.Row>
                  <Col xs="4">
                    <DropDown
                      label="Sex"
                      id="sexDropDown"
                      name="sex"
                      type="text"
                      key={`my_unique_sex_select_key__${formikProps.values.sex}`}
                      ref={sexRef}
                      options={sexChoices}
                      value={formikProps.values.sex||''}
                    />
                  </Col>
                  <Col xs="4">
                    <CustomSelect
                      label="Age"
                      options={Object.keys(ageChoices).includes(formikProps.values.species_string)
                        ? ageChoices[formikProps.values.species_string]
                        : ageChoices['other']}
                      value={formikProps.values.age || ''}
                      handleValueChange={(value) => formikProps.setFieldValue('age', value)}
                      optionsKey={formikProps.values.species_string || ''}
                      formValidationName="age"
                    />
                  </Col>
                  <Col xs="4">
                    <DropDown
                      label="Size"
                      id="sizeDropdown"
                      name="size"
                      type="text"
                      isClearable={true}
                      key={`my_unique_size_select_key__${formikProps.values.size}`}
                      ref={sizeRef}
                      options={Object.keys(sizeChoices).includes(formikProps.values.species_string) ? sizeChoices[formikProps.values.species_string] : sizeChoices['other']}
                      value={formikProps.values.size||''}
                      placeholder={placeholder}
                    />
                  </Col>
                </BootstrapForm.Row>
                <BootstrapForm.Row className="mt-3">
                  <Col xs="4">
                    <DropDown
                      label="Primary Color"
                      id="pcolor"
                      name="pcolor"
                      type="text"
                      key={`my_unique_pcolor_select_key__${formikProps.values.pcolor}`}
                      ref={pcolorRef}
                      style={{marginTop:"2px"}}
                      options={Object.keys(colorChoices).includes(formikProps.values.species_string) ? colorChoices[formikProps.values.species_string] : colorChoices['other']}
                      value={formikProps.values.pcolor||''}
                      placeholder={placeholder}
                    />
                    <DropDown
                      label="Secondary Color"
                      id="scolor"
                      name="scolor"
                      type="text"
                      key={`my_unique_scolor_select_key__${formikProps.values.scolor}`}
                      ref={scolorRef}
                      style={{marginTop:"23px"}}
                      options={Object.keys(colorChoices).includes(formikProps.values.species_string) ? colorChoices[formikProps.values.species_string] : colorChoices['other']}
                      value={formikProps.values.scolor||''}
                      placeholder={placeholder}
                    />
                  </Col>
                  <TextInput
                    id="behavior_notes"
                    name="behavior_notes"
                    as="textarea"
                    rows={5}
                    label="Animal Notes"
                    xs="8"
                  />
                </BootstrapForm.Row>
                <BootstrapForm.Row>
                  <Col xs="4">
                    <DropDown
                      label="Aggressive"
                      id="aggressive"
                      name="aggressive"
                      type="text"
                      options={unknownChoices}
                      value={formikProps.values.aggressive||'unknown'}
                      isClearable={false}
                      onChange={(instance) => {
                        formikProps.setFieldValue("aggressive", instance === null ? '' : instance.value);
                        formikProps.setFieldValue("aco_required", instance && instance.value === 'yes' ? 'yes' : formikProps.values.aco_required);
                      }}
                    />
                  </Col>
                  <Col xs="4">
                    <DropDown
                      label="ACO Required"
                      id="aco_required"
                      name="aco_required"
                      type="text"
                      options={unknownChoices}
                      value={formikProps.values.aco_required||'unknown'}
                      isClearable={false}
                    />
                  </Col>
                  <Col xs="4">
                    <DropDown
                      label="Injured"
                      id="injured"
                      name="injured"
                      type="text"
                      options={unknownChoices}
                      value={formikProps.values.injured||'unknown'}
                      isClearable={false}
                    />
                  </Col>
                </BootstrapForm.Row>
                <BootstrapForm.Row className={"mt-3"}>
                  <Col xs="4">
                    <DropDown
                      label="Confined"
                      id="confined"
                      name="confined"
                      type="text"
                      options={unknownChoices}
                      value={formikProps.values.confined||'unknown'}
                      isClearable={false}
                    />
                  </Col>
                  <Col xs="4">
                    <DropDown
                      label="Fixed"
                      id="fixed"
                      name="fixed"
                      type="text"
                      options={unknownChoices}
                      value={formikProps.values.fixed||'unknown'}
                      isClearable={false}
                    />
                  </Col>
                </BootstrapForm.Row>
                <BootstrapForm.Row className={"mt-3"}>
                  <TextInput
                    id="color_notes"
                    name="color_notes"
                    as="textarea"
                    rows={5}
                    label="Breed / Description"
                    xs="12"
                  />
                </BootstrapForm.Row>
                <BootstrapForm.Row>
                  <TextInput
                    id="medical_notes"
                    name="medical_notes"
                    as="textarea"
                    rows={5}
                    label="Medical Notes"
                    xs="12"
                  />
                </BootstrapForm.Row>
                <BootstrapForm.Row>
                  <DateTimePicker
                    label="Last Seen"
                    name="last_seen"
                    id="last_seen"
                    xs="6"
                    onChange={(date, dateStr) => {
                      formikProps.setFieldValue("last_seen", dateStr)
                    }}
                    value={formikProps.values.last_seen||null}
                    disabled={false}
                  />
                </BootstrapForm.Row>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="primary" onClick={() => {formikProps.submitForm();}}>Add</Button>
                <Button variant="secondary" onClick={handleCloseAddNew}>Close</Button>
              </Modal.Footer>
            </Modal>
            )}
          </Formik>
          <Formik
            initialValues={{'animal_count':selectedAnimal.animal_count, 'group_2':0}}
            enableReinitialize={true}
            validationSchema={Yup.object({
              animal_count: Yup.number(),
              group_2: Yup.number(),
            })}
            onSubmit={(values, { setSubmitting, setValues }) => {
              let sr_updates_copy = [...data.sr_updates]
              sr_updates_copy[selectedIndex].animals[selectedInception].animal_count = values.animal_count;
              sr_updates_copy[selectedIndex].animals.push({
                id:null,
                id_for_incident:null,
                index:selectedIndex,
                original_id:selectedAnimal.id ? selectedAnimal.id : selectedAnimal.original_id,
                animal_count:values.group_2,
                name:'',
                species:selectedAnimal.species,
                status:selectedAnimal.status,
                color_notes:selectedAnimal.color_notes,
                pcolor:selectedAnimal.pcolor,
                scolor:selectedAnimal.scolor,
                animal_notes:selectedAnimal.animal_notes,
                aggressive:selectedAnimal.aggressive,
                aco_required:selectedAnimal.aco_required,
                injured:selectedAnimal.injured,
                request:selectedSR,
                shelter:selectedAnimal.shelter || '',
                room:selectedAnimal.room || ''
              });
              setData(prevState => ({ ...prevState, "sr_updates":sr_updates_copy}));
              props.setValues(prevState => ({ ...prevState, "sr_updates":sr_updates_copy}));
              setShowSplit(false);
            }}
          >
            {formikProps => (
            <Modal show={showSplit} onHide={handleCloseSplit}>
              <Modal.Header closeButton>
                <Modal.Title>Split Animal Group</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <span><b>Current Group: </b>{formikProps.values.animal_count} <span style={{textTransform:"capitalize"}}>{selectedAnimal.species}</span>{(formikProps.values.animal_count) !== 1 && !["sheep", "cattle"].includes(selectedAnimal.species) ? "s" : ""}</span>
                <RangeSlider
                  value={formikProps.values.group_2}
                  onChange={(changeEvent) => {formikProps.setFieldValue("group_2", changeEvent.target.value);formikProps.setFieldValue("animal_count", selectedAnimal.animal_count - changeEvent.target.value);}}
                  min={0}
                  max={selectedAnimal.animal_count - 1}
                  className="mb-3 mt-3"
                />
                <span className="row mt-3 pl-3"><b>New Group:&nbsp;</b>{formikProps.values.group_2}&nbsp;<span style={{textTransform:"capitalize"}}>{selectedAnimal.species}</span>{(Number(formikProps.values.group_2) !== 1) && !["sheep", "cattle"].includes(selectedAnimal.species) ? "s" : ""}</span>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="primary" onClick={() => {formikProps.submitForm();}} disabled={Number(formikProps.values.group_2) === 0}>Save</Button>
                <Button variant="secondary" onClick={handleCloseSplit}>Close</Button>
              </Modal.Footer>
            </Modal>
            )}
          </Formik>
        </>
      )}
    </Formik>
    </>
  )
}

export default DispatchResolutionForm;
