import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import { navigate, useQueryParams } from 'raviger';
import { Field, Form, Formik } from "formik";
import { Col, Image } from 'react-bootstrap';
import { Button, ButtonGroup, Form as BootstrapForm } from "react-bootstrap";
import { Card } from 'react-bootstrap';
import * as Yup from 'yup';
import { AuthContext } from "../accounts/AccountsReducer";
import { TreeSelect } from 'antd';
import {AddressLookup, DateTimePicker, DropDown, ImageUploader, TextInput} from '.././components/Form.js';
import { catAgeChoices, dogAgeChoices, horseAgeChoices, otherAgeChoices, catColorChoices, dogColorChoices, horseColorChoices, otherColorChoices, speciesChoices, sexChoices, dogSizeChoices, catSizeChoices, horseSizeChoices, otherSizeChoices, unknownChoices } from './constants';
import { STATE_OPTIONS } from '../constants'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowAltCircleLeft, faMinusSquare } from '@fortawesome/free-solid-svg-icons';
import 'antd/lib/tree-select/style/css';
import Alert from 'react-bootstrap/Alert'

export const AnimalForm = (props) => {

  const { state } = useContext(AuthContext);
  const { TreeNode } = TreeSelect;
  const id = props.id;
  const back_target = props.state.steps.owner ? 'owner' : 'reporter'

  // Determine if this is an intake workflow.
  let is_intake = window.location.pathname.includes("intake")

  // Identify any query param data.
  const [queryParams] = useQueryParams();
  const {
    owner_id = null,
    servicerequest_id = null,
    reporter_id = null,
  } = queryParams;

  // Determine if we're in the hotline workflow.
  var is_workflow = window.location.pathname.includes("workflow")

  // Track species selected and update choice lists accordingly.
  const speciesRef = useRef(null);
  const sexRef = useRef(null);
  const sizeRef = useRef(null);
  const ageRef = useRef(null);
  const pcolorRef = useRef(null);
  const scolorRef = useRef(null);
  const ageChoices = {'':[], 'dog':dogAgeChoices, 'cat':catAgeChoices, 'horse':horseAgeChoices, 'other':otherAgeChoices}
  const colorChoices = {'':[], 'dog':dogColorChoices, 'cat':catColorChoices, 'horse':horseColorChoices, 'other':otherColorChoices}
  const sizeChoices = {'':[], 'dog':dogSizeChoices, 'cat':catSizeChoices, 'horse':horseSizeChoices, 'other':otherSizeChoices}

  // Track whether or not to add another animal after saving.
  const [addAnother, setAddAnother] = useState(false);

  // Dynamic placeholder value for options.
  const [placeholder, setPlaceholder] = useState("Select a species...");

  const [front_image, setFrontImage] = useState([]);
  const [side_image, setSideImage] = useState([]);
  const [extra_images, setExtraImages] = useState([]);
  const [reinitialize, setReinitialize] = useState(true);

  const initialData = {
    new_owner: owner_id,
    reporter: reporter_id,
    request: servicerequest_id,
    status: 'REPORTED',
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
    number_of_animals: 1,
    room: null,
    front_image: null,
    side_image: null,
    extra_images: [],
    address: '',
    apartment: '',
    city: '',
    state: '',
    zip_code: '',
    latitude: null,
    longitude: null,
  }
  let current_data = initialData;
  if (is_workflow && props.state.steps.animals[props.state.animalIndex]) {
    current_data = props.state.steps.animals[props.state.animalIndex];
  }

  // Initial Animal data.
  const [data, setData] = useState(current_data);
  const [shelters, setShelters] = useState({shelters: [],  isFetching: false});

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
  const clearImage = (image_name, setFieldValue) => {
    setData(prevState => ({ ...prevState, [image_name]:null }));
    setFieldValue(image_name, null);
  }

  // Removes an image from a multi file image field array.
  const clearImages = (image_url, setFieldValue) => {
    setData(prevState => ({ ...prevState, ["extra_images"]:data.extra_images.filter(url => url !== image_url) }));
    setFieldValue("extra_images", data.extra_images.filter(url => url !== image_url));
  }

  // Checks if Google API Key exists before rendering.
  const renderAddressLookup = ()=>{
    if(process.env.REACT_APP_GOOGLE_API_KEY){
      return <AddressLookup label="Found Location Search" style={{width: '100%'}} className="form-control"/>
    } else {
      return <Alert variant="danger">Found Location Search is not available. Please contact support for assistance.</Alert>
    }
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
          // Initialize number_of_animals because it's not returned by the serializer.
          response.data['number_of_animals'] = 1;
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

    const fetchShelters = async () => {
      setShelters({shelters: [], isFetching: true});
      // Fetch Shelter data.
      await axios.get('/shelter/api/shelter/', {
        cancelToken: source.token,
      })
      .then(response => {
        setShelters({shelters: response.data, isFetching: false});
      })
      .catch(error => {
        console.log(error.response);
        setShelters({shelters: [], isFetching: false});
      });
    };
    fetchShelters();

    // Cleanup.
    return () => {
      source.cancel();
    };
  }, [id]);
  
  return (
    <>
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
          number_of_animals: Yup.number().required('Required').positive('Value must be positive').integer('Value must be a whole number'),
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
          front_image: Yup.mixed(),
          side_image: Yup.mixed(),
          extra_images: Yup.array(),
          address: Yup.string(),
          apartment: Yup.string()
            .max(10, 'Must be 10 characters or less'),
          city: Yup.string(),
          state: Yup.string(),
          zip_code: Yup.string()
            .max(10, 'Must be 10 characters or less'),
          latitude: Yup.number()
            .nullable(),
          longitude: Yup.number()
            .nullable()
        })}
        onSubmit={(values, { setSubmitting, resetForm }) => {
          // Remove owner if animal has none.
          if (values["owner"]) {
            delete values["owner"];
          }

          // Use FormData so that image files may also be included.
          const formData = new FormData();
          // Convert json to FormData.
          for ( let key in values ) {
            if (values[key] !== null) {
              formData.append(key, values[key]);
            }
          }
          // Add extra images.
          for (let i = 0; i < extra_images.length; i++) {
            formData.append('extra' + (i + 1), extra_images[i].file);
          }

          if (is_workflow) {
            if (addAnother) {
              props.onSubmit('animals', values, 'animals');
              // Reset form data with existing animal data if we have it.
              if (props.state.steps.animals[props.state.animalIndex + 1]) {
                resetForm({values:props.state.steps.animals[props.state.animalIndex + 1]});
              }
              // Otherwise reset form with blank data.
              else {
                resetForm({values:initialData});
              }
            }
            else {
              props.onSubmit('animals', values, 'request');
            }
          }
          else if (id) {
            axios.put('/animals/api/animal/' + id + '/', formData)
            .then(function() {
              if (state.prevLocation) {
                navigate(state.prevLocation);
              }
              else {
                navigate('/animals/' + id);
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
                else {
                  navigate('/intake/animal/new?owner_id=' + (response.data.owner||'') + '&reporter_id=' + (reporter_id||''));
                }
              }
              else {
                // If SR already exists, redirect to the SR details.
                if (servicerequest_id) {
                  navigate('/hotline/servicerequest/' + servicerequest_id);
                }
                // If in intake workflow, redirect to Intake Summary
                else {
                  navigate('/intake/summary');
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
        {formikProps => (
          <Card border="secondary" className={is_workflow ? "mt-3" : "mt-5"}>
            <Card.Header as="h5" className="pl-3">{id ?
              <span style={{cursor:'pointer'}} onClick={() => window.history.back()} className="mr-3"><FontAwesomeIcon icon={faArrowAltCircleLeft} size="lg" inverse /></span>
              :
              <span>{props.state.animalIndex > 0 ? <span style={{cursor:'pointer'}} onClick={() => {formikProps.resetForm({values:props.state.steps.animals[props.state.animalIndex-1]}); props.handleBack('animals', 'animals')}} className="mr-3"><FontAwesomeIcon icon={faArrowAltCircleLeft} size="lg" inverse /></span>
              :
              <span style={{cursor:'pointer'}} onClick={() => {props.handleBack('animals', props.state.stepIndex > 1 ? 'owner' : 'reporter')}} className="mr-3"><FontAwesomeIcon icon={faArrowAltCircleLeft} size="lg" inverse /></span>}</span>}{!id ? "Animal Information" : "Update Animal"}</Card.Header>
            <Card.Body>
            <BootstrapForm as={Form}>
              <Field type="hidden" value={servicerequest_id||""} name="request" id="request"></Field>
              <Field type="hidden" value={data.latitude || ""} name="latitude" id="latitude"></Field>
              <Field type="hidden" value={data.longitude || ""} name="longitude" id="longitude"></Field>
                <BootstrapForm.Row>
                  <Col xs={id ? "6" : "5"}>
                    <DropDown
                      label="Species*"
                      id="speciesDropdown"
                      name="species"
                      type="text"
                      key={`my_unique_species_select_key__${formikProps.values.species}`}
                      ref={speciesRef}
                      options={speciesChoices}
                      value={formikProps.values.species||data.species}
                      isClearable={false}
                      onChange={(instance) => {
                        setPlaceholder("Select...")
                        sizeRef.current.select.clearValue();
                        ageRef.current.select.clearValue();
                        pcolorRef.current.select.clearValue();
                        scolorRef.current.select.clearValue();
                        formikProps.setFieldValue("species", instance === null ? '' : instance.value);
                      }}
                    />
                  </Col>
                  <Col xs={id ? "6" : "5"}>
                    <DropDown
                      label="Size*"
                      id="sizeDropdown"
                      name="size"
                      type="text"
                      isClearable={false}
                      key={`my_unique_size_select_key__${formikProps.values.size}`}
                      ref={sizeRef}
                      options={sizeChoices[formikProps.values.species]}
                      value={formikProps.values.size||''}
                      placeholder={placeholder}
                    />
                  </Col>
                  <TextInput
                    id="number_of_animals"
                    name="number_of_animals"
                    type="text"
                    xs="2"
                    label="No. of Animals"
                    hidden={id}
                  />
                </BootstrapForm.Row>
                <BootstrapForm.Row className="mt-3">
                  <Col xs="4">
                    <DropDown
                      label="Primary Color"
                      id="pcolor"
                      name="pcolor"
                      type="text"
                      className="mb-3"
                      key={`my_unique_pcolor_select_key__${formikProps.values.pcolor}`}
                      ref={pcolorRef}
                      options={colorChoices[formikProps.values.species]}
                      value={formikProps.values.pcolor||''}
                      placeholder={placeholder}
                    />
                    <DropDown
                      label="Secondary Color"
                      id="scolor"
                      name="scolor"
                      type="text"
                      key={`my_unique_scolor_select_key__${formikProps.values.scolor}`}
                      ref={scolorRef}
                      options={colorChoices[formikProps.values.species]}
                      value={formikProps.values.scolor||''}
                      placeholder={placeholder}
                    />
                  </Col>
                  <TextInput
                    id="color_notes"
                    name="color_notes"
                    as="textarea"
                    rows={5}
                    label="Description"
                    xs="8"
                  />
                </BootstrapForm.Row>
                <BootstrapForm.Row>
                  <TextInput
                    id="name"
                    xs="6"
                    name="name"
                    type="text"
                    label="Animal Name"
                  />
                  <Col xs="3">
                    <DropDown
                        label="Sex"
                        id="sexDropDown"
                        name="sex"
                        type="text"
                        key={`my_unique_sex_select_key__${formikProps.values.sex}`}
                        ref={sexRef}
                        options={sexChoices}
                        value={formikProps.values.sex||''}
                    />
                  </Col>
                  <Col xs="3">
                    <DropDown
                      label="Age"
                      id="age"
                      name="age"
                      type="text"
                      xs="4"
                      key={`my_unique_age_select_key__${formikProps.values.age}`}
                      ref={ageRef}
                      options={ageChoices[formikProps.values.species]}
                      value={formikProps.values.age||''}
                      placeholder={placeholder}
                    />
                  </Col>
                </BootstrapForm.Row>
                <BootstrapForm.Row>
                  <Col xs="4">
                    <DropDown
                      label="Aggressive"
                      id="aggressive"
                      name="aggressive"
                      type="text"
                      className="mb-3"
                      options={unknownChoices}
                      value={formikProps.values.aggressive||'unknown'}
                      isClearable={false}
                    />
                    <DropDown
                      label="Fixed"
                      id="fixed"
                      name="fixed"
                      type="text"
                      options={unknownChoices}
                      value={formikProps.values.fixed||'unknown'}
                      isClearable={false}
                    />
                  </Col>
                  <TextInput
                    label="Behavior Notes"
                    id="behavior_notes"
                    name="behavior_notes"
                    as="textarea"
                    rows={5}
                    xs="8"
                  />
                </BootstrapForm.Row>
                <BootstrapForm.Row>
                  <Col xs="4">
                    <DropDown
                      label="Confined"
                      id="confined"
                      name="confined"
                      type="text"
                      options={unknownChoices}
                      value={formikProps.values.confined||'unknown'}
                      isClearable={false}
                    />
                  </Col>
                  <Col xs="4">
                    <DropDown
                      label="Injured"
                      id="injured"
                      name="injured"
                      type="text"
                      options={unknownChoices}
                      value={formikProps.values.injured||'unknown'}
                      isClearable={false}
                    />
                  </Col>
                  <DateTimePicker
                    label="Last Seen"
                    name="last_seen"
                    id="last_seen"
                    xs="4"
                    key={`my_unique_last_seen_select_key__${formikProps.values.last_seen}`}
                    onChange={(date, dateStr) => {
                      formikProps.setFieldValue("last_seen", dateStr)
                    }}
                    value={formikProps.values.last_seen||null}
                  />
                </BootstrapForm.Row>
                <span hidden={is_workflow}>
                <p className="mb-0 mt-3">Image Files</p>
                <BootstrapForm.Row className="align-items-end">
                  {data.front_image ?
                    <span className="mt-2 ml-1 mr-3">
                      <Image width={131} src={data.front_image} alt="" thumbnail />
                      <div className="mb-2">
                        <FontAwesomeIcon icon={faMinusSquare} inverse onClick={() => clearImage("front_image", formikProps.setFieldValue)} style={{backgroundColor:"red"}} />
                        <span className="ml-1">Front-Shot</span>
                      </div>
                    </span> :
                    <div className="mb-2 ml-1">
                      <ImageUploader
                        value={front_image}
                        id="front_image"
                        name="front_image"
                        parentStateSetter={wrapperSetFrontImage}
                        label="Front-Shot"
                        maxNumber={1}
                      />
                    </div>
                  }
                  {data.side_image ?
                    <span className="mt-2 mr-3">
                      <Image width={131} src={data.side_image} alt="" thumbnail />
                      <div className="mb-2">
                        <FontAwesomeIcon icon={faMinusSquare} inverse onClick={() => clearImage("side_image", formikProps.setFieldValue)} style={{backgroundColor:"red"}} />
                        <span className="ml-1">Side-Shot</span>
                      </div>
                    </span> :
                    <div className="mb-2">
                      <ImageUploader
                        value={side_image}
                        id="side_image"
                        name="side_image"
                        parentStateSetter={wrapperSetSideImage}
                        label="Side-Shot"
                        maxNumber={1}
                      />
                    </div>
                  }
                  {data.extra_images.length > 0 ?
                    <span className="mt-2 d-flex flex-wrap align-items-end">
                      {data.extra_images.map(extra_image => (
                        <span key={extra_image} className="mr-3"><Image width={131} src={extra_image} alt="" thumbnail />
                          <div className="mb-2">
                            <FontAwesomeIcon icon={faMinusSquare} inverse onClick={() => clearImages(extra_image, formikProps.setFieldValue)} style={{backgroundColor:"red"}} />
                            <span className="ml-1">Extra</span>
                          </div>
                        </span>
                      ))}
                    </span>
                  :""}
                  <div className="mb-2">
                    <ImageUploader
                      value={extra_images}
                      id="extra_images"
                      name="extra_images"
                      parentStateSetter={wrapperSetExtraImages}
                      label="Extra"
                      maxNumber={3 - data.extra_images.length}
                      multiple
                    />
                  </div>
                </BootstrapForm.Row>
                </span>
                {/* Only show Shelter selection on intake and update. */}
                <span hidden={!Boolean(id)&&!is_intake}>
                <p className="mb-2 mt-2">Shelter</p>
                <BootstrapForm.Row>
                  <Col xs="8">
                    <TreeSelect
                      showSearch
                      style={{ width: '100%' }}
                      value={formikProps.values.room}
                      dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                      placeholder="Select a room..."
                      allowClear
                      treeDefaultExpandAll
                      onChange={(value) => {
                        formikProps.setFieldValue("room", value||null);
                      }}
                    >
                      {shelters.shelters.map(shelter => (
                        <TreeNode title={'Shelter: ' + shelter.name + ' ('+shelter.buildings.length+' buildings, ' + shelter.room_count + ' rooms, ' + shelter.animal_count + ' animals)'} key={'shelter'+shelter.id} selectable={false} value={'shelter'+shelter.id}>
                          {shelter.buildings.map(building => (
                            <TreeNode title={'Building: ' + building.name + ' (' + building.rooms.length + ' rooms, ' + building.animal_count + ' animals)'} key={'building'+building.id} selectable={false} value={'building'+building.id}>
                              {building.rooms.map(room => (
                                <TreeNode title={room.name+' ('+room.animals.length+' animals)'} key={room.id} value={room.id}/>
                              ))}
                            </TreeNode>
                          ))}
                        </TreeNode>
                      ))}
                    </TreeSelect>
                  </Col>
                </BootstrapForm.Row>
                <p/>
                <BootstrapForm.Row hidden={!reporter_id}>
                  <BootstrapForm.Group as={Col} xs="12">
                    {renderAddressLookup()}
                  </BootstrapForm.Group>
                </BootstrapForm.Row>
                <BootstrapForm.Row hidden={!reporter_id}>
                  <TextInput
                    xs="12"
                    type="text"
                    label="Found Location Address"
                    name="address"
                    disabled
                  />
                </BootstrapForm.Row>
                <BootstrapForm.Row hidden={!reporter_id}>
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
                    placeholder=''
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
                </span>
            </BootstrapForm>
          </Card.Body>
          <ButtonGroup size="lg">
            {!id ?
              <Button type="button" onClick={() => {setAddAnother(true); formikProps.submitForm()}}>{props.state.steps.animals.length -1 > props.state.animalIndex ? "Next Animal" : "Add Another"}</Button>
            :
              <Button type="button" onClick={() => {setAddAnother(false); formikProps.submitForm()}}>Save</Button>
            }
            {is_workflow ? <Button type="button" className="btn btn-primary mr-1 border" onClick={() => {setAddAnother(false); formikProps.submitForm()}}>Next Step</Button> : ""}
          </ButtonGroup>
          </Card>
        )}
      </Formik>
    </>
  );
};
