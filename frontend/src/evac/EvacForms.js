import React, { useEffect, useState } from 'react';
import axios from "axios";
import { Link, navigate } from "raviger";
import { Form, Formik } from 'formik';
import {
  Button,
  ButtonGroup,
  Card,
  Col,
  FormGroup,
  ListGroup,
  Row,
  Container,
  Form as BootstrapForm,
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClipboardList,
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
  const phoneRegex = /^((\+\d{1,3}(-| )?\(?\d\)?(-| )?\d{1,3})|(\(?\d{2,3}\)?))(-| )?(\d{3,4})(-| )?(\d{4})(( x| ext)\d{1,5}){0,1}$/

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
          <Form>
            <Container>
              <FormGroup>
                <Row>
                  <Col xs={{size: 5, offset: 1}}>
                    <TextInput
                      type="text"
                      label="First Name*"
                      name="first_name"
                      id="first_name"
                    />
                  </Col>
                  <Col xs="5">
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
                  <Col xs={{size: 5, offset: 1}}>
                    <TextInput
                      type="text"
                      label="Phone*"
                      name="phone"
                      id="phone"
                    />
                  </Col>
                  <Col xs="5">
                    <TextInput
                      type="text"
                      label="Agency ID"
                      name="agency_id"
                      id="agency_id"
                    />
                  </Col>
                </Row>
              </FormGroup>
              <Button type="button" className="btn btn-success mr-1" onClick={() => {setAddAnother(false); form.submitForm()}}>Save</Button>
              <Button type="button" className="btn btn-success mr-1" onClick={() => {setAddAnother(true); form.submitForm()}}>Add Another</Button>
              <Link className="btn btn-secondary" href="/evac">Cancel</Link>
            </Container>
          </Form>
          )}
        </Formik>
    );
  };

export function EvacResolution({id}) {

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
          end_time: Yup.date(),
          service_requests: Yup.array(),
          team_members: Yup.array(),
          sr_updates: Yup.array().of(
            Yup.object().shape({
              id: Yup.string().required(),
              followup_date: Yup.date(),
              animals: Yup.array().of(
                Yup.object().shape({
                  id: Yup.string().required(),
                  status: Yup.string().required('Required'),
                })
              ),
              date_completed: Yup.date().required('Required'),
              note: Yup.string().required('Required'),
              owner_notified: Yup.boolean().required('The owner must be notified!'),
            })
          ),
        })}
        onSubmit={(values, { setSubmitting }) => {
          setTimeout(() => {
            axios.post('/evac/api/evacassignment/' + {id} + '/', values)
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
          <Header>Dispatch Assignment #{id} (<Moment format="L">{data.start_time}</Moment>) Resolution</Header>
          <hr/>
          <Card border="secondary" className="mt-3">
            <Card.Body>
              <BootstrapForm as={Form}>
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
              </BootstrapForm>
            </Card.Body>
          </Card>
          {data.service_request_objects.map(service_request => (
          <Card key={service_request.id} border="secondary" className="mt-3">
            <Card.Body>
              <BootstrapForm as={Form}>
                <Card.Title>
                  <h4>Service Request #{service_request.id} <Link href={"/hotline/servicerequest/" + id}> <FontAwesomeIcon icon={faClipboardList} inverse /></Link> | <span style={{textTransform:"capitalize"}}>{service_request.status}</span></h4>
                </Card.Title>
                <hr/>
                <ListGroup variant="flush" style={{marginTop:"-13px", marginBottom:"-13px", textTransform:"capitalize"}}>
                    <ListGroup.Item><b>Address: </b>{service_request.full_address}</ListGroup.Item>
                    <ListGroup.Item><b>Owner: </b>{service_request.owner_object.first_name} {service_request.owner_object.last_name}</ListGroup.Item>
                    <ListGroup.Item><b>Reporter: </b>{service_request.reporter ? <span>{service_request.reporter_object.first_name} {service_request.reporter_object.last_name}</span> : "N/A"}</ListGroup.Item>
                    {service_request.animals.map(animal => (
                      <ListGroup.Item key={animal.id}>
                        <Row>
                          <Col xs={3}>
                            <DropDown
                              id="status"
                              name="status"
                              type="text"
                              className="mt-0"
                              options={statusChoices}
                              value={animal.status}
                            />
                        </Col>
                        {animal.pcolor ? <span>{animal.pcolor}{animal.scolor ? "/" + animal.scolor : ""}</span> : ""} {animal.species} ({animal.name||"Unknown"})
                      </Row>
                    </ListGroup.Item>
                    ))}
                </ListGroup>
                <BootstrapForm.Row className="mt-3">
                  <DateTimePicker
                    label="Date Completed"
                    name="end_date"
                    id="end_date"
                    xs="4"
                    data-enable-time={false}
                    onChange={(date, dateStr) => {
                      props.setFieldValue("end_date", dateStr)
                    }}
                    value={data.end_date||new Date(new Date().getFullYear(),new Date().getMonth() , new Date().getDate()).toJSON().substring(0,10)}
                  />
                </BootstrapForm.Row>
                <BootstrapForm.Row className="mt-3">
                  <TextInput
                    id="note"
                    xs="9"
                    name="note"
                    as="textarea"
                    rows={5}
                    label="Note"
                  />
                </BootstrapForm.Row>
                <BootstrapForm.Row>
                  <DateTimePicker
                    label="Followup Date"
                    name="followup_date"
                    id="followup_date"
                    xs="4"
                    data-enable-time={false}
                    onChange={(date, dateStr) => {
                      props.setFieldValue("followup_date", dateStr)
                    }}
                    value={data.followup_date||null}
                  />
                </BootstrapForm.Row>
                <BootstrapForm.Row className="mt-3 ml-1">
                  <label>Owner Notified: </label>
                  <input type="checkbox" name="owner_notified" id="owner_notified" className="mt-1 ml-1" onChange={() => props.setFieldValue("owner_notified", true)} />
                  </BootstrapForm.Row>
              </BootstrapForm>
            </Card.Body>
          </Card>
          ))}
          <ButtonGroup>
            <Button type="button" className="btn btn-primary" onClick={() => {props.submitForm()}}>Save</Button>
          </ButtonGroup>
          </>
        )}
      </Formik>
  )
}
