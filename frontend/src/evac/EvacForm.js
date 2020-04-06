import React, {useEffect, useState} from 'react';
import axios from "axios";
import { A, navigate } from "hookrouter";
import { Field, Form, useField, Formik } from 'formik';
import {
  Button,
  Col,
  FormGroup,
  Label,
  Row,
  Input,
  Container,
} from 'reactstrap';
import { ReactstrapInput } from 'reactstrap-formik';
import 'bootstrap/dist/css/bootstrap.min.css';
import * as Yup from 'yup';

const MyMultiSelect = ({ label, ...props }) => {
  const [field] = useField(props);
  return (
    <>
      <Label htmlFor={props.id || props.name}>{label}</Label>
      <Input type="select" {...field} {...props} multiple={true}/>
    </>
  );
};

const style = {
  textAlign: "center",
};

export function EvacTeamForm() {
  const [data, setData] = useState({options: [], isFetching: false});
  // Hook for initializing data.
  useEffect(() => {
    let source = axios.CancelToken.source();
    const fetchTeamMembers = async () => {
      setData({isFetching: true});
      // Fetch TeamMember data.
      await axios.get('http://localhost:8000/people/api/teammember/', {
        cancelToken: source.token,
      })
      .then(response => {
        response.data.forEach(function(teammember){
          // Store relevant information for creating valid options.
          const obj = {value: teammember.id, label: teammember.first_name};
          data.options.push(obj)
        });
        setData({options: data.options, isFetching: false});
      })
      .catch(e => {
        console.log(e);
        setData({isFetching: false});
      });
    };
    fetchTeamMembers();
    // Cleanup.
    return () => {
      source.cancel();
    };
  }, [data.options]);

  return (
    <>
      <h1 style={style}>Evac Team</h1>
      <Formik
        initialValues={{
          evac_team_members: [],
          callsign: '',
        }}
        validationSchema={Yup.object({
          evac_team_members: Yup.array()
            .of(Yup.string())
            .required('Required'),
          callsign: Yup.string()
            .max(50, 'Must be 20 characters or less')
            .required('Required'),
        })}
        onSubmit={(values, { setSubmitting }) => {
          axios.post('http://localhost:8000/evac/api/evacteam/', values)
          .then(function() {
            navigate('/evac');
          })
          .catch(e => {
            console.log(e);
          });
          setSubmitting(false);
        }}
      >
        <Form>
          <Container>
            <FormGroup>
              <MyMultiSelect label="Evac Team Members*" name="evac_team_members" className="mb-3">
                {data.options.map(({ value, label }, index) => <option value={value} key={value} >{label}</option>)}
              </MyMultiSelect>
              <Field
                type="text"
                label="Callsign*"
                name="callsign"
                id="callsign"
                component={ReactstrapInput}
              />
            </FormGroup>

            <Button type="submit" className="btn-success mr-1">Save</Button>
            <A className="btn btn-secondary" href="/evac">Cancel</A>
          </Container>
        </Form>
      </Formik>
    </>
  );
};

export const TeamMemberForm = () => {
    return (
      <>
        <h1 style={style}>Team Member</h1>
        <Formik
          initialValues={{
            first_name: '',
            last_name: '',
            cell_phone: '',
            agency_id: '',
          }}
          validationSchema={Yup.object({
            first_name: Yup.string()
              .max(50, 'Must be 50 characters or less')
              .required('Required'),
            last_name: Yup.string()
              .max(50, 'Must be 50 characters or less')
              .required('Required'),
            cell_phone: Yup.string().required('Required'),
            agency_id: Yup.string(),
          })}
          onSubmit={(values, { setSubmitting }) => {
            axios.post('http://localhost:8000/people/api/teammember/', values)
            .then(function() {
              navigate('/evac');
            })
            .catch(e => {
              console.log(e);
            });
            setSubmitting(false);
          }}
        >
          <Form>
            <Container>
              <FormGroup>
                <Row>
                  <Col xs={{size: 5, offset: 1}}>
                    <Field
                      type="text"
                      label="First Name*"
                      name="first_name"
                      id="first_name"
                      component={ReactstrapInput}
                    />
                  </Col>
                  <Col xs="5">
                    <Field
                      type="text"
                      label="Last Name*"
                      name="last_name"
                      id="last_name"
                      component={ReactstrapInput}
                    />
                  </Col>
                </Row>
              </FormGroup>

              <FormGroup>
                <Row>
                  <Col xs={{size: 5, offset: 1}}>
                    <Field
                      type="text"
                      label="Cell Phone*"
                      name="cell_phone"
                      id="cell_phone"
                      component={ReactstrapInput}
                    />
                  </Col>
                  <Col xs="5">
                    <Field
                      type="text"
                      label="Agency ID"
                      name="agency_id"
                      id="agency_id"
                      component={ReactstrapInput}
                    />
                  </Col>
                </Row>
              </FormGroup>

              <Button type="submit" className="btn-success mr-1">Save</Button>
              <A className="btn btn-secondary" href="/evac">Cancel</A>
            </Container>
          </Form>
        </Formik>
      </>
    );
  };
