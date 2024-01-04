import React, { createRef, useContext, useEffect, useRef, useState } from 'react';
import axios from "axios";
import { Link, navigate } from "raviger";
import { Field, Form, Formik, } from 'formik';
import { Switch } from 'formik-material-ui';
import useDynamicRefs from 'use-dynamic-refs';
import {
  useOrderedNodes
} from "react-register-nodes";
import smoothScrollIntoView from "smooth-scroll-into-view-if-needed";
import {
  Button,
  ButtonGroup,
  Card,
  Col,
  Collapse,
  Form as BootstrapForm,
  FormGroup,
  ListGroup,
  Row,
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowAltCircleLeft, faChevronCircleDown, faChevronCircleRight
} from '@fortawesome/free-solid-svg-icons';
import * as Yup from 'yup';
import { useRegisteredRef } from "react-register-nodes";
import ButtonSpinner from '../components/ButtonSpinner';
import { DropDown, TextInput } from '../components/Form';
import { SystemErrorContext } from '../components/SystemError';
import { catAgeChoices, dogAgeChoices, horseAgeChoices, otherAgeChoices, sexChoices } from '../animals/constants';

// From https://stackoverflow.com/a/71290404
function createYupSchema(schema, config) {
  const { id, validationType, validations = [] } = config;
  if (!Yup[validationType]) {
    return schema;
  }
  let validator = Yup[validationType]();
  validations.forEach((validation) => {
    const { params, type } = validation;
    if (!validator[type]) {
      return;
    }
    if (type === "when") {
      const { is, then, otherwise } = params[1];
      let whenParams = {};
      whenParams.is = is;
      whenParams.then = (schema) => schema[then[0].type](...then[0].params);

      if (otherwise) {
        whenParams.otherwise = (schema) =>
          schema[otherwise[0].type](...otherwise[0].params);
      }

      validator = validator["when"](params[0], whenParams);
    } else {
      validator = validator[type](...params);
    }
  });
  schema[id] = validator;
  return schema;
}

const VetRequestExamForm = (props) => {

  const { setShowSystemError } = useContext(SystemErrorContext);

  // Determine if we're in the vet exam workflow.
  var is_workflow = window.location.pathname.includes("workflow");

  const [data, setData] = useState({id: '', patient:{}, assignee:{}, exam: null, open: '', assigned:'', closed: '', concern: '', priority: '', diagnosis: '', other_diagnosis:'', treatment_plans:[], presenting_complaints:[], exam_object: {'vetrequest_id':props.id, 'confirm_sex_age':false, 'confirm_chip':false, 'weight':null, 'weight_unit':'', 'temperature':'', 'temperature_method':'', 'comments':''}, animal_object: {id:'', name:'', species:'', category:'', sex:'', age:'', size:'', pcolor:'', scolor:'', medical_notes:''}})
  const [examQuestions, setExamQuestions] = useState([]);
  const [showNotes, setShowNotes] = useState({});
  const [getRef, setRef] = useDynamicRefs();
  const ordered = useOrderedNodes();
  const [shouldCheckForScroll, setShouldCheckForScroll] = React.useState(false);
  const [formSchema, setFormSchema] = useState([{
    id:'confirm_sex_age',
    validationType:"bool",
    validations: [{
      type:'oneOf',
      params: [[true], "Age/Sex must be confirmed"]
    },]},{
    id:'confirm_chip',
    validationType:"bool"},{
      id:'microchip',
      validationType:"string",
      validations: [{
        type:'max',
        params: [50, "Max of 50 characters allowed"]
      },]},{
    id:'weight',
    validationType:"number",
    validations: [
    {
      type:'nullable',
      params: []
    },
  ]
  },{
    id:'weight_unit',
    validationType:"string"},{
    id:'temperature',
    validationType:"string"},{
    id:'temperature_method',
    validationType:"string",
    validations: [{
      type:'required',
      params: ["This field is required"]
    },]},
  ]);
  const ageChoices = {'':[], 'dog':dogAgeChoices, 'cat':catAgeChoices, 'horse':horseAgeChoices, 'other':otherAgeChoices}

  // Hook scrolling to top error.
  useEffect(() => {
    if (shouldCheckForScroll && ordered.length > 0) {
      smoothScrollIntoView(ordered[0], {
        scrollMode: "if-needed",
        block: "center",
        inline: "start"
      }).then(() => {
        if (ordered[0].querySelector("input")) {
          ordered[0].querySelector("input").focus();
        }
        setShouldCheckForScroll(false);
      });
    }
    // Cleanup.
    return () => {
    };
  }, [shouldCheckForScroll, ordered]);

  useEffect(() => {
    let unmounted = false;
    let source = axios.CancelToken.source();
    let open_notes_dict = {};
    if (props.id) {
      const fetchExam = async () => {
        // Fetch VetRequest + Exam data.
        await axios.get('/vet/api/vetrequest/' + props.id + '/', {
          cancelToken: source.token,
        })
        .then(response => {
          if (!unmounted) {
            // Unpack existing answers and set at exam_object level.
            if (response.data.exam) {
              Object.keys(response.data.exam_object.answers).forEach(key => {
                response.data.exam_object[key] = response.data.exam_object.answers[key];
                if (key.includes('_notes') && response.data.exam_object.answers[key]) {
                  open_notes_dict[key.split('_notes')[0]] = true;
                }
              })
            }
            else {
              response.data.exam_object = data.exam_object;
            }
            response.data.exam_object['vetrequest_id'] = props.id
            response.data.exam_object['age'] = response.data.animal_object.age
            response.data.exam_object['sex'] = response.data.animal_object.sex
            response.data.exam_object['microchip'] = response.data.animal_object.microchip

            // Fetch exam question data.
            axios.get('/vet/api/examquestions/', {
              cancelToken: source.token,
            })
            .then(questionResponse => {
              if (!unmounted) {
                let config = [...formSchema];
                // Filter the questions by the animal category.
                let filtered_data = questionResponse.data.filter(question => question.categories.includes(response.data.animal_object.category))
                setExamQuestions(filtered_data);
                filtered_data.forEach(question => {
                  if (!response.data.exam) {
                    response.data.exam_object[question.name.toLowerCase().replace(' ','_').replace('/','_')] = '';
                    response.data.exam_object[question.name.toLowerCase().replace(' ','_').replace('/','_') + '_notes'] = '';
                  }
                  // Set open notes defaults.
                  open_notes_dict[question.name.toLowerCase().replace(' ','_').replace('/','_')] = open_notes_dict[question.name.toLowerCase().replace(' ','_').replace('/','_')] === true ? true : question.open_notes;
                  // Create a dynamic config for Yup validation.
                  config.push({
                    id:question.name.toLowerCase().replace(' ','_').replace('/','_'),
                    validationType:"string",
                    validations: [{
                      type:'required',
                      params: ["This field is required"]
                    },
                    {
                      type:'nullable',
                      params: []
                    },
                  ]
                  })
                  config.push({
                    id:question.name.toLowerCase().replace(' ','_').replace('/','_') + '_notes',
                    validationType:"string",
                    validations: [
                      {
                        type:'max',
                        params: [300, "Max of 300 characters allowed"]
                      },
                      {
                        type: "when",
                        params: [
                          question.name.toLowerCase().replace(' ','_').replace('/','_'),
                          {
                            is: 'Other',
                            then: [
                              {
                                type: "required",
                                params: ["This field is required"],
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  })
                });
                const schema = config.reduce(createYupSchema, {});
                setFormSchema(schema);
                setShowNotes(open_notes_dict);
                setData(response.data);
              }
            })
            .catch(error => {
              setShowSystemError(true);
            });
          }
        })
        .catch(error => {
          setShowSystemError(true);
        });
      };

      fetchExam();
    };

    // Cleanup.
    return () => {
      unmounted = true;
      source.cancel();
    };
  }, [props.id]);

  return (
    <Formik
      initialValues={data.exam_object}
      enableReinitialize={true}
      validateOnChange={false}
      validationSchema={Yup.object().shape(formSchema)}
      onSubmit={(values, { setSubmitting }) => {
        values['animal_id'] = data.animal_object.id
        if (data.exam) {
          axios.put('/vet/api/exam/' + data.exam + '/', values)
          .then(response => {
            if (is_workflow) {
              props.onSubmit('exam', values, 'diagnostics');
            }
            else {
              navigate('/' + props.organization + '/' + props.incident + '/vet/vetrequest/' + props.id)
            }
          })
          .catch(error => {
            setShowSystemError(true);
          });
          setSubmitting(false);
        }
        else {
          axios.post('/vet/api/exam/', values)
          .then(response => {
            if (is_workflow) {
              props.onSubmit('exam', values, 'diagnostics');
            }
            else {
              navigate('/' + props.organization + '/' + props.incident + '/vet/vetrequest/' + props.id)
            }
          })
          .catch(error => {
            setShowSystemError(true);
          });
          setSubmitting(false);
        }
      }}
    >
      {formikProps => (
        <Card border="secondary" className="mt-3">
          <Card.Header as="h5" className="pl-3"><span style={{ cursor: 'pointer' }} onClick={() => navigate('/' + props.organization + '/' + props.incident + '/vet/vetrequest/' + props.id + '/')} className="mr-3"><FontAwesomeIcon icon={faArrowAltCircleLeft} size="lg" inverse /></span>Veterinary Exam Form</Card.Header>
          <div className="col-12 mt-3">
            <Card className="border rounded" style={{width:"100%"}}>
              <Card.Body>
                <Card.Title>
                  <h4 className="mb-0">Patient</h4>
                </Card.Title>
                <hr/>
                <ListGroup variant="flush" style={{marginTop:"-13px", marginBottom:"-13px"}}>
                  <ListGroup.Item>
                    <div className="row" style={{textTransform:"capitalize"}}>
                      <span className="col-3"><b>ID:</b> <Link href={"/" + props.organization + "/" + props.incident + "/animals/" + data.animal_object.id} className="text-link" style={{textDecoration:"none", color:"white"}}>A#{data.animal_object.id}</Link></span>
                      <span className="col-3"><b>Name:</b> {data.animal_object.name||"Unknown"}</span>
                      <span className="col-3"><b>Species:</b> {data.animal_object.species_string}</span>
                    </div>
                  </ListGroup.Item>
                  <ListGroup.Item>
                      <span><b>Medical Notes:</b> {data.animal_object.medical_notes || "N/A"}</span>
                  </ListGroup.Item>
                </ListGroup>
              </Card.Body>
            </Card>
          </div>
          <Card.Body>
            <Form>
              <FormGroup>
              <Row>
                <Col xs="2">
                  <BootstrapForm.Label htmlFor="confirm_sex_age" style={{marginBottom:"-5px"}}>Confirm Age/Sex</BootstrapForm.Label>
                  <div style={{marginLeft:"20px"}}><Field component={Switch} name="confirm_sex_age" type="checkbox" color="primary" /></div>
                  {formikProps.errors['confirm_sex_age'] ? <div style={{ color: "#e74c3c", marginTop: ".5rem", fontSize: "80%" }}>{formikProps.errors['confirm_sex_age']}</div> : ""}
                </Col>
                <Col xs="2">
                  <DropDown
                    label="Age"
                    id="age"
                    name="age"
                    type="text"
                    xs="4"
                    key={`my_unique_age_select_key__${formikProps.values.age}`}
                    options={Object.keys(ageChoices).includes(data.animal_object.species) ? ageChoices[data.animal_object.species] : ageChoices['other']}
                    value={formikProps.values.age||data.animal_object.age}
                    isClearable={false}
                    disabled={formikProps.values.confirm_sex_age}
                  />
                </Col>
                <Col xs="2" style={{paddingLeft:"0px", marginLeft:"-5px"}}>
                  <DropDown
                    label="Sex"
                    id="sexDropDown"
                    name="sex"
                    type="text"
                    key={`my_unique_sex_select_key__${formikProps.values.sex}`}
                    options={sexChoices}
                    isClearable={false}
                    disabled={formikProps.values.confirm_sex_age}
                    value={formikProps.values.sex||data.animal_object.age}
                  />
                </Col>
              </Row>
              <Row className="mt-3">
                <Col xs="2">
                  <BootstrapForm.Label htmlFor="confirm_chip" style={{marginBottom:"-5px"}}>Microchip Present</BootstrapForm.Label>
                  <div style={{marginLeft:"20px"}}><Field component={Switch} name="confirm_chip" type="checkbox" color="primary" /></div>
                </Col>
                <TextInput
                    id="microchip"
                    name="microchip"
                    type="text"
                    label="Microchip"
                    xs="3"
                    disabled={!formikProps.values.confirm_chip}
                    value={formikProps.values.microchip || data.animal_object.microchip}
                  />
              </Row>
              <Row style={{marginBottom:"-15px"}}>
                <TextInput
                  id="weight"
                  name="weight"
                  type="text"
                  label="Weight"
                  xs="3"
                  value={data.weight || formikProps.values.weight}
                />
                <Col xs="1" className="pl-0" style={{marginBottom:"-2px", marginLeft:"-5px"}}>
                  <DropDown
                    id={"weight_unit"}
                    name={"weight_unit"}
                    type="text"
                    label="Unit"
                    placeholder=""
                    options={[{value:'g', label:'g'}, {value:'kg', label:'kg'}]}
                    isClearable={false}
                  />
                </Col>
              </Row>
              <Row className="mt-3" style={{marginBottom:"-15px"}}>
                <TextInput
                  id="temperature"
                  name="temperature"
                  type="text"
                  label="Temperature (F)"
                  xs="2"
                />
                <Col xs="2" className="pl-0" style={{marginLeft:"-5px"}}>
                  <DropDown
                    key={formikProps.values['temperature_method']}
                    id={"temperature_method"}
                    name={"temperature_method"}
                    type="text"
                    label="Method"
                    placeholder=""
                    options={[{value:'Axillary', label:'Axillary'}, {value:'Rectal', label:'Rectal'}, {value:'Not taken', label:'Not taken'}, {value:'Unable to obtain', label:'Unable to obtain'}]}
                    isClearable={false}
                    onChange={(instance) => {
                      formikProps.setFieldValue('temperature_method', instance === null ? '' : instance.value);
                    }}
                  />
                </Col>
              </Row>
              {examQuestions.map((question, index) =>
                <span key={question.id}>
                  <Row className="mt-3" style={{marginBottom:"4px"}}>
                    <Col xs="2" className="pr-0">
                      {question.name}
                    </Col>
                    <Col xs="2" className="pl-0 pr-0" style={{marginLeft:"-5px"}}>
                      {question.allow_not_examined ? 
                      <span>
                        <input
                          id="allow_not_examined"
                          type="checkbox"
                          className="ml-3"
                          checked={formikProps.values[question.name.toLowerCase().replace(' ','_').replace('/','_')] === 'Not examined'}
                          onChange={() => {
                            formikProps.values[question.name.toLowerCase().replace(' ','_').replace('/','_')] === 'Not examined' ? formikProps.setFieldValue(question.name.toLowerCase().replace(' ','_').replace('/','_'), null) : formikProps.setFieldValue(question.name.toLowerCase().replace(' ','_').replace('/','_'), 'Not examined');
                            formikProps.setFieldValue(question.name.toLowerCase().replace(' ','_').replace('/','_') + '_id', question.id);
                            if (formikProps.values[question.name.toLowerCase().replace(' ','_').replace('/','_')] !== 'Not examined') {
                              showNotes[question.name.toLowerCase().replace(' ','_').replace('/','_')] = true;
                              setTimeout(() => (getRef(question.name).current.focus(),3000))
                            }
                          }}
                        />
                        <span>&nbsp;&nbsp;Not examined</span>
                      </span> : ""}
                    </Col>
                  </Row>
                  <Row>
                    <Col xs="4">
                      <DropDown
                        id={question.name.toLowerCase().replace(' ','_').replace('/','_')}
                        name={question.name.toLowerCase().replace(' ','_').replace('/','_')}
                        type="text"
                        key={`my_unique_question_select_key__${formikProps.values[question.name.toLowerCase().replace(' ','_').replace('/','_')]}`}
                        options={formikProps.values[question.name.toLowerCase().replace(' ','_').replace('/','_')] === 'Not examined' ? [{value:'Not examined', label:'Not examined'}] : question.options.map(option => ({'value':option, 'label':option}))}
                        isClearable={false}
                        onChange={(instance) => {
                          formikProps.setFieldValue(question.name.toLowerCase().replace(' ','_').replace('/','_'), instance === null ? '' : instance.value);
                          formikProps.setFieldValue(question.name.toLowerCase().replace(' ','_').replace('/','_') + '_id', instance === null ? '' : question.id);
                          if (instance.value === 'Other') {
                            showNotes[question.name.toLowerCase().replace(' ','_').replace('/','_')] = true;
                            setTimeout(() => (getRef(question.name).current.focus(),3000))
                          }
                        }}
                      />
                    </Col>
                    <Col xs="1" style={{marginTop:"15px", minWidth:"95px"}}>
                      {"Notes"}
                      <FontAwesomeIcon icon={faChevronCircleRight} hidden={Object.keys(showNotes).length ? showNotes[question.name.toLowerCase().replace(' ','_').replace('/','_')] : true} onClick={() => {setShowNotes(prevState => ({ ...prevState, [question.name.toLowerCase().replace(' ','_').replace('/','_')]:true }));setTimeout(() => (getRef(question.name).current.focus(),3000));}} className="ml-1" style={{cursor:'pointer'}} inverse />
                      <FontAwesomeIcon icon={faChevronCircleDown} hidden={Object.keys(showNotes).length ? !showNotes[question.name.toLowerCase().replace(' ','_').replace('/','_')] : true} onClick={() => {setShowNotes(prevState => ({ ...prevState, [question.name.toLowerCase().replace(' ','_').replace('/','_')]:false }));}} className="ml-1" style={{cursor:'pointer'}} inverse />
                    </Col>
                  </Row>
                  <Collapse in={showNotes[question.name.toLowerCase().replace(' ','_').replace('/','_')]}>
                    <div className="mt-2">
                      <TextInput
                        as="textarea"
                        name={question.name.toLowerCase().replace(' ','').replace('/','') + "_notes"}
                        id={question.name.toLowerCase().replace(' ','_').replace('/','_') + "_notes"}
                        key={`my_unique_question_notes_key__${formikProps.values[question.name.toLowerCase().replace(' ','_').replace('/','_') + '_notes']}`}
                        ref={setRef(question.name)}
                        xs="5"
                        rows={3}
                        style={{marginLeft:"-15px", margTop:"-2px"}}
                        errstyle={{marginLeft:"-15px"}}
                        colstyle={{paddingRight:"0px"}}
                      />
                    </div>
                  </Collapse>
                </span>
                )}
              </FormGroup>
            </Form>
          </Card.Body>
          <ButtonGroup>
            <ButtonSpinner isSubmitting={formikProps.isSubmitting} isSubmittingText="Saving..."  type="submit" className="btn btn-primary" onClick={() => { setShouldCheckForScroll(true);formikProps.submitForm(); }}>{is_workflow ? "Next" : "Save"}</ButtonSpinner>
          </ButtonGroup>
        </Card>
      )}
    </Formik>
  );
};

export default VetRequestExamForm;
