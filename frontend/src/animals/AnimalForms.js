import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Link, navigate, useQueryParams } from 'raviger';
import { Field, Form, Formik } from "formik";
import { Button, Col, FormGroup, Container, Row } from "reactstrap";
import * as Yup from 'yup';
import { DateTimePicker, DropDown, TextInput } from '.././components/Form.js';
import { catAgeChoices, dogAgeChoices, catColorChoices, dogColorChoices, speciesChoices, sexChoices, dogSizeChoices, catSizeChoices, unknownChoices } from './constants'


const AnimalForm = ({id}) => {

  // Identify any query param data.
  const [queryParams] = useQueryParams();
  const {
    owner_id = null,
    servicerequest_id = null,
  } = queryParams;

  // Track species selected and update choice lists accordingly.
  const selectRef = useRef(null);
  const ageChoices = {'':[], 'dog':dogAgeChoices, 'cat':catAgeChoices, 'horse':[], 'other':[]}
  const colorChoices = {'':[], 'dog':dogColorChoices, 'cat':catColorChoices, 'horse':[], 'other':[]}
  const sizeChoices = {'':[], 'dog':dogSizeChoices, 'cat':catSizeChoices, 'horse':[], 'other':[]}

  // Track whether or not to add another animal after saving.
  const [addAnother, setAddAnother] = useState(false);

  // Initial Animal data.
  const [data, setData] = useState({
    owner: owner_id,
    request: servicerequest_id,
    name: '',
    species: '',
    sex: '',
    size: '',
    age: '',
    pcolor: '',
    scolor: '',
    color_notes: '',
    fixed: 'unknown',
    aggressive: 'unknown',
    confined: 'unknown',
    attended_to: 'unknown',
    collared: 'unknown',
    behavior_notes: '',
    last_seen: null,
  });

  // Hook for initializing data.
  useEffect(() => {
    let source = axios.CancelToken.source();
    if (id) {
      const fetchAnimalData = async () => {
        // Fetch Animal data.
        await axios.get('http://localhost:3000/animals/api/animal/' + id + '/', {
          cancelToken: source.token,
        })
        .then(response => {
          console.log(response.data);
          setData(response.data);
        })
        .catch(error => {
          console.log(error.response);
        });
      };
      fetchAnimalData();
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
            .max(50, 'Must be 50 characters or less.'),
          species: Yup.string(),
            // .oneOf(speciesChoices.map(x => x['value'])),
          size: Yup.string()
            .max(10, 'Must be 10 characters or less'),
          age: Yup.string(),
          sex: Yup.string(),
            // .oneOf(['M', 'F']),
          pcolor: Yup.string(),
          scolor: Yup.string(),
          color_notes: Yup.string()
            .max(200, 'Must be 200 characters or less'),
          fixed: Yup.string()
            .max(200, 'Must be 200 characters or less'),
          aggressive: Yup.string()
            .max(200, 'Must be 200 characters or less'),
          confined: Yup.string()
           .max(200, 'Must be 200 characters or less'),
          attended_to: Yup.string()
           .max(200, 'Must be 200 characters or less'),
          collared: Yup.string()
            .max(200, 'Must be 200 characters or less'),
          behavior_notes: Yup.string()
            .max(200, 'Must be 200 characters or less'),
          last_seen: Yup.date()
            .nullable(),
        })}
        onSubmit={(values, { setSubmitting }) => {
          if (id) {
            axios.put('http://localhost:3000/animals/api/animal/' + id + '/', values)
            .then(function() {
              // If we have an SR ID, redirect to the SR.
              if (servicerequest_id) {
                navigate('/hotline/servicerequest/' + servicerequest_id);
              }
              // If we have an owner ID, redirect to the owner details.
              else if (owner_id) {
                navigate('/hotline/owner/' + owner_id);
              }
              else {
                navigate('/animals/animal/' + id);
              }
            })
            .catch(error => {
              console.log(error.response);
            });
          }
          else {
            axios.post('http://localhost:3000/animals/api/animal/', values)
            .then(response => {
              if (addAnother) {
                navigate('/animals/animal/new?servicerequest_id=' + servicerequest_id + '&owner=' + owner_id)
              }
              else {
                // If SR already exists, update it with animal info and redirect to the SR details.
                if (servicerequest_id) {
                  navigate('/hotline/servicerequest/' + servicerequest_id);
                }
                // If we have a owner ID, redirect to the owner details.
                else if (owner_id) {
                  navigate('/hotline/owner/' + owner_id);
                }
                // Else redirect to animal details.
                else {
                  navigate('/animals/animal/' + response.data.id);
                }
              }
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
              <Field type="hidden" value={owner_id||""} name="owner" id="owner"></Field>
              <Field type="hidden" value={servicerequest_id||""} name="request" id="request"></Field>
              <FormGroup>
               <Row>
                  <Col xs="8" className="mt-3">
                    <TextInput
                      id="name"
                      name="name"
                      type="text"
                      label="Name"
                    />
                  </Col>
                  <Col xs="2">
                    <DropDown
                      label="Sex"
                      id="sexDropDown"
                      name="sex"
                      type="text"
                      options={sexChoices}
                      value={props.values.sex||''}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col xs="2">
                    <DropDown
                      label="Species"
                      id="speciesDropdown"
                      name="species"
                      type="text"
                      options={speciesChoices}
                      value={props.values.species||data.species}
                      isClearable={false}
                      onChange={(instance) => {
                        selectRef.current.select.clearValue();
                        props.setFieldValue("species", instance.value);
                      }}
                    />
                  </Col>
                  <Col xs="4">
                    <DropDown
                      label="Size"
                      id="sizeDropdown"
                      name="size"
                      type="text"
                      ref={selectRef}
                      options={sizeChoices[props.values.species]}
                      value={props.values.size||''}
                    />
                  </Col>
                  <Col xs="4">
                    <DropDown
                      label="Age"
                      id="age"
                      name="age"
                      type="text"
                      ref={selectRef}
                      options={ageChoices[props.values.species]}
                      value={props.values.age||''}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col xs="3">
                    <DropDown
                      label="Primary Color"
                      id="pcolor"
                      name="pcolor"
                      type="text"
                      ref={selectRef}
                      options={colorChoices[props.values.species]}
                      value={props.values.pcolor||''}
                    />
                    <DropDown
                      label="Secondary Color"
                      id="scolor"
                      name="scolor"
                      type="text"
                      ref={selectRef}
                      options={colorChoices[props.values.species]}
                      value={props.values.scolor||''}
                    />
                  </Col>
                  <Col xs="7" className="mt-3">
                    <TextInput
                      id="color_notes"
                      name="color_notes"
                      type="textarea"
                      rows={5}
                      label="Description"
                    />
                  </Col>
                </Row>
                <Row>
                  <Col xs="3">
                    <DropDown
                      label="Aggressive"
                      id="aggressive"
                      name="aggressive"
                      type="text"
                      options={unknownChoices}
                      value={props.values.aggressive||'unknown'}
                      isClearable={false}
                    />
                    <DropDown
                      label="Fixed"
                      id="fixed"
                      name="fixed"
                      type="text"
                      options={unknownChoices}
                      value={props.values.fixed||'unknown'}
                      isClearable={false}
                    />
                  </Col>
                  <Col xs="7" className="mt-3">
                    <TextInput
                      id="behavior_notes"
                      name="behavior_notes"
                      type="textarea"
                      rows={5}
                      label="Behavior Notes"
                    />
                  </Col>
                </Row>
                <Row>
                  <Col xs="3">
                    <DropDown
                      label="Confined"
                      id="confined"
                      name="confined"
                      type="text"
                      options={unknownChoices}
                      value={props.values.confined||'unknown'}
                      isClearable={false}
                    />
                  </Col>
                  <Col xs="3">
                    <DropDown
                      label="Collared"
                      id="collared"
                      name="collared"
                      type="text"
                      options={unknownChoices}
                      value={props.values.collared||'unknown'}
                      isClearable={false}
                    />
                  </Col>
                  <Col xs="4">
                    <DateTimePicker
                      label="Last Seen"
                      name="last_seen"
                      id="last_seen"
                      onChange={(date, dateStr) => {
                        props.setFieldValue("last_seen", dateStr)
                      }}
                      value={data.last_seen||null}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col xs="10">
                    <DropDown
                      label="Attended To"
                      id="attended_to"
                      name="attended_to"
                      type="text"
                      options={unknownChoices}
                      value={props.values.attended_to||'unknown'}
                      isClearable={false}
                    />
                  </Col>


                </Row>
              </FormGroup>

              <Button type="submit" className="btn-success mr-1">Save</Button>
              <button type="button" className="btn btn-primary mr-1" onClick={() => {setAddAnother(true); props.submitForm()}}>Add Another</button>
              <Link className="btn btn-secondary" href={servicerequest_id ? "/hotline/servicerequest/" + servicerequest_id : "/"}>Cancel</Link>
            </Container>
          </Form>
        )}
      </Formik>
    </>
  );
};
  
  export default AnimalForm;
