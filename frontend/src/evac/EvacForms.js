import React, { useEffect, useState } from 'react';
import axios from "axios";
import { Link, navigate } from "raviger";
import { Form, Formik } from 'formik';
import {
  Button,
  Col,
  FormGroup,
  Row,
  Container,
} from 'react-bootstrap';
import * as Yup from 'yup';
import { DateTimePicker, TextInput, DropDown} from '.././components/Form';


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

export const VisitNoteForm = ({id}) => {

    const [data, setData] = useState({
      timestamp: '',
      evac_assignment: '',
      service_request: '',
      owner_contacted: '',
      notes: '',
    })
    useEffect(() => {
      let source = axios.CancelToken.source();
      if (id) {
        const fetchVisitNote = async () => {
          // Fetch Visit Note data.
          await axios.get('/evac/api/visitnote/' + id + '/', {
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
    });

    return (
        <Formik
          initialValues={data}
          validationSchema={Yup.object({
            timestamp: Yup.date(),
            notes: Yup.string(),
            owner_contacted: Yup.bool().required('Required'),
          })}
          onSubmit={(values, { setSubmitting, resetForm }) => {
            setTimeout(() => {
              axios.post('/evac/api/visitnote/', values)
              .then(
                  navigate('/evac')
              )
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
                  <DateTimePicker
                    label="Timestamp"
                    name="timestamp"
                    id="timestamp"
                    xs="4"
                    onChange={(date, dateStr) => {
                      form.setFieldValue("timestamp", dateStr)
                    }}
                    value={form.values.timestamp||null}
                  />
                  </Col>
                </Row>
              </FormGroup>
              <FormGroup>
                <Row>
                  <Col xs={{size: 5, offset: 1}}>
                    <TextInput
                      type="text"
                      label="Notes*"
                      name="notes"
                      id="notes"
                    />
                  </Col>
                </Row>
              </FormGroup>
              <Button type="button" className="btn btn-success mr-1" onClick={() => form.submitForm()}>Save</Button>
              <Link className="btn btn-secondary" href="/evac">Cancel</Link>
            </Container>
          </Form>
          )}
        </Formik>
    );
};

