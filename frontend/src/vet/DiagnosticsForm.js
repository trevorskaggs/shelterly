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

const DiagnosticsForm = (props) => {

  const { setShowSystemError } = useContext(SystemErrorContext);

  const [data, setData] = useState({
    patient: props.animalid,
    assignee: null,
    concern: '',
    diagnosis: '',
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
        diagnosis: Yup.string(),
      })}
      onSubmit={(values, { setSubmitting }) => {
        axios.patch('/vet/api/vetrequest/' + props.id + '/', values)
        .then(response => {
          navigate('/' + props.organization + '/' + props.incident + '/vet/vetrequest/' + props.id)
        })
        .catch(error => {
          setShowSystemError(true);
        });
        setSubmitting(false);
      }}
    >
      {formikProps => (
        <Card border="secondary" className="mt-5">
          <Card.Header as="h5" className="pl-3"><span style={{ cursor: 'pointer' }} onClick={() => window.history.back()} className="mr-3"><FontAwesomeIcon icon={faArrowAltCircleLeft} size="lg" inverse /></span>{!props.id ? "" : "Update "}Veterinary Request Form</Card.Header>
          <Card.Body>
            <Form>
              <FormGroup>
                <Row className="mt-3">
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
                {diagnosisChoices.length && formikProps.values.diagnosis.includes(diagnosisChoices.filter(option => option.label === 'OPEN')[0].value) ?
                <Row className="mt-3">
                  <TextInput
                    type="text"
                    label="Other Diagnosis"
                    name="diagnosis_other"
                    id="diagnosis_other"
                    xs="6"
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

export default DiagnosticsForm;
