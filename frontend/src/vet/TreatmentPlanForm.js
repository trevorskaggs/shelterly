import React, { useContext, useEffect, useState } from 'react';
import axios from "axios";
import { navigate, useQueryParams } from "raviger";
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
import { DateTimePicker, DropDown, TextInput } from '../components/Form';
import { SystemErrorContext } from '../components/SystemError';

const TreatmentPlanForm = (props) => {

  const { setShowSystemError } = useContext(SystemErrorContext);

  // Identify any query param data.
  const [queryParams] = useQueryParams();
  const {
    vetrequest_id = null,
  } = queryParams;

  const [data, setData] = useState({
    vet_request: vetrequest_id,
    start: '',
    end: '',
    treatment: null,
    frequency: '',
    quantity: '',
    unit: '',
    route: '',
  })

  const [treatmentChoices, setTreatmentChoices] = useState([])

  useEffect(() => {
    let unmounted = false;
    let source = axios.CancelToken.source();
    if (props.id) {
      const fetchTreatmentPlan = async () => {
        // Fetch Visit Note data.
        await axios.get('/vet/api/treatmentplan/' + props.id + '/', {
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
      fetchTreatmentPlan();
    };

    const fetchTreatments = async () => {
      // Fetch Visit Note data.
      await axios.get('/vet/api/treatment/', {
        cancelToken: source.token,
      })
      .then(response => {
        if (!unmounted) {
          let options = [];
          response.data.forEach(function(treatment) {
            options.push({value: treatment.id, label: treatment.description + ' - ' + treatment.category})
          });
          setTreatmentChoices(options);
        }
      })
      .catch(error => {
        setShowSystemError(true);
      });
    };
    fetchTreatments();

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
          axios.put('/vet/api/treatmentplan/' + props.id + '/', values)
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
          axios.post('/vet/api/treatmentplan/', values)
          .then(response => {
            navigate('/' + props.incident + '/vet/treatment/' + response.data.id)
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
          <Card.Header as="h5" className="pl-3"><span style={{ cursor: 'pointer' }} onClick={() => window.history.back()} className="mr-3"><FontAwesomeIcon icon={faArrowAltCircleLeft} size="lg" inverse /></span>{!props.id ? "" : "Update "}Treatment Form</Card.Header>
          <Card.Body>
            <Form>
              <FormGroup>
                <Row>
                  <Col xs={"8"}>
                    <DropDown
                      label="Treatment"
                      id="treatmentDropdown"
                      name="treatment"
                      type="text"
                      key={`my_unique_treatment_select_key__${formikProps.values.treatment}`}
                      options={treatmentChoices}
                      value={formikProps.values.treatment||data.treatment}
                      isClearable={true}
                      onChange={(instance) => {
                        console.log(instance.value)
                        formikProps.setFieldValue("treatment", instance === null ? '' : instance.value);
                      }}
                    />
                  </Col>
                </Row>
                <Row className="mt-3 pl-0">
                  <TextInput
                    id="frequency"
                    name="frequency"
                    type="text"
                    xs="2"
                    label="Frequency"
                  />
                  <DateTimePicker
                    label="Start"
                    name="start"
                    id="start"
                    xs="3"
                    onChange={(date, dateStr) => {
                      formikProps.setFieldValue("start", dateStr)
                    }}
                    value={formikProps.values.start||null}
                    disabled={false}
                  />
                  <DateTimePicker
                    label="End"
                    name="end"
                    id="end"
                    xs="3"
                    onChange={(date, dateStr) => {
                      formikProps.setFieldValue("end", dateStr)
                    }}
                    value={formikProps.values.end||null}
                    disabled={false}
                  />
                </Row>
                <Row>
                  <TextInput
                    id="quantity"
                    name="quantity"
                    type="text"
                    xs="2"
                    label="Quantity"
                  />
                  <Col xs={"3"}>
                    <DropDown
                      label="Unit"
                      id="unitDropdown"
                      name="unit"
                      type="text"
                      key={`my_unique_unit_select_key__${formikProps.values.unit}`}
                      options={[
                        { value: 'ml', label: 'ml' },
                        { value: 'cap', label: 'cap' },
                        { value: 'tab', label: 'tab' },
                      ]}
                      value={formikProps.values.unit||data.unit}
                      isClearable={false}
                      onChange={(instance) => {
                        formikProps.setFieldValue("unit", instance === null ? '' : instance.value);
                      }}
                    />
                  </Col>
                  <Col xs={"3"}>
                    <DropDown
                      label="Route"
                      id="routeDropdown"
                      name="route"
                      type="text"
                      key={`my_unique_route_select_key__${formikProps.values.route}`}
                      options={[
                        { value: 'IV', label: 'IV' },
                        { value: 'SQ', label: 'SQ' },
                        { value: 'PO', label: 'PO' },
                      ]}
                      value={formikProps.values.route||data.route}
                      isClearable={false}
                      onChange={(instance) => {
                        formikProps.setFieldValue("route", instance === null ? '' : instance.value);
                      }}
                    />
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

export default TreatmentPlanForm;
