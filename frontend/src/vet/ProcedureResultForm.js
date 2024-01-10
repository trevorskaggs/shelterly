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
  Form as BootstrapForm,
  FormGroup,
  ListGroup,
  Row,
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowAltCircleLeft,
} from '@fortawesome/free-solid-svg-icons';
import * as Yup from 'yup';
import { Checkbox, DropDown, TextInput, DateTimePicker } from '../components/Form';
import { SystemErrorContext } from '../components/SystemError';
import { AuthContext } from "../accounts/AccountsReducer";
import Patient from './components/Patient';

const ProcedureResultForm = (props) => {

  const { dispatch, state } = useContext(AuthContext);
  const { setShowSystemError } = useContext(SystemErrorContext);

  const [assigneeChoices, setAssigneeChoices] = useState([]);

  const [data, setData] = useState({
    open: null,
    performer: null,
    complete: null,
    name: '',
    other_name: '',
    notes: '',
    animal_object: {id:''},
    medical_record: null,
  })

  useEffect(() => {
    let unmounted = false;
    let source = axios.CancelToken.source();

    const fetchProcedureResult = async () => {
      // Fetch procedure result data.
      await axios.get('/vet/api/procedureresults/' + props.id + '/', {
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

    fetchProcedureResult();

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
        open: Yup.string(),
        performer: Yup.string().nullable(),
        complete: Yup.string().nullable(),
        other_name: Yup.string().nullable().max(50, 'Maximum character limit of 50.'),
        notes: Yup.string().nullable().max(500, 'Maximum character limit of 500.'),
      })}
      onSubmit={(values, { setSubmitting }) => {
        axios.patch('/vet/api/procedureresults/' + props.id + '/', values)
        .then(response => {
          navigate('/' + props.organization + '/' + props.incident + '/vet/medrecord/' + data.medical_record);
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
            <span style={{ cursor: 'pointer' }} onClick={() => navigate('/' + props.organization + '/' + props.incident + '/vet/medrecord/' + data.medical_record + '/')} className="mr-3"><FontAwesomeIcon icon={faArrowAltCircleLeft} size="lg" inverse /></span>
            {data.other_name ? data.other_name : data.name} Results
          </Card.Header>
          <Patient animal={data.animal_object} organization={props.organization} incident={props.incident} />
          <Card.Body>
            <Form>
              <FormGroup>
                {/* {data.other_name ?
                <Row>
                  <TextInput
                    type="text"
                    label="Other Procedure"
                    name="other_name"
                    id="other_name"
                    xs="6"
                  />
                </Row>
                : ""} */}
                <BootstrapForm.Row>
                  <Col xs={"4"}>
                    <DropDown
                      label="Performer"
                      id="performerDropdown"
                      name="performer"
                      type="text"
                      key={`my_unique_performer_select_key__${formikProps.values.performer}`}
                      options={assigneeChoices}
                      isClearable={true}
                      onChange={(instance) => {
                        formikProps.setFieldValue("performer", instance === null ? '' : instance.value);
                      }}
                    />
                  </Col>
                </BootstrapForm.Row>
                <Row className="mt-3" style={{marginBottom:"-15px"}}>
                  <TextInput
                    as="textarea"
                    label="Notes"
                    name="notes"
                    id="notes"
                    xs="8"
                    rows={4}
                    value={formikProps.values.notes || ''}
                  />
                </Row>
                <Row className="mt-3">
                  <DateTimePicker
                    label="Completed on"
                    name="complete"
                    id="complete"
                    xs="4"
                    onChange={(date, dateStr) => {
                      formikProps.setFieldValue("complete", dateStr)
                    }}
                    value={formikProps.values.complete||new Date()}
                    disabled={false}
                    clearable={true}
                  />
                </Row>
              </FormGroup>
            </Form>
          </Card.Body>
          <ButtonGroup>
            <Button type="button" className="btn btn-primary" onClick={() => { formikProps.submitForm()}}>Save</Button>
          </ButtonGroup>
        </Card>
      )}
    </Formik>
  );
};

export default ProcedureResultForm;
