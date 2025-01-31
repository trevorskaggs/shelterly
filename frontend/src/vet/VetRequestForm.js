import React, { useContext, useEffect, useState } from 'react';
import axios from "axios";
import { navigate } from "raviger";
import { Field, Form, Formik, } from 'formik';
import Select from 'react-select';
import { Switch } from 'formik-material-ui';
import {
  Button,
  ButtonGroup,
  Card,
  Col,
  Form as BootstrapForm,
  FormGroup,
  Row,
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowAltCircleLeft,
} from '@fortawesome/free-solid-svg-icons';
import * as Yup from 'yup';
import { AuthContext } from "../accounts/AccountsReducer";
import { DateTimePicker, DropDown, TextInput } from '../components/Form';
import { SystemErrorContext } from '../components/SystemError';
import Patient from './components/Patient';

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
    open: new Date(),
    patient: props.animalid,
    incident: state.incident.id,
    requested_by: null,
    exam: null,
    concern: '',
    priority: 'urgent',
    presenting_complaints: [],
    complaints_other: '',
    caution: false,
  });

  const [animalData, setAnimalData] = useState({});

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
            setAnimalData(response.data.animal_object)
          }
        })
        .catch(error => {
          setShowSystemError(true);
        });
      };
      fetchVetRequest();
    };

    if (props.animalid) {
      const fetchAnimalData = async () => {
        // Fetch Animal data.
        await axios.get('/animals/api/incident/' + (state ? state.incident.id : 'undefined') + '/animal/' + (props.animalid ? props.animalid : data.animal_object.id_for_incident) + '/', {
          cancelToken: source.token,
        })
        .then(response => {
          if (!unmounted) {
            setAnimalData(response.data);
          }
        })
        .catch(error => {
          if (!unmounted) {
            setShowSystemError(true);
          }
        })
      };
      fetchAnimalData();
    };

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
        concern: Yup.string(),
        priority: Yup.string(),
        caution: Yup.boolean(),
        presenting_complaints: Yup.array().min(1, 'Required'),
        complaints_other: Yup.string(),
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
          <Card.Header as="h5" className="pl-3">
            {state.prevLocation ?
              <span style={{ cursor: 'pointer' }} onClick={() => navigate(state.prevLocation)} className="mr-3"><FontAwesomeIcon icon={faArrowAltCircleLeft} size="lg" inverse /></span>
            : props.id ? <span style={{ cursor: 'pointer' }} onClick={() => navigate('/' + props.organization + '/' + props.incident + '/vet/vetrequest/' + props.id + '/')} className="mr-3">
              <FontAwesomeIcon icon={faArrowAltCircleLeft} size="lg" inverse />
            </span>:
            <span style={{ cursor: 'pointer' }} onClick={() => navigate('/' + props.organization + '/' + props.incident + '/animals/' + props.animalid + '/')} className="mr-3">
              <FontAwesomeIcon icon={faArrowAltCircleLeft} size="lg" inverse />
            </span>}
            {!props.id ? "" : "Update "}Veterinary Request Form
          </Card.Header>
          <Patient animal={animalData} vet_request={null} organization={props.organization} incident={props.incident} />
          <Card.Body>
            <Form>
              <FormGroup>
                <Row className="mb-3">
                  <DateTimePicker
                    label="Scheduled"
                    name="open"
                    id="open"
                    xs="4"
                    onChange={(date, dateStr) => {
                      formikProps.setFieldValue("open", dateStr)
                    }}
                    data-enable-time={false}
                    clearable={false}
                    value={formikProps.values.open||new Date()}
                  />
                </Row>
                <Row>
                  <Col xs={"4"}>
                    <DropDown
                      label="Priority"
                      id="priorityDropdown"
                      name="priority"
                      type="text"
                      options={[
                        { value: 'urgent', label: 'Urgent (Red)' },
                        { value: 'when_available', label: 'When Available (Yellow)' },
                      ]}
                      value={formikProps.values.priority||data.priority}
                      isClearable={false}
                      onChange={(instance) => {
                        formikProps.setFieldValue("priority", instance === null ? '' : instance.value);
                      }}
                    />
                  </Col>
                </Row>
                <Row className="mt-3 mb-3">
                  <Col xs={"8"}>
                    <label>Presenting Complaints*</label>
                    <Select
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
                    {formikProps.errors['presenting_complaints'] ? <div style={{ color: "#e74c3c", marginTop: ".5rem", fontSize: "80%" }}>{formikProps.errors['presenting_complaints']}</div> : ""}
                  </Col>
                </Row>
                {presentingComplaintChoices.length && formikProps.values.presenting_complaints.includes(presentingComplaintChoices.filter(option => option.label === 'Other')[0].value) ?
                <Row>
                  <TextInput
                    type="text"
                    label="Other Presenting Complaint"
                    name="complaints_other"
                    id="complaints_other"
                    xs="6"
                  />
                </Row>
                : ""}
                <Row className="pl-0">
                  <TextInput
                    as="textarea"
                    label="Concern"
                    name="concern"
                    id="concern"
                    xs="8"
                    rows={4}
                  />
                </Row>
                <Row style={{marginBottom:"-15px"}}>
                  <Col xs="2">
                    <BootstrapForm.Label htmlFor="caution" style={{marginBottom:"-5px"}}>Use Caution</BootstrapForm.Label>
                    <div style={{marginLeft:"-3px"}}><Field component={Switch} name="caution" type="checkbox" color="primary" /></div>
                  </Col>
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
