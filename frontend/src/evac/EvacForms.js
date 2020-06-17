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
import 'bootstrap/dist/css/bootstrap.min.css';
import * as Yup from 'yup';
import { MultiSelect, TextInput} from '.././components/Form';
import styled from 'styled-components';


export const StyledForm = styled(Form)`
background-color: #454d55;
font-weight: bold;
font-size: 1em;
padding: 0.25em 1em;
border: 2px solid palevioletred;
`


export function EvacTeamForm() {
  const [data, setData] = useState({options: [], isFetching: false});
  // Hook for initializing data.
  useEffect(() => {
    let source = axios.CancelToken.source();
    const fetchTeamMembers = async () => {
      setData({options: data.options, isFetching: true});
      // Fetch TeamMember data.
      await axios.get('http://localhost:3000/accounts/api/user/', {
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
      .catch(error => {
        console.log(error.response);
        setData({options: data.options, isFetching: false});
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
            .max(20, 'Must be 20 characters or less')
            .required('Required'),
        })}
        onSubmit={(values, { setSubmitting }) => {
          setTimeout(() => {
            axios.post('http://localhost:3000/evac/api/evacteam/', values)
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
        <StyledForm>
          <Container>
            <FormGroup>
              <MultiSelect label="Evac Team Members*" name="evac_team_members" className="mb-3">
                {data.options.map(({ value, label }, index) => <option value={value} key={value} >{label}</option>)}
              </MultiSelect>
              <TextInput
                type="text"
                label="Callsign*"
                name="callsign"
                id="callsign"
              />
            </FormGroup>

            <Button type="submit" className="btn-success mr-1">Save</Button>
            <Link className="btn btn-secondary" href="/evac">Cancel</Link>
          </Container>
        </StyledForm>
      </Formik>
    </>
  );
};

// No longer used but may still provide a good example for the time being.
export const TeamMemberForm = () => {
    return (
      <>
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
            cell_phone: Yup.string()
              .required('Required'),
            agency_id: Yup.string(),
          })}
          onSubmit={(values, { setSubmitting }) => {
            setTimeout(() => {
              axios.post('http://localhost:3000/accounts/api/user/', values)
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
                      label="Cell Phone*"
                      name="cell_phone"
                      id="cell_phone"
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

              <Button type="submit" className="btn-success mr-1">Save</Button>
              <Link className="btn btn-secondary" href="/evac">Cancel</Link>
            </Container>
          </Form>
        </Formik>
      </>
    );
  };
