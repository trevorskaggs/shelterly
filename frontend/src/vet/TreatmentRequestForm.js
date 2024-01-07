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
import { Checkbox, DateTimePicker, DropDown } from '../components/Form';
import { SystemErrorContext } from '../components/SystemError';
import { AuthContext } from "../accounts/AccountsReducer";
import Patient from './components/Patient';

const TreatmetRequestForm = (props) => {

  const { setShowSystemError } = useContext(SystemErrorContext);
  const { dispatch, state } = useContext(AuthContext);

  const [data, setData] = useState({
    treatment_plan: null,
    suggested_admin_time: '',
    actual_admin_time: new Date(),
    assignee: null,
    not_administered: false,
    treatment_plan_object:{animal_object:{name:''}},
  })

  const [assigneeChoices, setAssigneeChoices] = useState([]);

  useEffect(() => {
    let unmounted = false;
    let source = axios.CancelToken.source();

    const fetchTreatmentRequest = async () => {
      // Fetch TreatmentRequest data.
      await axios.get('/vet/api/treatmentrequest/' + props.id + '/', {
        cancelToken: source.token,
      })
      .then(response => {
        if (!unmounted) {
          response.data['actual_admin_time'] = response.data['actual_admin_time'] || new Date()
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
      })}
      onSubmit={(values, { setSubmitting }) => {
        if (props.id) {
          axios.put('/vet/api/treatmentrequest/' + props.id + '/', values)
          .then(response => {
            navigate('/' + props.organization + '/' + props.incident + '/vet/treatment/' + response.data.treatment_plan)
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
          <Card.Header as="h5" className="pl-3"><span style={{ cursor: 'pointer' }} onClick={() => navigate('/' + props.organization + "/" + props.incident + "/vet/treatment/" + data.treatment_plan)} className="mr-3"><FontAwesomeIcon icon={faArrowAltCircleLeft} size="lg" inverse /></span>Treatment Request Form</Card.Header>
          <Patient animal={data.treatment_plan_object.animal_object} organization={props.organization} incident={props.incident} />
          <Card.Body>
            <Form>
              <FormGroup>
                <Row>
                  <Col xs={"6"}>
                    <DropDown
                      label="Administered"
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
                </Row>
                <Row className="mt-3 pl-0">
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
                </Row>
                <Row className="mt-3">
                  <DateTimePicker
                    label="Actual Admin Time"
                    name="actual_admin_time"
                    id="actual_admin_time"
                    xs="4"
                    clearable={false}
                    onChange={(date, dateStr) => {
                      formikProps.setFieldValue("actual_admin_time", dateStr)
                    }}
                    value={formikProps.values.actual_admin_time||null}
                    disabled={formikProps.values.not_administered}
                  />
                </Row>
                <BootstrapForm.Label className="mt-3">Not Administered</BootstrapForm.Label>
                <Row className="mb-0 ml-0">
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

export default TreatmetRequestForm;
