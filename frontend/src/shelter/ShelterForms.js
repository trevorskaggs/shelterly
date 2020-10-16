import React, { useEffect, useState } from 'react';
import axios from "axios";
import { Link, navigate, useQueryParams } from 'raviger';
import { Formik } from 'formik';
import { Form as BootstrapForm, Button, ButtonGroup, Card, Col } from "react-bootstrap";
import { AddressLookup, TextInput, DropDown } from '.././components/Form';
import * as Yup from 'yup';

const state_options = [{value:'AL', label:"AL"},{value:'AK', label:"AK"},{value:'AZ', label:"AZ"},{value:'AR', label:"AR"},{value:'CA', label:"CA"},{value:'CO', label:"CO"},{value:'CT', label:"CT"},
{value:'DE', label:"DE"},{value:'FL', label:"FL"},{value:'GA', label:"GA"},{value:'HI', label:"HI"},{value:'ID', label:"ID"},{value:'IL', label:"IL"},{value:'IN', label:"IN"},
{value:'IA', label:"IA"},{value:'KS', label:"KS"},{value:'KY', label:"KY"},{value:'LA', label:"LA"},{value:'ME', label:"ME"},{value:'MD', label:"MD"},{value:'MA', label:"MA"},
{value:'MI', label:"MI"},{value:'MN', label:"MN"},{value:'MS', label:"MS"},{value:'MO', label:"MO"},{value:'MT', label:"MT"},{value:'NE', label:"NE"},{value:'NV', label:"NV"},
{value:'NH', label:"NH"},{value:'NJ', label:"NJ"},{value:'NM', label:"NM"},{value:'NY', label:"NY"},{value:'NC', label:"NC"},{value:'ND', label:"ND"},{value:'OH', label:"OH"},
{value:'OK', label:"OK"},{value:'PA', label:"PA"},{value:'RI', label:"RI"},{value:'SC', label:"SC"},{value:'SD', label:"SD"},{value:'TN', label:"TN"},{value:'TX', label:"TX"},
{value:'VA', label:"VA"},{value:"VT", label:"VT"},{value:'WA', label:"WA"},{value:'WV', label:"WV"},{value:'WI', label:"WI"},{value:'WY', label:"WY"},]

export const ShelterForm = ({id}) => {

  // Initial shelter data.
  const [data, setData] = useState({
    name: '',
    description: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    zip_code: '',
    latitude: null,
    longitude: null,
  });

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
        onSubmit={(values, { setSubmitting }) => {
          if (id) {
            axios.put('/shelter/api/shelter/' + id + '/', values)
            .then(function() {
              navigate('/shelter/' + id)
            })
            .catch(error => {
              console.log(error.response);
            });
          }
          else {
            axios.post('/shelter/api/shelter/', values)
            .then(function() {
              navigate('/shelter/list')
            })
            .catch(error => {
              console.log(error.response);
            });
            setSubmitting(false);
          }
        }}
      >
        {props => (
          <Card border="secondary" className="mt-5">
          <Card.Header as="h5"> Shelter Information</Card.Header>
          <Card.Body>
          <BootstrapForm noValidate>
            <BootstrapForm.Row>
              <TextInput
                xs="8"
                type="text"
                label="Name*"
                name="name"
                id="name"
              />
            </BootstrapForm.Row>
            <BootstrapForm.Row>
              <TextInput
                as="textarea"
                rows={5}
                xs="8"
                type="text"
                label="Description"
                name="description"
              />
            </BootstrapForm.Row>
            <BootstrapForm.Row>
              <BootstrapForm.Group as={Col} xs="10">
                <AddressLookup
                  label="Search"
                  style={{width: '100%'}}
                  className="form-control"
                />
              </BootstrapForm.Group>
            </BootstrapForm.Row>
            <BootstrapForm.Row>
              <TextInput
                xs="8"
                type="text"
                label="Address*"
                name="address"
                disabled
              />
              <TextInput
                xs="2"
                type="text"
                label="Apartment"
                name="apartment"
              />
            </BootstrapForm.Row>
            <BootstrapForm.Row>
              <TextInput
                xs="6"
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
                options={state_options}
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
            <Button as={Link} variant="info" href="/shelter">Cancel</Button>
          </ButtonGroup>
        </Card>
        )}
      </Formik>
    </>
  );
};

export const BuildingForm = ({id}) => {

  // Identify any query param data.
  const [queryParams] = useQueryParams();
  const {
    shelter_id = ''
  } = queryParams;

  // Initial Building data.
  const [data, setData] = useState({
    name: '',
    description: '',
    shelter: shelter_id,
  });

  // Hook for initializing data.
  useEffect(() => {
    let source = axios.CancelToken.source();
    if (id) {
      const fetchBuildingData = async () => {
        // Fetch ServiceRequest data.
        await axios.get('/shelter/api/building/' + id + '/', {
          cancelToken: source.token,
        })
        .then(response => {
          setData(response.data);
        })
        .catch(error => {
          console.log(error.response);
        });
      };
      fetchBuildingData();
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
        onSubmit={(values, { setSubmitting }) => {
          setTimeout(() => {
            if (id) {
              axios.put('/shelter/api/building/' + id + '/', values)
              .then(function() {
                navigate('/shelter/' + values.shelter);
              })
              .catch(e => {
                console.log(e);
              });
            }
            else {
              axios.post('/shelter/api/building/', values)
              .then(function() {
                navigate('/shelter/' + shelter_id);
              })
              .catch(e => {
                console.log(e);
              });
            }
            setSubmitting(false);
          }, 500);
        }}
      >
        {props => (
          <Card border="secondary" className="mt-5">
          <Card.Header as="h5"> Building Information</Card.Header>
          <Card.Body>
            <BootstrapForm noValidate>
              <BootstrapForm.Row>
                <TextInput
                  xs="5"
                  type="text"
                  label="Name*"
                  name="name"
                  id="name"
                />
                <TextInput
                  xs="5"
                  type="text"
                  label="Description"
                  name="description"
                />
              </BootstrapForm.Row>
            </BootstrapForm>
          </Card.Body>
          <ButtonGroup size="lg">
            <Button type="submit" onClick={() => { props.submitForm()}}>Save</Button>
            <Button as={Link} variant="info" href="/shelter">Cancel</Button>
          </ButtonGroup>
        </Card>
        )}
      </Formik>
    </>
  );
};

export const RoomForm = ({id}) => {

    // Identify any query param data.
    const [queryParams] = useQueryParams();
    const {
      building_id = ''
    } = queryParams;

  // Initial Room data.
  const [data, setData] = useState({
    name: '',
    description: '',
    building: building_id,
  });

  // Hook for initializing data.
  useEffect(() => {
    let source = axios.CancelToken.source();

    if (id) {
      const fetchRoomData = async () => {
        // Fetch ServiceRequest data.
        await axios.get('/shelter/api/room/' + id + '/', {
          cancelToken: source.token,
        })
        .then(response => {
          setData(response.data);
        })
        .catch(error => {
          console.log(error.response);
        });
      };
      fetchRoomData();
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
        onSubmit={(values, { setSubmitting }) => {
          setTimeout(() => {
            if (id) {
              axios.put('/shelter/api/room/' + id + '/', values)
              .then(function() {
                navigate('/shelter/room/' + id);
              })
              .catch(e => {
                console.log(e);
              });
            }
            else {
              axios.post('/shelter/api/room/', values)
              .then(function() {
                navigate('/shelter/building/' + building_id);
              })
              .catch(e => {
                console.log(e);
              });
            }
            setSubmitting(false);
          }, 500);
        }}
      >
        {props => (
          <Card border="secondary" className="mt-5">
          <Card.Header as="h5"> Room Information</Card.Header>
          <Card.Body>
            <BootstrapForm noValidate>
              <BootstrapForm.Row>
                <TextInput
                  xs="5"
                  type="text"
                  label="Name*"
                  name="name"
                  id="name"
                />
                <TextInput
                  xs="5"
                  type="text"
                  label="Description"
                  name="description"
                />
              </BootstrapForm.Row>
            </BootstrapForm>
          </Card.Body>
          <ButtonGroup size="lg">
            <Button type="submit" onClick={() => { props.submitForm()}}>Save</Button>
            <Button as={Link} variant="info" href="/shelter">Cancel</Button>
          </ButtonGroup>
        </Card>
        )}
      </Formik>
    </>
  );
};
