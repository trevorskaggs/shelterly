import React, { useContext, useEffect, useState } from 'react';
import axios from "axios";
import { navigate, useQueryParams } from "raviger";
import { Form, Formik, } from 'formik';
import Select from 'react-select';
import {
  Button,
  ButtonGroup,
  Card,
  Col,
  FormGroup,
  ListGroup,
  Row,
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowAltCircleLeft,
} from '@fortawesome/free-solid-svg-icons';
import * as Yup from 'yup';
import { DropDown, TextInput } from '../components/Form';
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

const DiagnosisForm = (props) => {

  // Identify any query param data.
  const [queryParams] = useQueryParams();
  const {
    vetrequest_id = null,
  } = queryParams;

  const { setShowSystemError } = useContext(SystemErrorContext);

  // Determine if we're in the vet exam workflow.
  var is_workflow = window.location.pathname.includes("workflow");

  const [data, setData] = useState({
    diagnosis: [],
    original_diagnosis: [],
    diagnosis_notes: '',
    diagnosis_other: '',
    animal_object: {id:''},
    vet_requests: [],
    exams: []
  })

  const [diagnosisChoices, setDiagnosisChoices] = useState([]);
  const [originalChoices, setOriginalChoices] = useState([]);

  useEffect(() => {
    let unmounted = false;
    let source = axios.CancelToken.source();
    if (props.medrecordid) {
      if (is_workflow) {
        setData(props.state.medRecord);
        // Fetch diagnosis data.
        axios.get('/vet/api/diagnosis/', {
          cancelToken: source.token,
        })
        .then(diagnosisResponse => {
          if (!unmounted) {
            let options = [];
            diagnosisResponse.data.forEach(function(diagnosis) {
              if (!props.state.medRecord.diagnosis.includes(diagnosis.id)) {
                options.push({value: diagnosis.id, label: diagnosis.name})
              }
            });
            setDiagnosisChoices(options);
          }
        })
        .catch(error => {
          setShowSystemError(true);
        });
      }
      else {
        const fetchMedRecord = async () => {
          // Fetch MedRecord data.
          await axios.get('/vet/api/medrecord/' + props.medrecordid + '/', {
            cancelToken: source.token,
          })
          .then(response => {
            if (!unmounted) {
              // Fetch diagnosis data.
              axios.get('/vet/api/diagnosis/', {
                cancelToken: source.token,
              })
              .then(diagnosisResponse => {
                if (!unmounted) {
                  let original_options = [];
                  let options = [];
                  diagnosisResponse.data.forEach(function(diagnosis) {
                    if (!response.data.diagnosis.includes(diagnosis.id)) {
                      options.push({value: diagnosis.id, label: diagnosis.name})
                    }
                    else {
                      original_options.push({value: diagnosis.id, label: diagnosis.name})
                    }
                  });
                  setDiagnosisChoices(options);
                  setOriginalChoices(original_options);
                  response.data['original_diagnosis'] = response.data.diagnosis;
                  response.data['diagnosis'] = [];
                  setData(response.data);
                }
              })
              .catch(error => {
                setShowSystemError(true);
              });
            }
          })
          .catch(error => {
            setShowSystemError(true);
          });
        };
        fetchMedRecord();
      }
    };

    // Cleanup.
    return () => {
      unmounted = true;
      source.cancel();
    };
  }, [props.medrecordid]);

  return (
    <Formik
      initialValues={data}
      enableReinitialize={true}
      validationSchema={Yup.object({
        diagnosis: Yup.array().when('is_workflow', {
          is: false,
          then: Yup.array().min(1, 'Required').required('Required')}),
        diagnosis_other: Yup.string().nullable().max(50, 'Maximum character limit of 50.'),
        diagnosis_notes: Yup.string().nullable().max(300, 'Maximum character limit of 300.'),
      })}
      onSubmit={(values, { setSubmitting }) => {
        // Add treatment and order data if we're in a workflow.
        if (is_workflow) {
          props.state.steps.treatments.forEach(treatment_values => {
            // Only post data if we have a treatment value.
            if (treatment_values.treatment) {
              axios.post('/vet/api/treatmentrequest/', treatment_values)
              .catch(error => {
                setShowSystemError(true);
              });
            }
          })

          values['diagnostics'] = props.state.steps.orders.diagnostics
          values['diagnostics_other'] = props.state.steps.orders.diagnostics_other
          values['procedures'] = props.state.steps.orders.procedures
          values['procedure_other'] = props.state.steps.orders.procedure_other
        }

        // Add current diagnoses back in.
        if (values.original_diagnosis) {
          values.original_diagnosis.forEach(diagnosis => (
            values['diagnosis'].push(diagnosis)
          ))
        }
        else if (props.state.medRecord.diagnosis) {
          props.state.medRecord.diagnosis.forEach(diagnosis => (
            values['diagnosis'].push(diagnosis)
          ))
        }

        axios.patch('/vet/api/medrecord/' + props.medrecordid + '/', values)
        .then(response => {
          navigate('/' + props.organization + '/' + props.incident + '/vet/medrecord/' + props.medrecordid);
        })
        .catch(error => {
          setShowSystemError(true);
        });
        setSubmitting(false);
      }}
    >
      {formikProps => (
        <Card border="secondary" className="mt-3">
          <Card.Header as="h5" className="pl-3">
            {is_workflow ?
            <span style={{cursor:'pointer'}} onClick={() => {props.handleBack('diagnostics', 'exam')}} className="mr-3"><FontAwesomeIcon icon={faArrowAltCircleLeft} size="lg" inverse /></span>
            :
            <span style={{ cursor: 'pointer' }} onClick={() => window.history.back()} className="mr-3"><FontAwesomeIcon icon={faArrowAltCircleLeft} size="lg" inverse /></span>}
            Diagnosis Form
          </Card.Header>
          <Patient animal={data.animal_object} vet_request={null} organization={props.organization} incident={props.incident} medical_plan={props.state.medRecord && props.state.medRecord.medical_plan ? props.state.medRecord.medical_plan : data.medical_plan} />
          <Card.Body>
            <Form>
              <FormGroup>
                {data.original_diagnosis ? <Row className="mb-3">
                  <Col xs={"6"}>
                    <label>Current Diagnoses</label>
                    <Select
                      id="originalDiagnosisDropdown"
                      name="original_diagnosis"
                      type="text"
                      styles={customStyles}
                      isMulti
                      options={originalChoices}
                      value={originalChoices.filter(choice => formikProps.values.original_diagnosis.includes(choice.value))}
                      isClearable={false}
                      onChange={(instance) => {
                        let values = [];
                        instance && instance.forEach(option => {
                          values.push(option.value);
                        })
                        formikProps.setFieldValue("original_diagnosis", instance === null ? [] : values);
                      }}
                    />
                  </Col>
                </Row> : ""}
                <Row className="mb-3">
                  <Col xs={"6"}>
                    <label>Diagnosis</label>
                    <Select
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
                    {formikProps.errors['diagnosis'] ? <div style={{ color: "#e74c3c", marginTop: ".5rem", fontSize: "80%" }}>{formikProps.errors['diagnosis']}</div> : ""}
                  </Col>
                </Row>
                {diagnosisChoices.length && formikProps.values.diagnosis.includes(diagnosisChoices.filter(option => (option.label === 'OPEN' || option.label === 'Other'))[0].value) ?
                <Row>
                  <TextInput
                    type="text"
                    label="Other Diagnosis"
                    name="diagnosis_other"
                    id="diagnosis_other"
                    xs="6"
                  />
                </Row>
                : ""}
                <Row style={{marginBottom:"-15px"}}>
                  <TextInput
                    as="textarea"
                    label="Diagnosis Notes"
                    name="diagnosis_notes"
                    id="diagnosis_notes"
                    xs="6"
                    rows={3}
                    value={formikProps.values.diagnosis_notes || ''}
                  />
                </Row>
              </FormGroup>
            </Form>
          </Card.Body>
          <ButtonGroup>
            <Button type="button" className="btn btn-primary" onClick={() => { formikProps.submitForm() }}>{is_workflow ? "Save and Finish" : "Save"}</Button>
          </ButtonGroup>
        </Card>
      )}
    </Formik>
  );
};

export default DiagnosisForm;
