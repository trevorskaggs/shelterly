import React, { useContext, useState, useEffect, useRef } from "react";
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
import { SystemErrorContext } from '../components/SystemError';
import { statusLabelLookup } from "../utils/formatString";

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
          options={props.animal.status === 'SHELTERED' ? [{value:props.animal.status, label:statusLabelLookup[props.animal.status]}] : [{value:props.animal.status, label:statusLabelLookup[props.animal.status]}, {value:'SHELTERED', label:'Sheltered'}]}
          value={`sr_updates.${props.index}.animals.${props.inception}.status`}
          key={`sr_updates.${props.index}.animals.${props.inception}.status`}
          isClearable={false}
          onChange={(instance) => {
            props.formikProps.setFieldValue(`sr_updates.${props.index}.animals.${props.inception}.status`, instance === null ? '' : instance.value);
            if (instance.value === 'SHELTERED') {
              props.formikProps.setFieldValue(`sr_updates.${props.index}.animals.${props.inception}.shelter`, Number(props.shelter_id));
              props.formikProps.setFieldValue('animals', [...props.formikProps.values['animals'], props.animal.id]);
            }
            else {
              props.formikProps.setFieldValue(`sr_updates.${props.index}.animals.${props.inception}.shelter`, '');
              props.formikProps.setFieldValue('animals', props.formikProps.values['animals'].filter(id => id !== props.animal.id))
              if (shelterRef.current) shelterRef.current.select.clearValue();
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
            <Tooltip id={"tooltip-animal-color-notes"}>
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

  const { setShowSystemError } = useContext(SystemErrorContext);

  const [options, setOptions] = useState({shelter_options:[], room_options:{}, da_options:[], fetching:true});
  const [data, setData] = useState({shelter_name:'', dispatch_assignments:[], sr_updates:[], shelter: id, da: null, animals:[], isFetching: false});
  const [selected, setSelected] = useState(null);

  // Hook for initializing data.
  useEffect(() => {
    let unmounted = false;
    let source = axios.CancelToken.source();

    const fetchShelter = async () => {
      // Fetch current ServiceRequest data.
      await axios.get('/shelter/api/shelter/' + id + '/?incident=' + incident, {
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
              setData(prevState => ({ ...prevState, shelter_name: currentResponse.data.name, dispatch_assignments: response.data, sr_updates: [], isFetching: false}));
              setOptions({shelter_options:shelter_options, room_options: room_options, da_options:da_options, fetching:false});
            }
          })
          .catch(error => {
            if (!unmounted) {
              setData(prevState => ({ ...prevState, shelter_name: '', dispatch_assignments: [], sr_updates: [], isFetching: false}));
              setShowSystemError(true);
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
        axios.patch('/evac/api/evacassignment/' + selected + '/?shelter=' + id, values)
        .then(DAresponse => {
          values['intake_type'] = 'dispatch';
          axios.post('/shelter/api/intakesummary/', values)
          .then(response => {
            navigate("/" + incident + "/shelter/intakesummary/" + response.data.id);
          })
          .catch(error => {
            setSubmitting(false);
            setShowSystemError(true);
          });
          })
        .catch(error => {
          setSubmitting(false);
          setShowSystemError(true);
        });
      }}
    >
      {props => (
        <BootstrapForm as={Form}>
          <Header>
            <span style={{cursor:'pointer'}} onClick={() => navigate("/" + incident + "/shelter/" + id)} className="mr-2"><FontAwesomeIcon icon={faArrowAltCircleLeft} size="sm" inverse /></span>
            {data.shelter_name}
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
                placeholder={options.fetching ? "Loading..." : "Select Dispatch..."}
                onChange={(instance) => {
                  instance.value ? setSelected(instance.value) : setSelected(null);
                  props.setFieldValue("da", instance.value ? instance.value : null);
                  props.setFieldValue("animals", []);
                  let selected_da = data.dispatch_assignments.filter(da => da.id === instance.value)[0];
                  setData(prevState => ({ ...prevState, "sr_updates":selected_da.sr_updates, "da":instance.value }));
                }}
                disabled={options.fetching ? true : false}
              />
            </Col>
          </Row>
          {selected ?
          <Row>
            {data.dispatch_assignments.filter(da => da.id === selected)[0].assigned_requests.map((assigned_request, index) => (
            <Col xs={12} key={assigned_request.service_request_object.id} className="pl-0" >
              <Card className="mt-3 ml-3 border rounded">
                <Card.Body>
                  <Card.Title style={{marginBottom:"-5px", marginTop:"-5px"}}>
                    <h4>
                      SR#{assigned_request.service_request_object.id} -&nbsp;
                      <Link href={"/" + incident + "/hotline/servicerequest/" + assigned_request.service_request_object.id} className="text-link" style={{textDecoration:"none", color:"white"}}>{assigned_request.service_request_object.full_address}</Link>
                    </h4>
                  </Card.Title>
                  <hr />
                  <ListGroup variant="flush" style={{ marginTop: "-13px", marginBottom: "-13px" }}>
                    <h4 className="mt-2" style={{ marginBottom: "-2px" }}>Animals</h4>
                    {data.sr_updates[index] && data.sr_updates[index].animals.map((animal, inception) => (
                      <ListGroup.Item key={animal.id} hidden={animal.status === 'SHELTERED' && data.sr_updates[index] && data.sr_updates[index].animals[inception] && (data.sr_updates[index].animals[inception].shelter !== Number(id))}>
                        <AnimalStatus formikProps={props} index={index} inception={inception} shelter_id={id} animal={animal} shelter_options={options.shelter_options} room_options={options.room_options} />
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
            <ButtonSpinner isSubmitting={props.isSubmitting} isSubmittingText="Saving..." className="btn btn-block border" type="submit">
              Save
            </ButtonSpinner>
          </ButtonGroup> : ""}
        </BootstrapForm>
      )}
    </Formik>
  )
}

export default ShelterIntake
