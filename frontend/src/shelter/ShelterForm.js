import React, { useContext, useEffect, useState } from 'react';
import axios from "axios";
import { navigate } from 'raviger';
import { Field, Formik } from 'formik';
import { Form as BootstrapForm, Button, ButtonGroup, Card, Modal } from "react-bootstrap";
import { Switch } from 'formik-material-ui';
import { AddressSearch, TextInput } from '../components/Form';
import * as Yup from 'yup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowAltCircleLeft } from '@fortawesome/free-solid-svg-icons';
import ButtonSpinner from '../components/ButtonSpinner';
import { SystemErrorContext } from '../components/SystemError';

// Regex validators.
const nameRegex = /^[a-z0-9 ,.'-]+$/i;

const ShelterForm = ({ id, incident }) => {

  const { setShowSystemError } = useContext(SystemErrorContext);

  // Initial shelter data.
  const [data, setData] = useState({
    name: '',
    description: '',
    phone: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    zip_code: '',
    public: false,
    latitude: null,
    longitude: null,
    incident_slug: incident,
  });

  // Regex validators.
  const phoneRegex = /^((\+\d{1,3}(-| )?\(?\d\)?(-| )?\d{1,3})|(\(?\d{2,3}\)?))(-| )?(\d{3,4})(-| )?(\d{4})(( x| ext)\d{1,5}){0,1}$/;

  // Track duplicate shelter name error.
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);

  const [shelterIncident, setShelterIncident] = useState(null);

  // Hook for initializing data.
  useEffect(() => {
    let unmounted = false;
    let source = axios.CancelToken.source();

    if (id) {
      const fetchShelterData = async () => {
        // Fetch ServiceRequest data.
        await axios.get('/shelter/api/shelter/' + id + '/?incident=' + incident, {
          cancelToken: source.token,
        })
        .then(response => {
          if (!unmounted) {
            // Set phone field to be the pretty version.
            response.data['phone'] = response.data['display_phone']
            setData(response.data);
            axios.get('/incident/api/incident/' + response.data.incident + '/', {
              cancelToken: source.token,
            })
            .then(incidentResponse => {
              setShelterIncident(incidentResponse.data.slug)
            })
            .catch(error => {
              setShowSystemError(true);
            });
          }
        })
        .catch(error => {
          if (!unmounted) {
            setShowSystemError(true);
          }
        });
      };
      fetchShelterData();
    }
    // Cleanup.
    return () => {
      unmounted = true;
      source.cancel();
    };
  }, [id, incident]);

  return (
    <>
      <Formik
        initialValues={data}
        enableReinitialize={true}
        validationSchema={Yup.object({
          name: Yup.string()
            .max(50, 'Must be 50 characters or less')
            .matches(nameRegex, "Name is not valid")
            .required('Required'),
          description: Yup.string()
            .max(400, 'Must be 400 characters or less'),
          phone: Yup.string()
            .matches(phoneRegex, "Phone number is not valid"),
          address: Yup.string()
            .required('Required'),
          apartment: Yup.string()
            .max(10, 'Must be 10 characters or less'),
          city: Yup.string(),
          state: Yup.string(),
          zip_code: Yup.string()
            .max(10, 'Must be 10 characters or less'),
          public: Yup.boolean(),
          latitude: Yup.number()
            .nullable(),
          longitude: Yup.number()
            .nullable(),
        })}
        onSubmit={(values, { setSubmitting }) => {
          if (id) {
            axios.put('/shelter/api/shelter/' + id + '/?incident=' + incident, values)
            .then(function() {
              navigate("/" + incident + '/shelter/' + id)
            })
            .catch(error => {
              if (error.response.data && error.response.data.name && error.response.data.name[0].includes('shelter with this name already exists')) {
                setShow(true);
              }
              else {
                setShowSystemError(true);
              }
            });
          }
          else {
            axios.post('/shelter/api/shelter/', values)
            .then(response => {
              navigate("/" + incident + '/shelter/' + response.data.id)
            })
            .catch(error => {
              if (error.response.data && error.response.data.name && error.response.data.name[0].includes('shelter with this name already exists')) {
                setShow(true);
              }
              else {
                setShowSystemError(true);
              }
            });
            setSubmitting(false);
          }
        }}
      >
        {props => (
          <>
          <Card border="secondary" className="mt-5">
            <Card.Header as="h5" className="pl-3"><span style={{cursor:'pointer'}} onClick={() => window.history.back()} className="mr-3"><FontAwesomeIcon icon={faArrowAltCircleLeft} size="lg" inverse /></span>{!id ? "New" : "Update"} Shelter</Card.Header>
            <Card.Body>
              <BootstrapForm noValidate>
                <BootstrapForm.Row xs="12">
                  <TextInput
                    xs="12"
                    type="text"
                    label="Name*"
                    name="name"
                    id="name"
                  />
                </BootstrapForm.Row>
                <BootstrapForm.Row xs="12">
                  <TextInput
                    xs="12"
                    type="text"
                    label="Phone"
                    name="phone"
                  />
                </BootstrapForm.Row>
                <BootstrapForm.Row>
                  <TextInput
                    as="textarea"
                    rows={5}
                    xs="12"
                    type="text"
                    label="Description"
                    name="description"
                  />
                </BootstrapForm.Row>
                <AddressSearch formikProps={props} label="Search for Shelter Address" show_apt={false} incident={incident} error="Shelter Address was not selected." />
                <span hidden={incident !== shelterIncident}>
                  <BootstrapForm.Label htmlFor="public">Shared Shelter</BootstrapForm.Label>
                  <Field component={Switch} name="public" id="public" type="checkbox" color="primary" />
                </span>
              </BootstrapForm>
            </Card.Body>
            <ButtonGroup size="lg">
              <ButtonSpinner isSubmitting={props.isSubmitting} isSubmittingText="Saving..." type="submit" onClick={() => { props.submitForm()}}>Save</ButtonSpinner>
            </ButtonGroup>
          </Card>
          <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
              <Modal.Title>Duplicate Shelter Name Found</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>
                A shelter with the name {props.values.name} already exists. Please enter a unique name.
              </p>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleClose}>Close</Button>
            </Modal.Footer>
          </Modal>
        </>
        )}
      </Formik>
    </>
  );
};

export default ShelterForm;
