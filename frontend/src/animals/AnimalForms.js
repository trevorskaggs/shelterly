import React, { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { Link, navigate, useQueryParams } from 'raviger';
import { Field, Form, Formik } from "formik";
import { Col, Image } from 'react-bootstrap';
import { Button, ButtonGroup, Form as BootstrapForm } from "react-bootstrap";
import { Card } from 'react-bootstrap';
import * as Yup from 'yup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMinusSquare,
} from '@fortawesome/free-solid-svg-icons';
import { DateTimePicker, DropDown, ImageUploader, TextInput } from '../components/Form.js';
import { catAgeChoices, dogAgeChoices, horseAgeChoices, otherAgeChoices, catColorChoices, dogColorChoices, horseColorChoices, otherColorChoices, speciesChoices, sexChoices, dogSizeChoices, catSizeChoices, horseSizeChoices, otherSizeChoices, statusChoices, unknownChoices } from './constants'

export const AnimalForm = ({id}) => {

  // Determine if this is an intake workflow.
  var is_intake = window.location.pathname.includes("intake")

  // Identify any query param data.
  const [queryParams] = useQueryParams();
  const {
    owner_id = null,
    servicerequest_id = null,
    reporter_id = null,
    first_responder = 'false'
  } = queryParams;

  // Determine if this is from a first responder when creating a SR.
  var is_first_responder = (first_responder === 'true');

  // Track species selected and update choice lists accordingly.
  const sizeRef = useRef(null);
  const ageRef = useRef(null);
  const pcolorRef = useRef(null);
  const scolorRef = useRef(null);
  const ageChoices = {'':[], 'dog':dogAgeChoices, 'cat':catAgeChoices, 'horse':horseAgeChoices, 'other':otherAgeChoices}
  const colorChoices = {'':[], 'dog':dogColorChoices, 'cat':catColorChoices, 'horse':horseColorChoices, 'other':otherColorChoices}
  const sizeChoices = {'':[], 'dog':dogSizeChoices, 'cat':catSizeChoices, 'horse':horseSizeChoices, 'other':otherSizeChoices}

  // Track whether or not to add another animal after saving.
  const [addAnother, setAddAnother] = useState(false);
  // Unique key used to re-render the same page if adding another animal.
  const [key, setKey] = useState(Math.random());
  // Dynamic placeholder value for options.
  const [placeholder, setPlaceholder] = useState("Select a species...");

  const [front_image, setFrontImage] = useState([]);
  const [side_image, setSideImage] = useState([]);
  const [extra_images, setExtraImages] = useState([]);
  const [reinitialize, setReinitialize] = useState(true);

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
    injured: 'unknown',
    behavior_notes: '',
    last_seen: null,
    front_image: null,
    side_image: null,
    extra_images: [],
  });

  const wrapperSetFrontImage = useCallback(val => {
    if (val !== 0){
      setFrontImage(val);
    }
  }, [setFrontImage]);

  const wrapperSetSideImage = useCallback(val => {
    if (val !== 0){
      setSideImage(val);
    }
  }, [setSideImage]);

  const wrapperSetExtraImages = useCallback(val => {
    if (val !== 0){
      setExtraImages(val);
    }
  }, [setExtraImages]);

  // Resets single file image fields to be null.
  const clearImage = (image_name) => {
    setData(prevState => ({ ...prevState, [image_name]:null }));
  }

  // Removes an image from a multi file image field array.
  const clearImages = (image_url, setFieldValue) => {
    setData(prevState => ({ ...prevState, ["extra_images"]:data.extra_images.filter(url => url !== image_url) }));
    setFieldValue("extra_images", data.extra_images.filter(url => url !== image_url));
  }

  // Hook for initializing data.
  useEffect(() => {
    let source = axios.CancelToken.source();
    if (id) {
      const fetchAnimalData = async () => {
        // Fetch Animal data.
        await axios.get('/animals/api/animal/' + id + '/', {
          cancelToken: source.token,
        })
        .then(response => {
          setData(response.data);
          setPlaceholder("Select...");
          // Turn off reinitialization after form load so that data can be modified for image tracking without causing a form reset.
          setReinitialize(false);
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
    <span key={key}>
      <Formik
        initialValues={data}
        enableReinitialize={reinitialize}
        validationSchema={Yup.object({
          status: Yup.string(),
          name: Yup.string()
            .max(50, 'Must be 50 characters or less.'),
          species: Yup.string()
            .required('Required')
            .oneOf(speciesChoices.map(option => option['value'])),
          size: Yup.string()
            .required('Required'),
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
          injured: Yup.string()
           .max(200, 'Must be 200 characters or less'),
          behavior_notes: Yup.string()
            .max(200, 'Must be 200 characters or less'),
          last_seen: Yup.date()
            .nullable(),
          front_image: Yup.mixed()
            .required('Required'),
          side_image: Yup.mixed()
            .required('Required'),
          extra_images: Yup.array()
        })}
        onSubmit={(values, { setSubmitting }) => {
          // Use FormData so that image files may also be included.
          const formData = new FormData();
          // Convert json to FormData.
          for ( var key in values ) {
            if (values[key] !== null) {
              formData.append(key, values[key]);
            }
          }
          // Add extra images.
          for (let i = 0; i < extra_images.length; i++) {
            formData.append('extra' + (i + 1), extra_images[i].file);
          }
          if (id) {
            axios.put('/animals/api/animal/' + id + '/', formData)
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
            axios.post('/animals/api/animal/', formData)
            .then(response => {
              if (addAnother) {
                // If SR already exists, pass along the request ID.
                if (servicerequest_id) {
                  navigate('/hotline/animal/new?servicerequest_id=' + servicerequest_id)
                }
                // Stay inside intake workflow if applicable.
                else if (is_intake) {
                  navigate('/intake/animal/new?owner_id=' + (response.data.owner||'') + '&reporter_id=' + (reporter_id||''));
                  // This is a hack used to refresh when navigating to the same page.
                  setKey(Math.random());
                }
                // Else pass along the owner and reporter IDs used for SR creation downstream.
                else {
                  navigate('/hotline/animal/new?owner_id=' + (response.data.owner||'') + '&reporter_id=' + (reporter_id||'') + '&first_responder=' + is_first_responder);
                  // This is a hack used to refresh when navigating to the same page.
                  setKey(Math.random());
                }
              }
              else {
                // If SR already exists, redirect to the SR details.
                if (servicerequest_id) {
                  navigate('/hotline/servicerequest/' + servicerequest_id);
                }
                // If in intake workflow, redirect to Intake Summary
                else if (is_intake) {
                  navigate('/intake/summary');
                }
                // Else redirect to create a new SR.
                else {
                  navigate('/hotline/servicerequest/new?owner_id=' + (response.data.owner||'') + '&reporter_id=' + (reporter_id||'') + '&first_responder=' + is_first_responder);
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
          <Card border="secondary" className="mt-5">
            <Card.Header as="h5">{!id ? "New" : "Update"} Animal</Card.Header>
            <Card.Body>
              <BootstrapForm as={Form}>
                <Field type="hidden" value={owner_id||""} name="owner" id="owner"></Field>
                <Field type="hidden" value={servicerequest_id||""} name="request" id="request"></Field>
                <BootstrapForm.Row hidden={!id} className="mb-3">
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
                </BootstrapForm.Row>
                <BootstrapForm.Row>
                  <TextInput
                    id="name"
                    xs="8"
                    name="name"
                    type="text"
                    label="Animal Name"
                  />
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
                </BootstrapForm.Row>
                <BootstrapForm.Row>
                  <Col xs="2">
                    <DropDown
                      label="Species*"
                      id="speciesDropdown"
                      name="species"
                      type="text"
                      xs="2"
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
                      label="Size*"
                      id="sizeDropdown"
                      name="size"
                      type="text"
                      xs="4"
                      isClearable={false}
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
                      xs="4"
                      ref={ageRef}
                      options={ageChoices[props.values.species]}
                      value={props.values.age||''}
                      placeholder={placeholder}
                    />
                  </Col>
                </BootstrapForm.Row>
                <BootstrapForm.Row className="mt-3">
                  <Col xs="3">
                    <DropDown
                      label="Primary Color"
                      id="pcolor"
                      name="pcolor"
                      type="text"
                      className="mb-3"
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
                  <TextInput
                    id="color_notes"
                    name="color_notes"
                    as="textarea"
                    rows={5}
                    label="Description"
                    xs="7"
                  />
                </BootstrapForm.Row>
                <BootstrapForm.Row>
                  <Col xs="3">
                    <DropDown
                      label="Aggressive"
                      id="aggressive"
                      name="aggressive"
                      type="text"
                      className="mb-3"
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
                  <TextInput
                    label="Behavior Notes"
                    id="behavior_notes"
                    name="behavior_notes"
                    as="textarea"
                    rows={5}
                    xs="7"
                  />
                </BootstrapForm.Row>
                <BootstrapForm.Row>
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
                      label="Injured"
                      id="injured"
                      name="injured"
                      type="text"
                      options={unknownChoices}
                      value={props.values.injured||'unknown'}
                      isClearable={false}
                    />
                  </Col>
                  <DateTimePicker
                    label="Last Seen"
                    name="last_seen"
                    id="last_seen"
                    xs="4"
                    onChange={(date, dateStr) => {
                      props.setFieldValue("last_seen", dateStr)
                    }}
                    value={data.last_seen||null}
                  />
                </BootstrapForm.Row>
                <p className="mb-0">Image Files</p>
                <BootstrapForm.Row className="ml-3">
                  {data.front_image ?
                    <span style={{marginLeft:-15, marginRight:-15}} className="mt-2">
                      <Image width={131} src={data.front_image} alt="" thumbnail />
                      <div>
                        <FontAwesomeIcon icon={faMinusSquare} inverse onClick={() => clearImage("front_image")} style={{backgroundColor:"red"}} /><span className="ml-1">Front-Shot*</span>
                      </div>
                    </span> :
                    <ImageUploader
                      value={front_image}
                      id="front_image"
                      name="front_image"
                      parentStateSetter={wrapperSetFrontImage}
                      setFieldValue={props.setFieldValue}
                      label="Front-Shot*"
                      maxNumber={1}
                    />
                  }
                  <span className="ml-4 mr-4"></span>
                  {data.side_image ?
                    <span style={{marginLeft:-15, marginRight:-15}} className="mt-2">
                      <Image width={131} src={data.side_image} alt="" thumbnail />
                      <div>
                        <FontAwesomeIcon icon={faMinusSquare} inverse onClick={() => clearImage("side_image")} style={{backgroundColor:"red"}} /><span className="ml-1">Side-Shot*</span>
                      </div>
                    </span> :
                    <ImageUploader
                      value={side_image}
                      id="side_image"
                      name="side_image"
                      parentStateSetter={wrapperSetSideImage}
                      updateField={props.setFieldValue}
                      label="Side-Shot*"
                      maxNumber={1}
                    />
                  }
                  <span className="ml-4 mr-4"></span>
                  {data.extra_images.length > 0 ?
                    <span className="mr-3">
                      <span className="mt-2 row mr-0">
                        {data.extra_images.map(extra_image => (
                          <span key={extra_image} className="mr-3"><Image width={131} src={extra_image} alt="" thumbnail />
                            <div className="mb-2">
                              <FontAwesomeIcon icon={faMinusSquare} inverse onClick={() => clearImages(extra_image, props.setFieldValue)} style={{backgroundColor:"red"}} />
                              <span className="ml-1">Extra</span>
                            </div>
                          </span>
                        ))}
                      </span>
                    </span> : ""}
                    <ImageUploader
                      value={extra_images}
                      id="extra_images"
                      name="extra_images"
                      parentStateSetter={wrapperSetExtraImages}
                      updateField={props.setFieldValue}
                      label="Extra"
                      maxNumber={3 - data.extra_images.length}
                      multiple
                    />
                </BootstrapForm.Row>
            </BootstrapForm>
          </Card.Body>
          <ButtonGroup>
            <Button type="button" className="btn btn-success mr-1" onClick={() => {setAddAnother(false); props.submitForm()}}>Save</Button>
            {!id ? <Button type="button" className="btn btn-primary mr-1" onClick={() => {setAddAnother(true); props.submitForm()}}>Add Another</Button> : ""}
            <Link className="btn btn-secondary" href={servicerequest_id ? "/hotline/servicerequest/" + servicerequest_id : "/"}>Cancel</Link>
          </ButtonGroup>
          </Card>
        )}
      </Formik>
    </span>
  );
};
