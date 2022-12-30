import React, { useContext, useEffect, useState } from 'react';
import axios from "axios";
import { navigate } from "raviger";
import { Field, Form, Formik, } from 'formik';
import Select from 'react-select';
import {
  Button,
  ButtonGroup,
  Card,
  Col,
  FormGroup,
  Row,
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowAltCircleLeft,
} from '@fortawesome/free-solid-svg-icons';
import * as Yup from 'yup';
import { DropDown, TextInput } from '../components/Form';
import { SystemErrorContext } from '../components/SystemError';

const customStyles = {
  // For the select it self, not the options of the select
  control: (styles, { isDisabled}) => {
    return {
      ...styles,
      color: '#FFF',
      cursor: isDisabled ? 'not-allowed' : 'default',
      backgroundColor: isDisabled ? '#DFDDDD' : 'white',
      height: 35,
      minHeight: 35
    }
  },
  option: provided => ({
    ...provided,
    color: 'black'
  }),
  // singleValue: (styles, { isDisabled }) => ({
  //   ...styles,
  //   color: isDisabled ? '#595959' : 'black'
  // }),
};

const VetRequestForm = (props) => {

  const { setShowSystemError } = useContext(SystemErrorContext);

  const [data, setData] = useState({
    patient: props.animalid,
    assignee: null,
    concern: '',
    priority: 'urgent',
    presenting_complaints: [],
  })

  const [assigneeChoices, setAssigneeChoices] = useState([]);
  const [presentingComplaintChoices, setPresentingComplaintChoices] = useState([]);

  useEffect(() => {
    let unmounted = false;
    let source = axios.CancelToken.source();
    if (props.id) {
      const fetchVetRequest = async () => {
        // Fetch Visit Note data.
        await axios.get('/vet/api/vetrequest/' + props.id + '/', {
          cancelToken: source.token,
        })
        .then(response => {
          if (!unmounted) {
            setData(response.data);
          }
        })
        .catch(error => {
          setShowSystemError(true);
        });
      };
      fetchVetRequest();
    };

    const fetchAssignees = async () => {
      // Fetch assignee data.
      await axios.get('/accounts/api/user/', {
        cancelToken: source.token,
      })
      .then(response => {
        if (!unmounted) {
          console.log(response.data)
          let options = [];
          response.data.forEach(function(person) {
            options.unshift({value: person.id, label: person.first_name + ' ' + person.last_name})
          });
          setAssigneeChoices(options);
        }
      })
      .catch(error => {
        setShowSystemError(true);
      });
    };
    fetchAssignees();

    const fetchPresentingComplaints = async () => {
      // Fetch assignee data.
      await axios.get('/vet/api/complaints/', {
        cancelToken: source.token,
      })
      .then(response => {
        if (!unmounted) {
          let options = [];
          response.data.forEach(function(complaint) {
            options.push({value: complaint.id, label: complaint.name})
          });
          setPresentingComplaintChoices(options);
        }
      })
      .catch(error => {
        setShowSystemError(true);
      });
    };
    fetchPresentingComplaints();

    // Cleanup.
    return () => {
      unmounted = true;
      source.cancel();
    };
  }, [props.id]);

  return (
    <Formik
      initialValues={data}
      enableReinitialize={true}
      validationSchema={Yup.object({
        assignee: Yup.number().nullable(),
        concern: Yup.string(),
        priority: Yup.string(),
      })}
      onSubmit={(values, { setSubmitting }) => {
        if (props.id) {
          axios.put('/vet/api/vetrequest/' + props.id + '/', values)
          .then(response => {
            // navigate('/' + incident + '/vet/vetrequest/' + props.id)
          })
          .catch(error => {
            setShowSystemError(true);
          });
          setSubmitting(false);
        }
        else {
          console.log(values)
          axios.post('/vet/api/vetrequest/', values)
          .then(response => {
            navigate('/' + props.incident + '/vet/vetrequest/' + response.data.id)
          })
          .catch(error => {
            console.log(error.response)
            setShowSystemError(true);
          });
          setSubmitting(false);
        }
      }}
    >
      {formikProps => (
        <Card border="secondary" className="mt-5">
          <Card.Header as="h5" className="pl-3"><span style={{ cursor: 'pointer' }} onClick={() => window.history.back()} className="mr-3"><FontAwesomeIcon icon={faArrowAltCircleLeft} size="lg" inverse /></span>{!props.id ? "" : "Update "}Veterinary Request Form</Card.Header>
          <Card.Body>
            <Form>
              <FormGroup>
                <Row>
                  <Col xs={"6"}>
                    <DropDown
                      label="Assignee"
                      id="assigneeDropdown"
                      name="assignee"
                      type="text"
                      key={`my_unique_assignee_select_key__${formikProps.values.assignee}`}
                      options={assigneeChoices}
                      // value={formikProps.values.assignee||data.assignee}
                      isClearable={true}
                      onChange={(instance) => {
                        console.log(instance.value)
                        formikProps.setFieldValue("assignee", instance === null ? '' : instance.value);
                      }}
                    />
                  </Col>
                </Row>
                <Row className="mt-3">
                  <Col xs={"6"}>
                    <DropDown
                      label="Priority"
                      id="priorityDropdown"
                      name="priority"
                      type="text"
                      options={[
                        { value: 'urgent', label: 'Urgent' },
                        { value: 'when_available', label: 'When Available' },
                      ]}
                      value={formikProps.values.priority||data.priority}
                      isClearable={false}
                      onChange={(instance) => {
                        formikProps.setFieldValue("priority", instance === null ? '' : instance.value);
                      }}
                    />
                  </Col>
                </Row>
                <Row className="mt-3">
                  <Col xs={"6"}>
                    <label>Presenting Complaints</label>
                    <Select
                      label="Presenting Complaints"
                      id="presenting_complaintsDropdown"
                      name="presenting_complaints"
                      type="text"
                      styles={customStyles}
                      isMulti
                      options={presentingComplaintChoices}
                      // value={formikProps.values.presenting_complaints||data.presenting_complaints}
                      isClearable={true}
                      onChange={(instance) => {
                        let values = [];
                        instance.forEach(option => {
                          values.push(option.value);
                        })
                        formikProps.setFieldValue("presenting_complaints", instance === null ? [] : values);
                      }}
                    />
                  </Col>
                </Row>
                <Row className="mt-3 pl-0">
                  <TextInput
                    as="textarea"
                    label="Concern"
                    name="concern"
                    id="concern"
                    xs="8"
                    rows={4}
                  />
                </Row>
              </FormGroup>
            </Form>
          </Card.Body>
          <ButtonGroup>
            <Button type="button" className="btn btn-primary" onClick={() => { formikProps.submitForm() }}>Save</Button>
          </ButtonGroup>
        </Card>
      )}
    </Formik>
  );
};

export default VetRequestForm;
