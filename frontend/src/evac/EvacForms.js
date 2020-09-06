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
import { TextInput} from '.././components/Form';
import { Typeahead } from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';

export function TeamMemberSelector() {
  const [selected, setSelected] = useState([]);
  const [data, setData] = useState({options: [], isFetching: false});

  function getSelected(){
    var selectedIds = [];
    selected.forEach(function(item){
      selectedIds.push(item.id);
    })
    return selectedIds;
  }

  useEffect(() => {
    let source = axios.CancelToken.source();
    const fetchTeamMembers = async () => {
      setData({options: [], isFetching: true});
      await axios.get('/evac/api/evacteammember/', {
        cancelToken: source.token,
      })
      .then(response => {
        var options = []
        response.data.forEach(function(teammember){
          options.push({id: teammember.id, label: teammember.display_name})
        });
        setData({options: options, isFetching: false});
      })
      .catch(error => {
        console.log(error.response);
        setData({options: [], isFetching: false});
      });
    };
    fetchTeamMembers();
    return () => {
      source.cancel();
    };
  }, [])

  return (
    <Formik
      initialValues={{
        team_members: '',
      }}
      onSubmit={(values, { setSubmitting }) => {
        values.team_members = getSelected();
        setTimeout(() => {
          axios.post('/evac/api/evacassignment/', values)
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
        <FormGroup style={{ marginTop: '20px' }}>
          <Typeahead
            id="team-members"
            multiple
            onChange={setSelected}
            options={data.options}
            placeholder="Choose team members..."
            selected={selected}
          />
        </FormGroup>
        <Button type="submit" className="mt-2 mb-1">Deploy!</Button>
      </Container>
    </Form>
  </Formik>
  );
};

export const EvacTeamMemberForm = () => {
    return (
      <>
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
              .required('Required'),
            agency_id: Yup.string(),
          })}
          onSubmit={(values, { setSubmitting }) => {
            setTimeout(() => {
              axios.post('/evac/api/evacteammember/', values)
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

              <Button type="submit" className="btn-success mr-1">Save</Button>
              <Link className="btn btn-secondary" href="/evac">Cancel</Link>
            </Container>
          </Form>
        </Formik>
      </>
    );
  };
