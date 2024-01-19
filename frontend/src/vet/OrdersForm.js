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

const OrdersForm = (props) => {

  // Identify any query param data.
  const [queryParams] = useQueryParams();
  const {
    vetrequest_id = null,
  } = queryParams;

  const { setShowSystemError } = useContext(SystemErrorContext);

  // Determine if we're in the vet exam workflow.
  var is_workflow = window.location.pathname.includes("workflow");
  var is_diagnostics = window.location.pathname.includes("diagnostics");
  var is_procedures = window.location.pathname.includes("procedures");

  const initialData = {
    is_workflow: is_workflow,
    is_diagnostics: is_diagnostics,
    is_procedures: is_procedures,
    diagnostics: [],
    // diagnostics_notes: '',
    diagnostics_other: '',
    procedures: [],
    // procedure_notes: '',
    procedure_other: '',
    animal_object: {id:''},
    vet_requests: [],
  }
  let current_data = initialData;
  if (is_workflow) {
    current_data = props.state.steps.orders;
    current_data['is_workflow'] = is_workflow;
    current_data['is_diagnostics'] = is_diagnostics;
    current_data['is_procedures'] = is_procedures;
  }

  // Initial data.
  const [data, setData] = useState(current_data);

  const [diagnosticChoices, setDiagnosticChoices] = useState([]);
  const [procedureChoices, setProcedureChoices] = useState([]);

  useEffect(() => {
    let unmounted = false;
    let source = axios.CancelToken.source();
    if (props.id) {
      if (is_workflow) {
        let medRecord = {...props.state.medRecord}
        medRecord['diagnostics'] = [];
        medRecord['diagnostics_other'] = '';
        medRecord['procedures'] = [];
        medRecord['procedure_other'] = '';
        medRecord['is_workflow'] = is_workflow;
        medRecord['is_diagnostics'] = is_diagnostics;
        medRecord['is_procedures'] = is_procedures;
        setData(medRecord);
      }
      else {
        const fetchMedRecord = async () => {
          // Fetch MedRecord data.
          await axios.get('/vet/api/medrecord/' + props.id + '/', {
            cancelToken: source.token,
          })
          .then(response => {
            if (!unmounted) {
              response.data['diagnostics'] = [];
              response.data['diagnostics_other'] = '';
              response.data['procedures'] = [];
              response.data['procedure_other'] = '';
              response.data['is_workflow'] = is_workflow;
              response.data['is_diagnostics'] = is_diagnostics;
              response.data['is_procedures'] = is_procedures;
              setData(response.data);
            }
          })
          .catch(error => {
            setShowSystemError(true);
          });
        };
        fetchMedRecord();
      }
    };

    const fetchDiagnostics = async () => {
      // Fetch diagnostic data.
      await axios.get('/vet/api/diagnostics/', {
        cancelToken: source.token,
      })
      .then(response => {
        if (!unmounted) {
          let options = [];
          response.data.forEach(function(diagnostic) {
            options.push({value: diagnostic.id, label: diagnostic.name})
          });
          setDiagnosticChoices(options);
        }
      })
      .catch(error => {
        setShowSystemError(true);
      });
    };

    fetchDiagnostics();

    const fetchProcedures = async () => {
      // Fetch procedure data.
      await axios.get('/vet/api/procedures/', {
        cancelToken: source.token,
      })
      .then(response => {
        if (!unmounted) {
          let options = [];
          response.data.forEach(function(procedure) {
            options.push({value: procedure.id, label: procedure.name})
          });
          setProcedureChoices(options);
        }
      })
      .catch(error => {
        setShowSystemError(true);
      });
    };

    fetchProcedures();

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
        is_workflow: Yup.boolean(),
        is_diagnostics: Yup.boolean(),
        is_procedures: Yup.boolean(),
        diagnostics: Yup.array().when(['is_workflow', 'is_diagnostics'], {
          is: (is_workflow, is_diagnostics) => is_workflow === false && is_diagnostics,
          then: Yup.array().min(1, 'Required')}),
        diagnostics_other: Yup.string().nullable().max(50, 'Maximum character limit of 50.')
        .when('diagnostics', {
          is: (val) => val.includes(diagnosticChoices.filter(choice => choice.label === 'Other')[0].value),
          then: () => Yup.string().max(50, 'Maximum character limit of 50.').required('Required.'),
          otherwise: () => Yup.string().nullable().max(50, 'Maximum character limit of 50.'),
        }),
        // diagnostics_notes: Yup.string().nullable().max(300, 'Maximum character limit of 300.'),
        procedures: Yup.array().when(['is_workflow','is_procedures'], {
          is: (is_workflow, is_procedures) => is_workflow === false && is_procedures,
          then: Yup.array().min(1, 'Required')}),
        procedure_other: Yup.string().nullable().max(50, 'Maximum character limit of 50.')
        .when('procedures', {
          is: (val) => val.includes(procedureChoices.filter(choice => choice.label === 'Other')[0].value),
          then: () => Yup.string().max(50, 'Maximum character limit of 50.').required('Required.'),
          otherwise: () => Yup.string().nullable().max(50, 'Maximum character limit of 50.'),
        }),
        // procedure_notes: Yup.string().nullable().max(300, 'Maximum character limit of 300.'),
      })}
      onSubmit={(values, { setSubmitting }) => {
        if (is_workflow) {
          props.onSubmit('orders', values, 'treatments');
        }
        else {
          axios.patch('/vet/api/medrecord/' + props.id + '/', values)
          .then(response => {
            navigate('/' + props.organization + '/' + props.incident + '/vet/medrecord/' + props.id);
          })
          .catch(error => {
            setShowSystemError(true);
          });
          setSubmitting(false);
        }
      }}
    >
      {formikProps => (
        <Card border="secondary" className="mt-3">
          <Card.Header as="h5" className="pl-3">
            {is_workflow ?
            <span style={{cursor:'pointer'}} onClick={() => {props.handleBack('orders', 'exam')}} className="mr-3"><FontAwesomeIcon icon={faArrowAltCircleLeft} size="lg" inverse /></span>
            :
            <span style={{ cursor: 'pointer' }} onClick={() => navigate('/' + props.organization + '/' + props.incident + '/vet/medrecord/' + props.id + '/')} className="mr-3"><FontAwesomeIcon icon={faArrowAltCircleLeft} size="lg" inverse /></span>}
            {is_diagnostics ? "Diagnostic " : is_procedures ? "Procedure " : "Diagnostic and Procedure "}Orders Form
          </Card.Header>
          <Patient animal={data.animal_object} vet_request={vetrequest_id && data.vet_requests.length > 0 ? data.vet_requests.filter(vr => vr.id === Number(vetrequest_id))[0] : null} organization={props.organization} incident={props.incident} />
          <Card.Body>
            <Form>
              <FormGroup>
                {is_workflow || is_diagnostics ?
                <Row className="mb-3">
                  <Col xs={"6"}>
                    <label>Diagnostic Orders</label>
                    <Select
                      id="diagnosticsDropdown"
                      name="diagnostics"
                      type="text"
                      styles={customStyles}
                      isMulti
                      options={diagnosticChoices}
                      value={diagnosticChoices.filter(choice => formikProps.values.diagnostics.includes(choice.value))}
                      isClearable={false}
                      onChange={(instance) => {
                        let values = [];
                        instance && instance.forEach(option => {
                          values.push(option.value);
                        })
                        formikProps.setFieldValue("diagnostics", instance === null ? [] : values);
                      }}
                    />
                    {formikProps.errors['diagnostics'] ? <div style={{ color: "#e74c3c", marginTop: ".5rem", fontSize: "80%" }}>{formikProps.errors['diagnostics']}</div> : ""}
                  </Col>
                </Row>
                : ""}
                {diagnosticChoices.length && formikProps.values.diagnostics.includes(diagnosticChoices.filter(option => option.label === 'Other')[0].value) ?
                <Row>
                  <TextInput
                    type="text"
                    label="Other Diagnostic"
                    name="diagnostics_other"
                    id="diagnostics_other"
                    xs="6"
                  />
                </Row>
                : ""}
                {is_workflow || is_procedures ?
                <Row className="mb-3">
                  <Col xs={"6"}>
                    <label>Procedure Orders</label>
                    <Select
                      label="Procedures"
                      id="proceduresDropdown"
                      name="procedures"
                      type="text"
                      styles={customStyles}
                      isMulti
                      options={procedureChoices}
                      value={procedureChoices.filter(choice => formikProps.values.procedures.includes(choice.value))}
                      isClearable={false}
                      onChange={(instance) => {
                        let values = [];
                        instance && instance.forEach(option => {
                          values.push(option.value);
                        })
                        formikProps.setFieldValue("procedures", instance === null ? [] : values);
                      }}
                    />
                    {formikProps.errors['procedures'] ? <div style={{ color: "#e74c3c", marginTop: ".5rem", fontSize: "80%" }}>{formikProps.errors['procedures']}</div> : ""}
                  </Col>
                </Row>
                : ""}
                {procedureChoices.length && formikProps.values.procedures.includes(procedureChoices.filter(option => option.label === 'Other')[0].value) ?
                <Row>
                  <TextInput
                    type="text"
                    label="Other Procedure"
                    name="procedure_other"
                    id="procedure_other"
                    xs="6"
                  />
                </Row>
                : ""}
                {/* <Row style={{marginBottom:"-15px"}}>
                  <TextInput
                    as="textarea"
                    label="Diagnostic Notes"
                    name="diagnostics_notes"
                    id="diagnostics_notes"
                    xs="6"
                    rows={3}
                  />
                </Row> */}
                {/* <Row style={{marginBottom:"-15px"}}>
                  <TextInput
                    as="textarea"
                    label="Procedure Notes"
                    name="procedure_notes"
                    id="procedure_notes"
                    xs="6"
                    rows={3}
                  />
                </Row> */}
              </FormGroup>
            </Form>
          </Card.Body>
          <ButtonGroup>
            <Button type="button" className="btn btn-primary" onClick={() => { is_workflow && formikProps.values.diagnostics.length === 0 ? props.onSubmit('diagnostics', formikProps.values, 'treatments') : formikProps.submitForm();}}>{is_workflow ? "Next Step" : "Save"}</Button>
          </ButtonGroup>
        </Card>
      )}
    </Formik>
  );
};

export default OrdersForm;
