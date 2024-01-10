import React, { useContext, useEffect, useState } from 'react';
import axios from "axios";
import { navigate, Link } from "raviger";
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

  const { setShowSystemError } = useContext(SystemErrorContext);

  // Determine if we're in the vet exam workflow.
  var is_workflow = window.location.pathname.includes("workflow");

  const [data, setData] = useState({
    diagnosis: [],
    diagnosis_notes: '',
    diagnosis_other: '',
    animal_object: {id:''}
  })

  const [diagnosisChoices, setDiagnosisChoices] = useState([]);

  useEffect(() => {
    let unmounted = false;
    let source = axios.CancelToken.source();
    if (props.id) {
      const fetchMedRecord = async () => {
        // Fetch MedRecord data.
        await axios.get('/vet/api/medrecord/' + props.id + '/', {
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
      fetchMedRecord();
    };

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

    fetchDiagnoses();

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
        diagnosis: Yup.array().min(1, 'At least 1 diagnosis must be selected.').required(),
        diagnosis_other: Yup.string().nullable().max(50, 'Maximum character limit of 50.'),
        diagnosis_notes: Yup.string().nullable().max(300, 'Maximum character limit of 300.'),
      })}
      onSubmit={(values, { setSubmitting }) => {
        // Add treatment and order data if we're in a workflow.
        if (is_workflow) {
          props.state.steps.treatments.forEach(treatment_values => {
            // Only post data if we have a treatment value.
            if (treatment_values.treatment) {
              axios.post('/vet/api/treatmentplan/', treatment_values)
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

        axios.patch('/vet/api/medrecord/' + props.id + '/', values)
        .then(response => {
          navigate('/' + props.organization + '/' + props.incident + '/vet/medrecord/' + props.id);
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
          <Patient animal={data.animal_object} organization={props.organization} incident={props.incident} />
          <Card.Body>
            <Form>
              <FormGroup>
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
