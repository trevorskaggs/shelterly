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
import { DateTimePicker, DropDown, TextInput } from '../components/Form';
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

const MedicalNoteForm = (props) => {

  const { setShowSystemError } = useContext(SystemErrorContext);

  const [data, setData] = useState({
    diagnosis: [],
    open: null,
    medical_record: props.medrecordid,
    note: '',
  });
  const [medRecordData, setMedRecordData] = useState({id:'', medical_plan:'', animal_object: {id:'', name:'', species_string:'', medical_notes:''}, vet_requests:[], exams:[]});

  useEffect(() => {
    let unmounted = false;
    let source = axios.CancelToken.source();

    const fetchMedRecord = async (id) => {
      // Fetch MedRecord data.
      await axios.get('/vet/api/medrecord/' + id + '/', {
        cancelToken: source.token,
      })
      .then(medResponse => {
        if (!unmounted) {
          setMedRecordData(medResponse.data);
        }
      })
      .catch(error => {
        setShowSystemError(true);
      });
    };

    if (props.id) {
      // Fetch note data.
      axios.get('/vet/api/medicalnote/' + props.id + '/', {
        cancelToken: source.token,
      })
      .then(response => {
        if (!unmounted) {
          setData(response.data);
          fetchMedRecord(response.data.medical_record)
        }
      })
      .catch(error => {
        setShowSystemError(true);
      });
    }
    else {
      fetchMedRecord(props.medrecordid);
    }

    // Cleanup.
    return () => {
      unmounted = true;
      source.cancel();
    };
  }, [props.medrecordid]);

  return (
    <Formik
      initialValues={data}
      enableReinitialize={true}
      validationSchema={Yup.object({
        // open: Yup.string().nullable().max(50, 'Maximum character limit of 50.'),
        note: Yup.string().nullable().max(300, 'Maximum character limit of 300.'),
      })}
      onSubmit={(values, { setSubmitting }) => {
        if (props.id) {
          axios.put('/vet/api/medicalnote/' + props.id + '/', values)
          .then(response => {
            navigate('/' + props.organization + '/' + props.incident + '/vet/medrecord/' + data.medical_record);
          })
          .catch(error => {
            setShowSystemError(true);
          });
        }
        else {
          axios.post('/vet/api/medicalnote/', values)
          .then(response => {
            navigate('/' + props.organization + '/' + props.incident + '/vet/medrecord/' + props.medrecordid);
          })
          .catch(error => {
            setShowSystemError(true);
          });
        }
        setSubmitting(false);
      }}
    >
      {formikProps => (
        <Card border="secondary" className="mt-3">
          <Card.Header as="h5" className="pl-3">
            <span style={{ cursor: 'pointer' }} onClick={() => window.history.back()} className="mr-3"><FontAwesomeIcon icon={faArrowAltCircleLeft} size="lg" inverse /></span>
            Medical Note Form
          </Card.Header>
          <Patient animal={medRecordData.animal_object} vet_request={null} organization={props.organization} incident={props.incident} medical_plan={medRecordData.medical_plan} />
          <Card.Body>
            <Form>
              <FormGroup>
                <BootstrapForm.Row className="pl-0">
                  <DateTimePicker
                    label="Day"
                    name="open"
                    id="open"
                    xs="4"
                    onChange={(date, dateStr) => {
                      formikProps.setFieldValue("open", dateStr.split(" ")[0])
                    }}
                    value={formikProps.values.open||new Date()}
                    data-enable-time={false}
                    disabled={false}
                    clearable={false}
                  />
                </BootstrapForm.Row>
                <BootstrapForm.Row className="mb-3 mt-3">
                  <TextInput
                    as="textarea"
                    label="Note"
                    name="note"
                    id="note"
                    xs="12"
                    rows={4}
                  />
                </BootstrapForm.Row>
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

export default MedicalNoteForm;
