import React, { useContext, useEffect, useState } from 'react';
import axios from "axios";
import { navigate } from "raviger";
import { Form, Formik, } from 'formik';
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
import { AuthContext } from "../accounts/AccountsReducer";
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

  const { state } = useContext(AuthContext);
  const { setShowSystemError } = useContext(SystemErrorContext);

  const [data, setData] = useState({
    patient: props.animalid,
    assignee: null,
    exam: null,
    concern: '',
    diagnosis: [],
    priority: 'urgent',
    presenting_complaints: [],
  })

  const [assigneeChoices, setAssigneeChoices] = useState([]);
  const [presentingComplaintChoices, setPresentingComplaintChoices] = useState([]);
  const [diagnosisChoices, setDiagnosisChoices] = useState([]);

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
      await axios.get('/accounts/api/user/?vet=true&organization=' + state.organization.id, {
        cancelToken: source.token,
      })
      .then(response => {
        if (!unmounted) {
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

    const fetchDiagnoses = async () => {
      // Fetch diagnosis data.
      await axios.get('/vet/api/diagnosis/', {
        cancelToken: source.token,
      })
      .then(response => {
        if (!unmounted) {
          let options = [];
          response.data.forEach(function(diagnosis) {
            options.push({value: diagnosis.id, label: diagnosis.name})
          });
          setDiagnosisChoices(options);
        }
      })
      .catch(error => {
        setShowSystemError(true);
      });
    };
    if (props.id) {
      fetchDiagnoses();
    }

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
            navigate('/' + props.organization + '/' + props.incident + '/vet/vetrequest/' + props.id)
          })
          .catch(error => {
            setShowSystemError(true);
          });
          setSubmitting(false);
        }
        else {
          axios.post('/vet/api/vetrequest/', values)
          .then(response => {
            navigate('/' + props.organization + '/' + props.incident + '/vet/vetrequest/' + response.data.id)
          })
          .catch(error => {
            setShowSystemError(true);
          });
          setSubmitting(false);
        }
      }}
    >
      {formikProps => (
        <Card border="secondary" className="mt-5">
          <Card.Header as="h5" className="pl-3"><span style={{ cursor: 'pointer' }} onClick={() => navigate('/' + props.organization + '/' + props.incident + '/vet/vetrequest/' + props.id + '/')} className="mr-3"><FontAwesomeIcon icon={faArrowAltCircleLeft} size="lg" inverse /></span>{!props.id ? "" : "Update "}Veterinary Request Form</Card.Header>
          <Card.Body>
            <Form>
              <FormGroup>
                <Row>
                  <Col xs={"4"}>
                    <DropDown
                      label="Assignee"
                      id="assigneeDropdown"
                      name="assignee"
                      type="text"
                      key={`my_unique_assignee_select_key__${formikProps.values.assignee}`}
                      options={assigneeChoices}
                      isClearable={true}
                      onChange={(instance) => {
                        formikProps.setFieldValue("assignee", instance === null ? '' : instance.value);
                      }}
                    />
                  </Col>
                </Row>
                <Row className="mt-3">
                  <Col xs={"4"}>
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
                  <Col xs={"8"}>
                    <label>Presenting Complaints</label>
                    <Select
                      label="Presenting Complaints"
                      id="presenting_complaintsDropdown"
                      name="presenting_complaints"
                      type="text"
                      styles={customStyles}
                      isMulti
                      options={presentingComplaintChoices}
                      value={presentingComplaintChoices.filter(choice => formikProps.values.presenting_complaints.includes(choice.value))}
                      isClearable={true}
                      onChange={(instance) => {
                        let values = [];
                        instance && instance.forEach(option => {
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
                {data.exam ?
                <Row>
                  <Col xs={"8"}>
                    <label>Diagnosis</label>
                    <Select
                      label="Diagnosis"
                      id="diagnosisDropdown"
                      name="diagnosis"
                      type="text"
                      styles={customStyles}
                      isMulti
                      options={diagnosisChoices}
                      value={diagnosisChoices.filter(choice => formikProps.values.diagnosis.includes(choice.value))}
                      isClearable={false}
                      onChange={(instance) => {
                        let values = [];
                        instance && instance.forEach(option => {
                          values.push(option.value);
                        })
                        formikProps.setFieldValue("diagnosis", instance === null ? [] : values);
                      }}
                    />
                  </Col>
                </Row>
                : ""}
                {diagnosisChoices.length && formikProps.values.diagnosis.includes(diagnosisChoices.filter(option => option.label === 'OPEN')[0].value) ?
                <Row className="mt-3" style={{marginBottom:"-15px"}}>
                  <TextInput
                    type="text"
                    label="Other Diagnosis"
                    name="diagnosis_other"
                    id="diagnosis_other"
                    xs="6"
                  />
                </Row>
                : ""}
                {data.exam ?
                <Row className="mt-3" style={{marginBottom:"-15px"}}>
                  <TextInput
                    as="textarea"
                    label="Diagnostic Notes"
                    name="diagnosis_notes"
                    id="diagnosis_notes"
                    xs="6"
                    rows={3}
                  />
                </Row>
                : ""}
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
