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
  Row,
  Container,
  Form as BootstrapForm,
} from 'react-bootstrap';
import * as Yup from 'yup';
import Moment from 'react-moment';
import Header from '../components/Header';
import { TextInput} from '.././components/Form';

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
          start_time: Yup.date()
            .nullable(),
          end_time: Yup.date()
            .nullable(),
          service_requests: Yup.array(),
          team_members: Yup.array()
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
          <Card border="secondary" className="mt-5">
            <Card.Body>
            <BootstrapForm as={Form}>
            </BootstrapForm>
          </Card.Body>
          <ButtonGroup>
            <Button type="button" className="btn btn-primary" onClick={() => {props.submitForm()}}>Save</Button>
          </ButtonGroup>
          </Card>
          </>
        )}
      </Formik>
  )
}
