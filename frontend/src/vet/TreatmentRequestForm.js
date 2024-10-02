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
  Form as BootstrapForm,
  Row,
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowAltCircleLeft,
} from '@fortawesome/free-solid-svg-icons';
import * as Yup from 'yup';
import { Checkbox, DateTimePicker, DropDown, TextInput } from '../components/Form';
import { SystemErrorContext } from '../components/SystemError';
import { AuthContext } from "../accounts/AccountsReducer";
import Patient from './components/Patient';

const TreatmetRequestForm = (props) => {

  const { setShowSystemError } = useContext(SystemErrorContext);
  const { dispatch, state } = useContext(AuthContext);

  const [data, setData] = useState({
    medical_record: null,
    suggested_admin_time: '',
    actual_admin_time: '',
    assignee: null,
    not_administered: false,
    notes: '',
    animal_object:{id:'', name:''},
    treatment_object:{description:''},
    exams:[]
  })

  const [assigneeChoices, setAssigneeChoices] = useState([]);
  const [treatmentChoices, setTreatmentChoices] = useState([]);

  useEffect(() => {
    let unmounted = false;
    let source = axios.CancelToken.source();

    const fetchTreatments = async () => {
      // Fetch Treatment data.
      await axios.get('/vet/api/treatment/', {
        cancelToken: source.token,
      })
      .then(response => {
        if (!unmounted) {
          let treatment_options = [];
          response.data.forEach(function(treatment) {
            treatment_options.push({value: treatment.id, label: treatment.description, category:treatment.category, unit:treatment.unit, routes:treatment.routes});
          });
          setTreatmentChoices(treatment_options);
        }
      })
      .catch(error => {
        setShowSystemError(true);
      });
    };
    fetchTreatments();

    const fetchTreatmentRequest = async () => {
      // Fetch TreatmentRequest data.
      await axios.get('/vet/api/treatmentrequest/' + props.id + '/?incident=' + props.incident, {
        cancelToken: source.token,
      })
      .then(response => {
        if (!unmounted) {
          response.data['exams'] = [];
          response.data['actual_admin_time'] = response.data.not_administered ? null : response.data['actual_admin_time'] || null
          setData(response.data);
        }
      })
      .catch(error => {
        setShowSystemError(true);
      });
    };
    fetchTreatmentRequest();

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
        suggested_admin_time: Yup.string().required('Required'),
        actual_admin_time: Yup.string().nullable(),
        notes: Yup.string().nullable(),
        quantity: Yup.number().positive('Must be positive').required('Required'),
        route: Yup.string().nullable(),
      })}
      onSubmit={(values, { setSubmitting }) => {
        if (props.id) {
          if (!values.actual_admin_time) {
            values['actual_admin_time'] = null;
          }
          axios.put('/vet/api/treatmentrequest/' + props.id + '/', values)
          .then(response => {
            navigate('/' + props.organization + '/' + props.incident + '/vet/treatment/' + data.treatment_plan)
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
              <span style={{ cursor: 'pointer' }} onClick={() => navigate(state.prevLocation + '?tab=treatments')} className="mr-3"><FontAwesomeIcon icon={faArrowAltCircleLeft} size="lg" inverse /></span>
            :
              <span style={{ cursor: 'pointer' }} onClick={() => navigate('/' + props.organization + "/" + props.incident + "/vet/treatment/" + data.treatment_plan)} className="mr-3"><FontAwesomeIcon icon={faArrowAltCircleLeft} size="lg" inverse /></span>
            }
            Treatment Form - {data.treatment_object.description}
          </Card.Header>
          <Patient animal={data.animal_object} organization={props.organization} incident={props.incident} medical_plan={props.state && props.state.steps.exam.medical_plan || data.exams.filter(exam => (exam.medical_plan)).length ? data.exams.filter(exam => (exam.medical_plan))[0].medical_plan : ''} />
          <Card.Body>
            <Form>
              <FormGroup>
                <BootstrapForm.Row>
                  <TextInput
                    id="quantity"
                    name="quantity"
                    type="text"
                    xs="2"
                    label="Quantity"
                  />
                  {/* <Col xs={"1"}>
                    <DropDown
                      label="Unit"
                      id="unitDropdown"
                      name="unit"
                      type="text"
                      key={`my_unique_unit_select_key__${formikProps.values.unit}`}
                      options={treatmentChoices.length > 0 && formikProps.values.treatment ? treatmentChoices.filter(choice => choice.value === formikProps.values.treatment).map(choice => ({'value':choice.unit, 'label':choice.unit})) : [{'value':'', 'label':''}]}
                      value={formikProps.values.unit||data.unit}//||treatmentChoices.filter(choice => choice.value === formikProps.values.treatment)[0].unit}
                      isClearable={false}
                      onChange={(instance) => {
                        formikProps.setFieldValue("unit", instance === null ? '' : instance.value);
                      }}
                      placeholder=""
                      disabled={true}
                    />
                  </Col> */}
                  <Col xs={"2"}>
                    <DropDown
                      label="Route"
                      id="routeDropdown"
                      name="route"
                      type="text"
                      key={`my_unique_route_select_key__${formikProps.values.route}`}
                      options={treatmentChoices.length > 0 && formikProps.values.treatment && treatmentChoices.filter(choice => Number(choice.value) === Number(formikProps.values.treatment))[0].routes.length > 0 ? treatmentChoices.filter(choice => Number(choice.value) === Number(formikProps.values.treatment))[0].routes.map(route => ({'value':route, 'label':route})) : [{'value':'', 'label':''}]}
                      value={formikProps.values.route||data.route}
                      isClearable={false}
                      onChange={(instance) => {
                        formikProps.setFieldValue("route", instance === null ? '' : instance.value);
                      }}
                    />
                  </Col>
                </BootstrapForm.Row>
                <BootstrapForm.Row>
                  <Col xs={"6"}>
                    <DropDown
                      label="Administrator"
                      id="assigneeDropdown"
                      name="assignee"
                      type="text"
                      key={`my_unique_assignee_select_key__${formikProps.values.assignee}`}
                      options={assigneeChoices}
                      isClearable={true}
                      onChange={(instance) => {
                        formikProps.setFieldValue("assignee", instance === null ? '' : instance.value);
                      }}
                      disabled={formikProps.values.not_administered}
                    />
                  </Col>
                </BootstrapForm.Row>
                <BootstrapForm.Row className="mt-3 pl-0">
                  <DateTimePicker
                    label="Suggested Admin Time"
                    name="suggested_admin_time"
                    id="suggested_admin_time"
                    xs="4"
                    onChange={(date, dateStr) => {
                      formikProps.setFieldValue("suggested_admin_time", dateStr)
                    }}
                    value={formikProps.values.suggested_admin_time||null}
                    disabled={true}
                  />
                </BootstrapForm.Row>
                <BootstrapForm.Row className="mt-3">
                  <DateTimePicker
                    label="Actual Admin Time"
                    name="actual_admin_time"
                    id="actual_admin_time"
                    xs="4"
                    clearable={true}
                    now={true}
                    onChange={(date, dateStr) => {
                      formikProps.setFieldValue("actual_admin_time", dateStr)
                    }}
                    value={formikProps.values.actual_admin_time||null}
                    disabled={formikProps.values.not_administered}
                    setFieldValue={formikProps.setFieldValue}
                  />
                </BootstrapForm.Row>
                <BootstrapForm.Row className="mt-3" style={{marginBottom:"-15px"}}>
                  <TextInput
                    as="textarea"
                    label="Notes"
                    name="notes"
                    id="notes"
                    xs="8"
                    rows={4}
                    value={formikProps.values.notes || ''}
                  />
                </BootstrapForm.Row>
                <BootstrapForm.Label className="mt-3">Not Administered</BootstrapForm.Label>
                <BootstrapForm.Row className="mb-0 ml-0">
                  <Checkbox
                    id="not_administered"
                    name={"not_administered"}
                    checked={formikProps.values.not_administered || false}
                    onChange={() => {
                      formikProps.setFieldValue("not_administered", !formikProps.values.not_administered);
                      formikProps.setFieldValue("assignee", null);
                      formikProps.setFieldValue("actual_admin_time", null);
                    }}
                    style={{
                      transform:"scale(2.0)",
                      marginLeft:"-3px",
                      marginBottom:"-5px",
                      marginTop:"0px"
                    }}
                  />
                </BootstrapForm.Row>
              </FormGroup>
            </Form>
          </Card.Body>
          <ButtonGroup>
            <Button type="button" className="btn btn-primary" onClick={() => { formikProps.submitForm() }}>{formikProps.values.assignee ? "Complete" : "Save"}</Button>
          </ButtonGroup>
        </Card>
      )}
    </Formik>
  );
};

export default TreatmetRequestForm;
