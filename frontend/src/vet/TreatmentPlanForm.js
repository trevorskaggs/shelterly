import React, { useContext, useEffect, useState } from 'react';
import axios from "axios";
import { navigate, useQueryParams } from "raviger";
import { Form, Formik, } from 'formik';
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
    category: '',
    treatment: null,
    frequency: '',
    quantity: '',
    unit: '',
    route: '',
    treatment_object: {category:''}
  })

  const [treatmentChoices, setTreatmentChoices] = useState([]);
  const [category, setCategory] = useState([]);
  const [categoryChoices, setCategoryChoices] = useState([]);

  useEffect(() => {
    let unmounted = false;
    let source = axios.CancelToken.source();

    const fetchTreatments = async () => {
      // Fetch Visit Note data.
      await axios.get('/vet/api/treatment/', {
        cancelToken: source.token,
      })
      .then(response => {
        if (!unmounted) {
          let category_options = [];
          let treatment_options = [];
          response.data.forEach(function(treatment) {
            treatment_options.push({value: treatment.id, label: treatment.description, category:treatment.category});
            if (!category_options.map(category_option => category_option.value).includes(treatment.category)) {
              category_options.push({value: treatment.category, label: treatment.category});
            }
          });
          setTreatmentChoices(treatment_options);
          setCategoryChoices(category_options);
        }
      })
      .catch(error => {
        setShowSystemError(true);
      });
    };
    fetchTreatments();

    if (props.id) {
      const fetchTreatmentPlan = async () => {
        // Fetch Visit Note data.
        await axios.get('/vet/api/treatmentplan/' + props.id + '/', {
          cancelToken: source.token,
        })
        .then(response => {
          if (!unmounted) {
            response.data['category'] = response.data.treatment_object.category
            response.data['treatment'] = response.data.treatment_object.id
            setData(response.data);
          }
        })
        .catch(error => {
          setShowSystemError(true);
        });
      };
      fetchTreatmentPlan();
    };

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
        treatment: Yup.string().required('Required'),
        frequency: Yup.number().required('Required'),
        start: Yup.string().required('Required'),
        end: Yup.string().required('Required'),
        quantity: Yup.number().required('Required'),
        unit: Yup.string().required('Required'),
        route: Yup.string().required('Required'),
      })}
      onSubmit={(values, { setSubmitting }) => {
        if (props.id) {
          axios.put('/vet/api/treatmentplan/' + props.id + '/', values)
          .then(response => {
            navigate('/' + props.incident + '/vet/treatmentplan/' + props.id)
          })
          .catch(error => {
            setShowSystemError(true);
          });
          setSubmitting(false);
        }
        else {
          axios.post('/vet/api/treatmentplan/', values)
          .then(response => {
            navigate('/' + props.incident + '/vet/treatmentplan/' + response.data.id)
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
          <Card.Header as="h5" className="pl-3"><span style={{ cursor: 'pointer' }} onClick={() => window.history.back()} className="mr-3"><FontAwesomeIcon icon={faArrowAltCircleLeft} size="lg" inverse /></span>{!props.id ? "" : "Update "}Treatment Plan Form</Card.Header>
          <Card.Body>
            <Form>
              <FormGroup>
                <Row>
                <Col xs={"4"}>
                    <DropDown
                      label="Category"
                      id="categoryDropdown"
                      name="category"
                      type="text"
                      options={categoryChoices}
                      value={formikProps.values.category||data.category}
                      key={`my_unique_category_select_key__${data.category}`}
                      isClearable={false}
                      onChange={(instance) => {
                        formikProps.setFieldValue("category", instance === null ? '' : instance.value);
                        formikProps.setFieldValue("treatment", '');
                      }}
                    />
                  </Col>
                  <Col xs={"6"}>
                    <DropDown
                      label="Treatment"
                      id="treatmentDropdown"
                      name="treatment"
                      type="text"
                      key={`my_unique_treatment_select_key__${formikProps.values.category}`}
                      options={treatmentChoices.filter(option => option.category === formikProps.values.category)}
                      value={formikProps.values.treatment||data.treatment}
                      isClearable={false}
                      onChange={(instance) => {
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
                    label="Frequency (in hours)"
                  />
                  <DateTimePicker
                    label="Start"
                    name="start"
                    id="start"
                    xs="4"
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
                    xs="4"
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
                  <Col xs={"4"}>
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
                  <Col xs={"4"}>
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
