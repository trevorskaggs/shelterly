import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Link, navigate, useQueryParams } from 'raviger';
import { Field, Form, Formik } from "formik";
import { Col, FormGroup, Container, Input, Label, Row } from "reactstrap";
import * as Yup from 'yup';
import { DateTimePicker, DropDown, TextInput } from '.././components/Form.js';
import { catAgeChoices, dogAgeChoices, catColorChoices, dogColorChoices, speciesChoices, sexChoices, dogSizeChoices, catSizeChoices, statusChoices, unknownChoices } from './constants'

const header_style = {
  textAlign: "center",
}

export const AnimalForm = ({id}) => {

  // Identify any query param data.
  const [queryParams] = useQueryParams();
  const {
    owner_id = null,
    servicerequest_id = null,
    reporter_id = null,
  } = queryParams;

  // Track species selected and update choice lists accordingly.
  const sizeRef = useRef(null);
  const ageRef = useRef(null);
  const pcolorRef = useRef(null);
  const scolorRef = useRef(null);
  const ageChoices = {'':[], 'dog':dogAgeChoices, 'cat':catAgeChoices, 'horse':[], 'other':[]}
  const colorChoices = {'':[], 'dog':dogColorChoices, 'cat':catColorChoices, 'horse':[], 'other':[]}
  const sizeChoices = {'':[], 'dog':dogSizeChoices, 'cat':catSizeChoices, 'horse':[], 'other':[]}

  // Track whether or not to add another animal after saving.
  const [addAnother, setAddAnother] = useState(false);
  // Unique key used to re-render the same page if adding another animal.
  const [key, setKey] = useState(Math.random());
  // Dynamic placeholder value for options.
  const [placeholder, setPlaceholder] = useState("Select a species...");

  // Initial Animal data.
  const [data, setData] = useState({
    owner: owner_id,
    request: servicerequest_id,
    status:'REPORTED',
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
    image: null,
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

  const [image, setImage] = useState(null);
  function handleImageChange(e) {
    console.log(e);
    setImage(e.target.files[0]);
  };
  
  return (
    <span key={key}>
      <Formik
        initialValues={data}
        enableReinitialize={true}
        validationSchema={Yup.object({
          status: Yup.string(),
          name: Yup.string()
            .max(50, 'Must be 50 characters or less.'),
          species: Yup.string()
            .oneOf(speciesChoices.map(option => option['value'])),
          size: Yup.string()
            .max(10, 'Must be 10 characters or less'),
          age: Yup.string(),
          sex: Yup.string()
            .oneOf(['M', 'F']),
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
          // image: Yup.string()
          //   .nullable(),
        })}
        onSubmit={(values, { setSubmitting }) => {
          if (id) {
            axios.put('http://localhost:3000/animals/api/animal/' + id + '/', values)
            .then(function() {
              // If the animal has an SR, redirect to the SR.
              if (values.request) {
                navigate('/hotline/servicerequest/' + values.request);
              }
              // If the animal has an owner ID, redirect to the owner details.
              else if (values.owner) {
                navigate('/hotline/owner/' + values.owner);
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
                // If SR already exists, pass along the request ID.
                if (servicerequest_id) {
                  navigate('/animals/animal/new?servicerequest_id=' + servicerequest_id)
                }
                // Else pass along the owner and reporter IDs used for SR creation downstream.
                else {
                  navigate('/animals/animal/new?owner_id=' + (response.data.owner||'') + '&reporter_id=' + reporter_id||'');
                  setKey(Math.random());
                }
              }
              else {
                // If SR already exists, redirect to the SR details.
                if (servicerequest_id) {
                  navigate('/hotline/servicerequest/' + servicerequest_id);
                }
                // Else redirect to create a new SR.
                else {
                  navigate('/hotline/servicerequest/new?owner_id=' + (response.data.owner||'') + '&reporter_id=' + reporter_id||'');
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
               <Row hidden={!id}>
                  <Col xs="3">
                    <DropDown
                      id="status"
                      name="status"
                      type="text"
                      label="Status"
                      options={statusChoices}
                      value={props.values.status||''}
                      isClearable={false}
                      onChange={(instance) => {
                        props.setFieldValue("status", instance.value);
                      }}
                    />
                  </Col>
                </Row>
               <Row>
                  <Col xs="8">
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
                        setPlaceholder("Select...")
                        sizeRef.current.select.clearValue();
                        ageRef.current.select.clearValue();
                        pcolorRef.current.select.clearValue();
                        scolorRef.current.select.clearValue();
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
                      ref={sizeRef}
                      options={sizeChoices[props.values.species]}
                      value={props.values.size||''}
                      placeholder={placeholder}
                    />
                  </Col>
                  <Col xs="4">
                    <DropDown
                      label="Age"
                      id="age"
                      name="age"
                      type="text"
                      ref={ageRef}
                      options={ageChoices[props.values.species]}
                      value={props.values.age||''}
                      placeholder={placeholder}
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
                      ref={pcolorRef}
                      options={colorChoices[props.values.species]}
                      value={props.values.pcolor||''}
                      placeholder={placeholder}
                    />
                    <DropDown
                      label="Secondary Color"
                      id="scolor"
                      name="scolor"
                      type="text"
                      ref={scolorRef}
                      options={colorChoices[props.values.species]}
                      value={props.values.scolor||''}
                      placeholder={placeholder}
                    />
                  </Col>
                  <Col xs="7">
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
                  <Col>
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
                  <Col>
                    <DropDown
                      label="Aggressive"
                      id="aggressive"
                      name="aggressive"
                      type="text"
                      options={unknownChoices}
                      value={props.values.aggressive||'unknown'}
                      isClearable={false}
                    />
                  </Col>
                  <Col>
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
                </Row>
                <Row>
                  <Col>
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
                  <Col>
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
                  <Col>
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
                    <Label htmlFor="behavior_notes">Behavior Notes</Label>
                    <TextInput
                      id="behavior_notes"
                      name="behavior_notes"
                      type="textarea"
                      rows={5}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col className="mt-3">
                  <Label for="image">Image File</Label>
                  <Input type="file" name="image" id="image" onChange={handleImageChange} />
                  </Col>
                </Row>
              </FormGroup>

              <button type="button" className="btn btn-success mr-1" onClick={() => {setAddAnother(false); props.submitForm()}}>Save</button>
              {!id ? <button type="button" className="btn btn-primary mr-1" onClick={() => {setAddAnother(true); props.submitForm()}}>Add Another</button> : ""}
              <Link className="btn btn-secondary" href={servicerequest_id ? "/hotline/servicerequest/" + servicerequest_id : "/"}>Cancel</Link>
            </Container>
          </Form>
        )}
      </Formik>
    </span>
  );
};
