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

const DiagnosticsForm = (props) => {

  const { setShowSystemError } = useContext(SystemErrorContext);

  // Determine if we're in the vet exam workflow.
  var is_workflow = window.location.pathname.includes("workflow");

  const [data, setData] = useState({
    patient: props.animalid,
    diagnostics: [],
    diagnostics_notes: '',
    diagnostics_other: '',
    animal_object: {id:''}
  })

  const [diagnosticChoices, setDiagnosticChoices] = useState([]);

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
            response.data['diagnostics'] = [];
            response.data['diagnostics_other'] = '';
            setData(response.data);
          }
        })
        .catch(error => {
          setShowSystemError(true);
        });
      };
      fetchMedRecord();
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
        diagnostics: Yup.array(),
        diagnostics_other: Yup.string().nullable().max(50, 'Maximum character limit of 50.')
        .when('diagnostics', {
          is: (val) => val.includes(diagnosticChoices.filter(choice => choice.label === 'Other')[0].value),
          then: () => Yup.string().max(50, 'Maximum character limit of 50.').required('Required.'),
          otherwise: () => Yup.string().nullable().max(50, 'Maximum character limit of 50.'),
        }),
        diagnostics_notes: Yup.string().nullable().max(300, 'Maximum character limit of 300.'),
      })}
      onSubmit={(values, { setSubmitting }) => {
        axios.patch('/vet/api/medrecord/' + props.id + '/', values)
        .then(response => {
          if (is_workflow) {
            props.onSubmit('diagnostics', values, 'treatments');
          }
          else {
            navigate('/' + props.organization + '/' + props.incident + '/vet/medrecord/' + props.id);
          }
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
            <span style={{ cursor: 'pointer' }} onClick={() => navigate('/' + props.organization + '/' + props.incident + '/vet/medrecord/' + props.id + '/')} className="mr-3"><FontAwesomeIcon icon={faArrowAltCircleLeft} size="lg" inverse /></span>}
            Diagnostics Form
          </Card.Header>
          <Patient animal={data.animal_object} organization={props.organization} incident={props.incident} />
          <Card.Body>
            <Form>
              <FormGroup>
                <Row className="mb-3">
                  <Col xs={"6"}>
                    <label>Order Diagnostics</label>
                    <Select
                      label="Diagnostics"
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
                <Row style={{marginBottom:"-15px"}}>
                  <TextInput
                    as="textarea"
                    label="Diagnostic Notes"
                    name="diagnostics_notes"
                    id="diagnostics_notes"
                    xs="6"
                    rows={3}
                  />
                </Row>
              </FormGroup>
            </Form>
          </Card.Body>
          <ButtonGroup>
            <Button type="button" className="btn btn-primary" onClick={() => { formikProps.values.diagnostics.length > 0 ? formikProps.submitForm() : props.onSubmit('diagnostics', formikProps.values, 'treatments');}} disabled={!is_workflow && formikProps.values.diagnostics.length === 0}>{is_workflow ? "Next Step" : "Save"}</Button>
          </ButtonGroup>
        </Card>
      )}
    </Formik>
  );
};

export default DiagnosticsForm;
