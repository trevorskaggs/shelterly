import React, { useEffect, useState } from 'react';
import axios from "axios";
import { Link, navigate } from 'raviger';
import { Field, Form, Formik } from 'formik';
import {
  Button,
  Col,
  FormGroup,
  Row,
  Container,
} from 'reactstrap';
import { ReactstrapInput } from 'reactstrap-formik';
import { TextInput, DropDown } from '.././components/Form';
import * as Yup from 'yup';

const state_options = [{value:'AL', label:"AL"},{value:'AK', label:"AK"},{value:'AZ', label:"AZ"},{value:'AR', label:"AR"},{value:'CA', label:"CA"},{value:'CO', label:"CO"},{value:'CT', label:"CT"},
{value:'DE', label:"DE"},{value:'FL', label:"FL"},{value:'GA', label:"GA"},{value:'HI', label:"HI"},{value:'ID', label:"ID"},{value:'IL', label:"IL"},{value:'IN', label:"IN"},
{value:'IA', label:"IA"},{value:'KS', label:"KS"},{value:'KY', label:"KY"},{value:'LA', label:"LA"},{value:'ME', label:"ME"},{value:'MD', label:"MD"},{value:'MA', label:"MA"},
{value:'MI', label:"MI"},{value:'MN', label:"MN"},{value:'MS', label:"MS"},{value:'MO', label:"MO"},{value:'MT', label:"MT"},{value:'NE', label:"NE"},{value:'NV', label:"NV"},
{value:'NH', label:"NH"},{value:'NJ', label:"NJ"},{value:'NM', label:"NM"},{value:'NY', label:"NY"},{value:'NC', label:"NC"},{value:'ND', label:"ND"},{value:'OH', label:"OH"},
{value:'OK', label:"OK"},{value:'PA', label:"PA"},{value:'RI', label:"RI"},{value:'SC', label:"SC"},{value:'SD', label:"SD"},{value:'TN', label:"TN"},{value:'TX', label:"TX"},
{value:'VA', label:"VA"},{value:"VT", label:"VT"},{value:'WA', label:"WA"},{value:'WV', label:"WV"},{value:'WI', label:"WI"},{value:'WY', label:"WY"},]


export const ShelterForm = ({sid}) => {

  // Initial shelter data.
  const [data, setData] = useState({
    name: '',
    description: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    zip_code: '',
  });

  // Hook for initializing data.
  useEffect(() => {
    let source = axios.CancelToken.source();
    // determines if edit or new
    if (sid) {
      const fetchShelterData = async () => {
        // Fetch ServiceRequest data.
        await axios.get('http://0.0.0.0:8000/shelter/api/shelter/' + sid + '/', {
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
  }, [sid]);

  return (
    <>
      <Formik
        initialValues={data}
        enableReinitialize={true}
        validationSchema={Yup.object({
          name: Yup.string()
            .max(50, 'Must be 50 characters or less')
            .required('Required'),
        })}
        onSubmit={(values, { setSubmitting }) => {
          if (sid) {
            axios.put('http://0.0.0.0:8000/shelter/api/shelter/' + sid + '/', values)
            .then(function() {
              navigate('/shelter/list')
            })
            .catch(error => {
              console.log(error.response);
            });
          }
          else {
            axios.post('http://0.0.0.0:8000/shelter/api/shelter/', values)
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
          <Form>
          <Container>
            <FormGroup>
              <Row>
                <Col xs={{size: 5, offset: 1}}>
                  <Field
                    type="text"
                    label="Name*"
                    name="name"
                    id="name"
                    component={ReactstrapInput}
                  />
                </Col>
                <Col xs="5">
                  <Field
                    type="text"
                    label="Description*"
                    name="description"
                    id="description"
                    component={ReactstrapInput}
                  />
                  </Col>
              </Row>
            </FormGroup>

            <FormGroup>
            <Row>
                  <Col xs="8">
                    <TextInput
                      type="text"
                      label="Address"
                      name="address"
                      id="address"
                    />
                  </Col>
                  <Col xs="2">
                    <TextInput
                      type="text"
                      label="Apartment"
                      name="apartment"
                      id="apartment"
                    />
                  </Col>
                </Row>
            <Row>
                  <Col xs="6">
                    <TextInput
                      type="text"
                      label="City"
                      name="city"
                      id="city"
                    />
                  </Col>
                  <Col xs="2">
                    <DropDown
                      label="State"
                      name="state"
                      id="state"
                      options={state_options}
                      isClearable={true}
                      value={props.values.state||''}
                    />
                  </Col>
                  <Col xs="2">
                    <TextInput
                      type="text"
                      label="Zip Code"
                      name="zip_code"
                      id="zip_code"
                    />
                  </Col>
                </Row>
            </FormGroup>

            <Button type="submit" className="btn-success mr-1">Save</Button>
            <Link className="btn btn-secondary" href="/shelter">Cancel</Link>
          </Container>
        </Form>
        )}
      </Formik>
    </>
  );
};

export const EditShelterForm = ({sid}) => {
  // Initial Person data.
  const [data, setData] = useState({
    name: '',
    description: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    zip_code: '',
  });

  // Hook for initializing data.
  useEffect(() => {
    let source = axios.CancelToken.source();
    
    const fetchShelterData = async () => {
      // Fetch ServiceRequest data.
      await axios.get('http://0.0.0.0:8000/shelter/api/shelter/' + sid + '/', {
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
    
    // Cleanup.
    return () => {
      source.cancel();
    };
  }, [sid]);

  return (
    <>
      <Formik
        initialValues={data}
        enableReinitialize={true}
        validationSchema={Yup.object({
          name: Yup.string()
            .max(50, 'Must be 50 characters or less')
            .required('Required'),
        })}
        onSubmit={(values, { setSubmitting }) => {
          axios.put('http://localhost:8000/shelter/api/shelter/' + sid + '/', values)
          .then(function() {
            navigate('/shelter/list');
          })
          .catch(e => {
            console.log(e);
          });
          setSubmitting(false);
        }}
      >
        <Form>
          <Container>
            <FormGroup>
              <Row>
                <Col xs={{size: 5, offset: 1}}>
                  <Field
                    type="text"
                    label="Name*"
                    name="name"
                    id="name"
                    component={ReactstrapInput}
                  />
                </Col>
                <Col xs="5">
                  <Field
                    type="text"
                    label="Description*"
                    name="description"
                    id="description"
                    component={ReactstrapInput}
                  />
                  </Col>
              </Row>
            </FormGroup>

            <FormGroup>
              <Row>
                    <Col xs="8">
                      <TextInput
                        type="text"
                        label="Address"
                        name="address"
                        id="address"
                      />
                    </Col>
                    <Col xs="2">
                      <TextInput
                        type="text"
                        label="Apartment"
                        name="apartment"
                        id="apartment"
                      />
                    </Col>
                  </Row>
              <Row>
                <Col xs={{size: 5, offset: 1}}>
                  <Field
                    type="text"
                    label="Address"
                    name="address"
                    id="address"
                    component={ReactstrapInput}
                  />
                </Col>
              </Row>
            </FormGroup>

            <Button type="submit" className="btn-success mr-1">Save</Button>
            <Link className="btn btn-secondary" href="/shelter">Cancel</Link>
          </Container>
        </Form>
      </Formik>
    </>
  );
};

export const BuildingForm = ({sid}) => {
  return (
    <>
      <Formik
        initialValues={{
          name: '',
          description: '',
          shelter: sid,
        }}
        validationSchema={Yup.object({
          name: Yup.string()
            .max(50, 'Must be 50 characters or less')
            .required('Required'),
        })}
        onSubmit={(values, { setSubmitting }) => {
          setTimeout(() => {
            axios.post('http://0.0.0.0:8000/shelter/api/building/', values)
            .then(function() {
              navigate('/shelter/' + sid);
            })
            .catch(e => {
              console.log(e);
            });
            setSubmitting(false);
          }, 500);
        }}
      >
        <Form>
          <Container>
            <FormGroup>
              <Row>
                <Col xs={{size: 5, offset: 1}}>
                  <Field
                    type="text"
                    label="Name*"
                    name="name"
                    id="name"
                    component={ReactstrapInput}
                  />
                </Col>
                <Col xs="5">
                  <Field
                    type="text"
                    label="Description*"
                    name="description"
                    id="description"
                    component={ReactstrapInput}
                  />
                  </Col>
              </Row>
            </FormGroup>

            <Button type="submit" className="btn-success mr-1">Save</Button>
            <Link className="btn btn-secondary" href="/shelter">Cancel</Link>
          </Container>
        </Form>
      </Formik>
    </>
  );
};

export const EditBuildingForm = ({bid}) => {
  // Initial Person data.
  const [data, setData] = useState({
    name: '',
    description: '',
  });

  // Hook for initializing data.
  useEffect(() => {
    let source = axios.CancelToken.source();
    
    const fetchPersonData = async () => {
      // Fetch ServiceRequest data.
      await axios.get('http://0.0.0.0:8000/shelter/api/building/' + bid + '/', {
        cancelToken: source.token,
      })
      .then(response => {
        setData(response.data);
      })
      .catch(error => {
        console.log(error.response);
      });
    };
    fetchPersonData();
    
    // Cleanup.
    return () => {
      source.cancel();
    };
  }, [bid]);

  return (
    <>
      <Formik
        initialValues={data}
        enableReinitialize={true}
        validationSchema={Yup.object({
          name: Yup.string()
            .max(50, 'Must be 50 characters or less')
            .required('Required'),
        })}
        onSubmit={(values, { setSubmitting }) => {
          setTimeout(() => {
            console.log(values)
            axios.put('http://localhost:8000/shelter/api/building/' + bid + '/', values)
            .then(function() {
              navigate('/shelter/building/'+bid+'/');
            })
            .catch(e => {
              console.log(e);
            });
            setSubmitting(false);
          }, 500);
        }}
      >
        <Form>
          <Container>
            <FormGroup>
              <Row>
                <Col xs={{size: 5, offset: 1}}>
                  <Field
                    type="text"
                    label="Name*"
                    name="name"
                    id="name"
                    component={ReactstrapInput}
                  />
                </Col>
                <Col xs="5">
                  <Field
                    type="text"
                    label="Description*"
                    name="description"
                    id="description"
                    component={ReactstrapInput}
                  />
                  </Col>
              </Row>
            </FormGroup>
            <Button type="submit" className="btn-success mr-1">Save</Button>
            <Link className="btn btn-secondary" href="/shelter">Cancel</Link>
          </Container>
        </Form>
      </Formik>
    </>
  );
};

export const RoomForm = ({bid}) => {
  return (
    <>
      <Formik
        initialValues={{
          name: '',
          description: '',
          building: bid,
        }}
        validationSchema={Yup.object({
          name: Yup.string()
            .max(50, 'Must be 50 characters or less')
            .required('Required'),
        })}
        onSubmit={(values, { setSubmitting }) => {
          setTimeout(() => {
            axios.post('http://0.0.0.0:8000/shelter/api/room/', values)
            .then(function() {
              navigate('/shelter/building/' + bid);
            })
            .catch(e => {
              console.log(e);
            });
            setSubmitting(false);
          }, 500);
        }}
      >
        <Form>
          <Container>
            <FormGroup>
              <Row>
                <Col xs={{size: 5, offset: 1}}>
                  <Field
                    type="text"
                    label="Name*"
                    name="name"
                    id="name"
                    component={ReactstrapInput}
                  />
                </Col>
                <Col xs="5">
                  <Field
                    type="text"
                    label="Description*"
                    name="description"
                    id="description"
                    component={ReactstrapInput}
                  />
                  </Col>
              </Row>
            </FormGroup>

            <Button type="submit" className="btn-success mr-1">Save</Button>
            <Link className="btn btn-secondary" href="/shelter">Cancel</Link>
          </Container>
        </Form>
      </Formik>
    </>
  );
};

export const EditRoomForm = ({rid}) => {
  // Initial Person data.
  const [data, setData] = useState({
    name: '',
    description: '',
  });

  // Hook for initializing data.
  useEffect(() => {
    let source = axios.CancelToken.source();
    
    const fetchPersonData = async () => {
      // Fetch ServiceRequest data.
      await axios.get('http://0.0.0.0:8000/shelter/api/room/' + rid + '/', {
        cancelToken: source.token,
      })
      .then(response => {
        setData(response.data);
      })
      .catch(error => {
        console.log(error.response);
      });
    };
    fetchPersonData();
    
    // Cleanup.
    return () => {
      source.cancel();
    };
  }, [rid]);

  return (
    <>
      <Formik
        initialValues={data}
        enableReinitialize={true}
        validationSchema={Yup.object({
          name: Yup.string()
            .max(50, 'Must be 50 characters or less')
            .required('Required'),
        })}
        onSubmit={(values, { setSubmitting }) => {
          setTimeout(() => {
            console.log(values)
            axios.put('http://localhost:8000/shelter/api/room/' + rid + '/', values)
            .then(function() {
              navigate('/shelter/room/' + rid +  '/');
            })
            .catch(e => {
              console.log(e);
            });
            setSubmitting(false);
          }, 500);
        }}
      >
        <Form>
          <Container>
            <FormGroup>
              <Row>
                <Col xs={{size: 5, offset: 1}}>
                  <Field
                    type="text"
                    label="Name*"
                    name="name"
                    id="name"
                    component={ReactstrapInput}
                  />
                </Col>
                <Col xs="5">
                  <Field
                    type="text"
                    label="Description*"
                    name="description"
                    id="description"
                    component={ReactstrapInput}
                  />
                  </Col>
              </Row>
            </FormGroup>
            <Button type="submit" className="btn-success mr-1">Save</Button>
            <Link className="btn btn-secondary" href="/shelter">Cancel</Link>
          </Container>
        </Form>
      </Formik>
    </>
  );
};