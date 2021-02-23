import React, { useEffect, useState } from 'react';
import axios from "axios";
import { navigate } from 'raviger';
import { Formik } from 'formik';
import { Form as BootstrapForm, Button, ButtonGroup, Card, Col, Modal } from "react-bootstrap";
import { AddressLookup, TextInput, DropDown } from '../components/Form';
import * as Yup from 'yup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowAltCircleLeft } from '@fortawesome/free-solid-svg-icons';
import { STATE_OPTIONS } from "../constants";

// Regex validators.
const nameRegex = /^[a-z0-9 ,.'-]+$/i;

const ShelterForm = ({id}) => {

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
    latitude: null,
    longitude: null,
  });

  // Regex validators.
  const phoneRegex = /^((\+\d{1,3}(-| )?\(?\d\)?(-| )?\d{1,3})|(\(?\d{2,3}\)?))(-| )?(\d{3,4})(-| )?(\d{4})(( x| ext)\d{1,5}){0,1}$/;

  // Track duplicate shelter name error.
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);

  // Hook for initializing data.
  useEffect(() => {
    let source = axios.CancelToken.source();
    // determines if edit or new
    if (id) {
      const fetchShelterData = async () => {
        // Fetch ServiceRequest data.
        await axios.get('/shelter/api/shelter/' + id + '/', {
          cancelToken: source.token,
        })
        .then(response => {
          // Set phone field to be the pretty version.
          response.data['phone'] = response.data['display_phone']
          setData(response.data);
        })
        .catch(error => {
          console.log(error.response);
        });
      };
      fetchShelterData();
    }
    // Cleanup.
    return () => {
      source.cancel();
    };
  }, [id]);

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
          latitude: Yup.number()
            .nullable(),
          longitude: Yup.number()
            .nullable(),
        })}
        onSubmit={(values, { setSubmitting }) => {
          if (id) {
            axios.put('/shelter/api/shelter/' + id + '/', values)
            .then(function() {
              navigate('/shelter/' + id)
            })
            .catch(error => {
              console.log(error.response);
              if (error.response.data && error.response.data.name[0].includes('shelter with this name already exists')) {
                setShow(true);
              }
            });
          }
          else {
            axios.post('/shelter/api/shelter/', values)
            .then(response => {
              navigate('/shelter/' + response.data.id)
            })
            .catch(error => {
              console.log(error.response);
              if (error.response.data && error.response.data.name[0].includes('shelter with this name already exists')) {
                setShow(true);
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
                <BootstrapForm.Row>
                  <BootstrapForm.Group as={Col} xs="12">
                    <AddressLookup
                      label="Search"
                      className="form-control"
                    />
                  </BootstrapForm.Group>
                </BootstrapForm.Row>
                <BootstrapForm.Row xs="12">
                  <TextInput
                    xs="12"
                    type="text"
                    label="Address*"
                    name="address"
                    disabled
                  />
                </BootstrapForm.Row>
                <BootstrapForm.Row>
                  <TextInput
                    xs="8"
                    type="text"
                    label="City"
                    name="city"
                    disabled
                  />
                  <Col xs="2">
                    <DropDown
                      label="State"
                      name="state"
                      id="state"
                      options={STATE_OPTIONS}
                      value={props.values.state || ''}
                      placeholder=""
                      disabled
                    />
                  </Col>
                  <TextInput
                    xs="2"
                    type="text"
                    label="Zip Code"
                    name="zip_code"
                    disabled
                  />
                </BootstrapForm.Row>
              </BootstrapForm>
            </Card.Body>
            <ButtonGroup size="lg">
              <Button type="submit" onClick={() => { props.submitForm()}}>Save</Button>
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
