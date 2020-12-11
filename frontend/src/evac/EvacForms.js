import React, { useEffect, useState } from 'react';
import axios from "axios";
import { Link, navigate } from "raviger";
import { Field, Form, Formik, } from 'formik';
import { Label } from 'reactstrap';
import { Switch } from 'formik-material-ui';
import {
  Button,
  Form as BootstrapForm,
  ButtonGroup,
  Card,
  Col,
  FormGroup,
  ListGroup,
  Row,
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClipboardList, faArrowAltCircleLeft,
} from '@fortawesome/free-solid-svg-icons';
import * as Yup from 'yup';
import Moment from 'react-moment';
import Header from '../components/Header';
import { Checkbox, DateTimePicker, DropDown, TextInput } from '.././components/Form';
import { statusChoices } from '../animals/constants';

export const EvacTeamMemberForm = () => {

  // Track whether or not to add another evac team member after saving.
  const [addAnother, setAddAnother] = useState(false);
  // Regex validators.
  const phoneRegex = /^[0-9]{10}$/

    return (
        <Formik
          initialValues={{
            first_name: '',
            last_name: '',
            phone: '',
            agency_id: '',
          }}
          validationSchema={Yup.object({
            first_name: Yup.string()
              .max(50, 'Must be 50 characters or less')
              .required('Required'),
            last_name: Yup.string()
              .max(50, 'Must be 50 characters or less')
              .required('Required'),
            phone: Yup.string()
              .matches(phoneRegex, "Phone number is not valid")
              .required('Required'),
            agency_id: Yup.string(),
          })}
          onSubmit={(values, { setSubmitting, resetForm }) => {
            setTimeout(() => {
              axios.post('/evac/api/evacteammember/', values)
              .then(function() {
                if (addAnother){
                  resetForm();
                }
                else{
                  navigate('/evac');
                }
              })
              .catch(error => {
                console.log(error.response);
              });
              setSubmitting(false);
            }, 500);
          }}
        >
        {form => (
          <Card border="secondary" className="mt-5">
            <Card.Header as="h5" className="pl-3"><span style={{cursor:'pointer'}} onClick={() => window.history.back()} className="mr-3"><FontAwesomeIcon icon={faArrowAltCircleLeft} size="lg" inverse /></span>New Team Member</Card.Header>
            <Card.Body>
              <Form>
                  <FormGroup>
                    <Row>
                      <Col>
                        <TextInput
                          type="text"
                          label="First Name*"
                          name="first_name"
                          id="first_name"
                        />
                      </Col>
                      <Col>
                        <TextInput
                          type="text"
                          label="Last Name*"
                          name="last_name"
                          id="last_name"
                        />
                      </Col>
                    </Row>
                  </FormGroup>
                  <FormGroup>
                    <Row>
                      <Col>
                        <TextInput
                          type="text"
                          label="Phone*"
                          name="phone"
                          id="phone"
                        />
                      </Col>
                      <Col>
                        <TextInput
                          type="text"
                          label="Agency ID"
                          name="agency_id"
                          id="agency_id"
                        />
                      </Col>
                    </Row>
                  </FormGroup>
              </Form>
            </Card.Body>
            <ButtonGroup>
              <Button type="button" className="btn btn-primary mr-1" onClick={() => {setAddAnother(false); form.submitForm()}}>Save</Button>
              <Button type="button" className="btn btn-success mr-1" onClick={() => {setAddAnother(true); form.submitForm()}}>Add Another</Button>
              <Link className="btn btn-secondary" href="/evac">Cancel</Link>
            </ButtonGroup>
            </Card>
          )}
        </Formik>
    );
  };

export function EvacResolution({ id }) {

  // Initial animal data.
  const [data, setData] = useState({
    team_members: [],
    team_member_objects: [],
    service_requests: [],
    service_request_objects: [],
    start_time: null,
    end_time: null,
    sr_updates: [],
  });

  // Hook for initializing data.
  useEffect(() => {
    let source = axios.CancelToken.source();
    const fetchEvacAssignmentData = async () => {
      // Fetch Animal data.
      await axios.get('/evac/api/evacassignment/' + id + '/', {
        cancelToken: source.token,
      })
      .then(response => {
        response.data["sr_updates"] = [];
        response.data.service_request_objects.forEach((service_request, index) => {
          response.data.sr_updates.push({id:service_request.id, followup_date: null, date_completed:new Date(), notes:'', owner_contacted:false, forced_entry: false, animals:service_request.animals})
        });
        setData(response.data);
      })
      .catch(error => {
        console.log(error.response);
      });
    };
    fetchEvacAssignmentData();
  }, [id]);

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
              followup_date: Yup.date().nullable(),
              animals: Yup.array().of(
                Yup.object().shape({
                  id: Yup.number().required(),
                  status: Yup.string().notOneOf(['REPORTED'], 'Animal cannot remain REPORTED.'),
                })
              ),
              date_completed: Yup.date().required('Required'),
              notes: Yup.string(),
              forced_entry: Yup.boolean(),
              owner_contacted: Yup.boolean().required().oneOf([true], 'The owner must be notified before resolution.'),
            })
          ),
        })}
        onSubmit={(values, { setSubmitting }) => {
          setTimeout(() => {
            axios.put('/evac/api/evacassignment/' + id + '/', values)
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
          <>
          <BootstrapForm as={Form}>
          <Header>Dispatch Assignment #{id} Resolution
          <div style={{fontSize:"16px", marginTop:"5px"}}><b>Opened: </b><Moment format="lll">{data.start_time}</Moment></div>
          </Header>
          <hr/>
          <Card border="secondary" className="mt-3">
            <Card.Body>
              <Card.Title>
                <h4>Team Members</h4>
              </Card.Title>
              <hr/>
              <ListGroup variant="flush" style={{marginTop:"-13px", marginBottom:"-13px", textTransform:"capitalize"}}>
                {data.team_member_objects.map(team_member => (
                  <ListGroup.Item key={team_member.id}>
                    {team_member.first_name + " " + team_member.last_name + " - " + team_member.phone}{team_member.agency ? <span>({team_member.agency})</span> : ""}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>
          {data.service_request_objects.map((service_request, index) => (
          <Card key={service_request.id} border="secondary" className="mt-3">
            <Card.Body>
              <Card.Title>
                <h4>Service Request #{service_request.id} <Link href={"/hotline/servicerequest/" + service_request.id}> <FontAwesomeIcon icon={faClipboardList} inverse /></Link> | <span style={{textTransform:"capitalize"}}>{service_request.status}</span></h4>
              </Card.Title>
              <hr/>
              <ListGroup variant="flush" style={{marginTop:"-13px", marginBottom:"-13px"}}>
                <ListGroup.Item><b>Address: </b>{service_request.full_address}</ListGroup.Item>
                {service_request.owners.map(owner => (
                  <ListGroup.Item><b>Owner: </b>{owner.first_name} {owner.last_name} <Link href={"/hotline/owner/" + owner.id}> <FontAwesomeIcon icon={faClipboardList} inverse /></Link></ListGroup.Item>
                ))}
                </ListGroup>
              <hr/>
              <ListGroup variant="flush" style={{marginTop:"-13px", marginBottom:"-13px"}}>
                <h4 className="mt-2" style={{marginBottom:"-2px"}}>Animals</h4>
                {service_request.animals.map((animal, inception) => (
                  <ListGroup.Item key={animal.id}>
                    <Row>
                      <Col xs={3} className="pl-0">
                        <DropDown
                          id={`sr_updates.${index}.animals.${inception}.status`}
                          name={`sr_updates.${index}.animals.${inception}.status`}
                          type="text"
                          className="mt-0"
                          options={statusChoices}
                          value={`sr_updates.${index}.animals.${inception}.status`}
                          isClearable={false}
                        />
                    </Col>
                    <span style={{marginTop:"5px"}}>{animal.pcolor ? <span style={{marginTop:"5px", textTransform:"capitalize"}}>{animal.pcolor}{animal.scolor ? "/" + animal.scolor : ""}&nbsp;</span> : ""}<span style={{textTransform:"capitalize"}}>{animal.species}</span>&nbsp;({animal.name||"Unknown"})</span>
                  </Row>
                </ListGroup.Item>
                ))}
              </ListGroup>
              <hr/>
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
                    value={props.values.sr_updates[index] ? props.values.sr_updates[index].date_completed : new Date()}
                  />
                </BootstrapForm.Row>
                <BootstrapForm.Row className="mt-3">
                  <TextInput
                    id={`sr_updates.${index}.notes`}
                    name={`sr_updates.${index}.notes`}
                    xs="9"
                    as="textarea"
                    rows={5}
                    label="Notes"
                  />
                </BootstrapForm.Row>
                <BootstrapForm.Row>
                  <DateTimePicker
                    label="Followup Date"
                    name={`sr_updates.${index}.followup_date`}
                    id={`sr_updates.${index}.followup_date`}
                    xs="4"
                    data-enable-time={false}
                    onChange={(date, dateStr) => {
                      props.setFieldValue(`sr_updates.${index}.followup_date`, dateStr)
                    }}
                    value={data.followup_date||null}
                  />
                </BootstrapForm.Row>
                <BootstrapForm.Row className="mt-2">
                  <Col>
                    <Label htmlFor={`sr_updates.${index}.forced_entry`} className="mt-2">Forced Entry</Label>
                    <Field component={Switch} name={`sr_updates.${index}.forced_entry`} type="checkbox" color="primary" />
                  </Col>
                </BootstrapForm.Row>
                <BootstrapForm.Row className="mt-3 pl-1">
                  <Field
                    label={"Owner Notified: "}
                    component={Checkbox}
                    name={`sr_updates.${index}.owner_contacted`}
                    onChange={() => {
                      if (props.values.sr_updates[index] && props.values.sr_updates[index].owner_contacted) {
                        props.setFieldValue(
                          `sr_updates.${index}.owner_contacted`,
                          false
                        );
                      }
                      else {
                        props.setFieldValue(
                          `sr_updates.${index}.owner_contacted`,
                          true
                        );
                      }
                    }}
                  />
                </BootstrapForm.Row>
                {props.errors.sr_updates && props.errors.sr_updates[index] && props.errors.sr_updates[index].owner_contacted &&
                props.touched.sr_updates && props.touched.sr_updates[index] && props.touched.sr_updates[index].owner_contacted && (
                  <div style={{ color: "#e74c3c", marginTop: "-8px", fontSize: "80%" }}>{props.errors.sr_updates[index].owner_contacted}</div>
                  )
                }
              </Card.Body>
            </Card>
            ))}
            <ButtonGroup>
              <Button type="button" className="btn btn-primary" onClick={() => {props.submitForm()}}>Save</Button>
            </ButtonGroup>
          </BootstrapForm>
          </>
        )}
      </Formik>
  )
}

export const VisitNoteForm = ({id}) => {

    const [data, setData] = useState({
      date_completed: '',
      owner_contacted: false,
      notes: '',
      service_request: null,
      evac_assignment: null,
      address: '',
      forced_entry: false,
    })

    useEffect(() => {
      let source = axios.CancelToken.source();
      if (id) {
        const fetchVisitNote = async () => {
          // Fetch Visit Note data.
          await axios.get('/hotline/api/visitnote/' + id + '/', {
            cancelToken: source.token,
          })
          .then(response => {
            setData(response.data);
          })
          .catch(error => {
            console.log(error.response);
          });
        };
      fetchVisitNote();
      };
      return () => {
        source.cancel();
      };
    }, [id]);

    return (
        <Formik
          initialValues={data}
          enableReinitialize={true}
          validationSchema={Yup.object({
            date_completed: Yup.date(),
            notes: Yup.string(),
          })}
          onSubmit={(values, { setSubmitting }) => {
            setTimeout(() => {
              axios.patch('/hotline/api/visitnote/' + values.id + '/', values)
              .then(
                  navigate('/hotline/servicerequest/' + values.service_request)
              )
              .catch(error => {
                console.log(error.response);
              });
            setSubmitting(false);
            }, 500);
          }}
        >
        {form => (
          <Card border="secondary" className="mt-5">
          <Card.Header as="h5" className="pl-3"><span style={{cursor:'pointer'}} onClick={() => window.history.back()} className="mr-3"><FontAwesomeIcon icon={faArrowAltCircleLeft} size="lg" inverse /></span>{!id ? "New" : "Update"} Visit Note - { form.values.address }</Card.Header>
          <Card.Body>
          <Form>
              <FormGroup>
                <Row>
                  <Col xs={{size: 2}}>
                  <DateTimePicker
                    label="Date Completed"
                    name="date_completed"
                    id="date_completed"
                    xs="7"
                    clearable={false}
                    onChange={(date, dateStr) => {
                      form.setFieldValue("date_completed", dateStr)
                    }}
                    value={form.values.date_completed||null}
                  />
                  </Col>
                </Row>
                <Row>
                  <Col xs={{size: 2}}>
                    <TextInput
                      as="textarea"
                      label="Notes"
                      name="notes"
                      id="notes"
                      xs="7"
                      rows={5}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <Label htmlFor="forced_entry" className="mt-2">Forced Entry</Label>
                    <Field component={Switch} name="forced_entry" type="checkbox" color="primary" />
                  </Col>
                </Row>
              </FormGroup>
          </Form>
          </Card.Body>
          <ButtonGroup>
            <Button type="button" className="btn btn-primary" onClick={() => {form.submitForm()}}>Save</Button>
          </ButtonGroup>
          </Card>
          )}
        </Formik>
    );
};
