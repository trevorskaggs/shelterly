import React, { useContext, useEffect, useState } from 'react';
import axios from "axios";
import { Link, navigate, useQueryParams } from "raviger";
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
  Modal,
  OverlayTrigger,
  Tooltip,
  Row,
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowAltCircleLeft,
  faTimes,
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

const MedicalPlanForm = (props) => {

  const { setShowSystemError } = useContext(SystemErrorContext);

  const [data, setData] = useState({
    medical_plan: '',
  });

  useEffect(() => {
    let unmounted = false;
    let source = axios.CancelToken.source();

    // const fetchMedRecord = async (id) => {
    //   // Fetch MedRecord data.
    //   await axios.get('/vet/api/medrecord/' + id + '/', {
    //     cancelToken: source.token,
    //   })
    //   .then(medResponse => {
    //     if (!unmounted) {
    //       setMedRecordData(medResponse.data);
    //     }
    //   })
    //   .catch(error => {
    //     setShowSystemError(true);
    //   });
    // };

    if (props.id) {
      // Fetch note data.
      axios.get('/vet/api/medrecord/' + props.id + '/', {
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
    }

    // Cleanup.
    return () => {
      unmounted = true;
      source.cancel();
    };
  }, []);

  return (
    <>
    <Formik
      initialValues={data}
      enableReinitialize={true}
      validationSchema={Yup.object({
        medical_plan: Yup.string().required('Required').max(3000, 'Maximum character limit of 3000.'),
      })}
      onSubmit={(values, { setSubmitting }) => {
        if (props.id) {
          axios.patch('/vet/api/medrecord/' + props.id + '/', values)
          .then(response => {
            navigate('/' + props.organization + '/' + props.incident + '/vet/medrecord/' + props.id);
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
            Medical Plan Form
          </Card.Header>
          {/* <Patient animal={medRecordData.animal_object} vet_request={null} organization={props.organization} incident={props.incident} medical_plan={medRecordData.medical_plan} /> */}
          <Card.Body>
            <Form>
              <FormGroup>
                <BootstrapForm.Row className="mb-3">
                  <TextInput
                    as="textarea"
                    // label="Medical Plan"
                    name="medical_plan"
                    id="medical_plan"
                    xs="12"
                    rows={12}
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
    </>
  );
};

export default MedicalPlanForm;
