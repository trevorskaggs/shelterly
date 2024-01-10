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
import { DropDown, TextInput, DateTimePicker } from '../components/Form';
import { SystemErrorContext } from '../components/SystemError';
import Patient from './components/Patient';

const ProcedureResultForm = (props) => {

  const { setShowSystemError } = useContext(SystemErrorContext);

  const [data, setData] = useState({
    open: null,
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
        completed: Yup.string().nullable(),
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
            {data.other_name ? data.other_name : data.name} Procedure Results
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
                <Row style={{marginBottom:"-15px"}}>
                  <TextInput
                    as="textarea"
                    label="Notes"
                    name="notes"
                    id="notes"
                    xs="6"
                    rows={3}
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
