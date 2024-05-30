import React, { createRef, useContext, useEffect, useRef, useState } from 'react';
import axios from "axios";
import { Link, navigate, useQueryParams } from "raviger";
import { Field, Form, Formik, } from 'formik';
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
import { DateTimePicker, DropDown, TextInput, ToggleSwitch } from '../components/Form';
import { SystemErrorContext } from '../components/SystemError';
import { catAgeChoices, dogAgeChoices, horseAgeChoices, otherAgeChoices, sexChoices } from '../animals/constants';
import Patient from './components/Patient';
import { AuthContext } from "../accounts/AccountsReducer";

const initialSchemaData = [{
  id:'assignee',
  validationType:"number",
  validations: [{
    type:'nullable',
    params: []
  },{
    type:'required',
    params: ["Required"]
  },]},{
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
    type:'required',
    params: ["Required"]
  },
]
},{
  id:'weight_unit',
  validationType:"string",
  validations: [{
    type:'required',
    params: ["Required"]
  },]},{
    id:'weight_estimated',
    validationType:"bool"},{
  id:'temperature',
  validationType:"string"},{
  id:'temperature_method',
  validationType:"string",
  validations: [{
    type:'required',
    params: ["Required"]
  },]},{
    id:'pulse',
    validationType:"number",
    validations: [
    {
      type:'nullable',
      params: []
    },
    {
      type:'required',
      params: ["Required"]
    },
  ]
  },{
    id:'respiratory_rate',
    validationType:"string",
    validations: [
    {
      type:'nullable',
      params: []
    },
    {
      type:'required',
      params: ["Required"]
    },
  ]
  },{
    id:'medical_plan',
    validationType:"string",
    validations: [
    {
      type:'nullable',
      params: []
    },
  ]
  },
]

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

const ExamForm = (props) => {

  // Identify any query param data.
  const [queryParams] = useQueryParams();
  const {
    vetrequest_id = null,
  } = queryParams;

  const { dispatch, state } = useContext(AuthContext);
  const { setShowSystemError } = useContext(SystemErrorContext);

  // Determine if we're in the vet exam workflow.
  var is_workflow = window.location.pathname.includes("workflow");

  const initialData = {id: '', exam: null, open: '', exam_object: {'medrecord_id':props.medrecordid, vetrequest_id:vetrequest_id, 'confirm_sex_age':false, 'confirm_chip':false, 'weight':null, 'weight_unit':'', 'weight_estimated':false, 'temperature':'', 'temperature_method':'Rectal', 'pulse':'', 'respiratory_rate':'', 'medical_plan':''}, animal_object: {id:'', name:'', species:'', species_string: '', category:'', sex:'', age:'', fixed:'', size:'', pcolor:'', scolor:'', medical_notes:''}, vet_requests:[]}

  let current_data = {...initialData}
  if (is_workflow) {
    current_data['exam_object'] = props.state.steps.exam;
  }

  const [data, setData] = useState(current_data);
  const [examQuestions, setExamQuestions] = useState([]);
  const [showNotes, setShowNotes] = useState({});
  const [saveAndFinish, setSaveAndFinish] = useState(false);
  const [getRef, setRef] = useDynamicRefs();
  const ordered = useOrderedNodes();
  const [shouldCheckForScroll, setShouldCheckForScroll] = React.useState(false);
  const [assigneeChoices, setAssigneeChoices] = useState([]);
  const [formSchema, setFormSchema] = useState([]);
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
    
    const fetchExamQuestionData = async () => {
      // Fetch exam question data.
      axios.get('/vet/api/examquestions/', {
        cancelToken: source.token,
      })
      .then(questionResponse => {
        if (!unmounted) {
          const filterDataBySpecies = (response) => {
            let config = [...initialSchemaData];
            // Filter the questions by the animal category.
            let filtered_data = questionResponse.data.filter(question => question.categories.includes(response.data.animal_object.category))
            setExamQuestions(filtered_data);
            filtered_data.forEach(question => {
              if (props.state && !props.state.steps.exam.id) {
                response.data.exam_object[question.name.toLowerCase().replace(' ','_').replace('/','_')] = props.state.steps.exam[question.name.toLowerCase().replace(' ','_').replace('/','_')] || question.default;
                response.data.exam_object[question.name.toLowerCase().replace(' ','_').replace('/','_') + '_notes'] = props.state.steps.exam[question.name.toLowerCase().replace(' ','_').replace('/','_') + '_notes'] || '';
                response.data.exam_object[question.name.toLowerCase().replace(' ','_').replace('/','_') + '_id'] = question.id;

                if (props.state.steps.exam[question.name.toLowerCase().replace(' ','_').replace('/','_') + '_notes']) {
                  open_notes_dict[question.name.toLowerCase().replace(' ','_').replace('/','_')] = true;
                }
              }
              // Set open notes defaults.
              open_notes_dict[question.name.toLowerCase().replace(' ','_').replace('/','_')] = open_notes_dict[question.name.toLowerCase().replace(' ','_').replace('/','_')] === true ? true : false;
              // Create a dynamic config for Yup validation.
              config.push({
                id:question.name.toLowerCase().replace(' ','_').replace('/','_'),
                validationType:"string",
                validations: [{
                  type:'required',
                  params: ["Required"]
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
                            params: ["Required"],
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
          }
          if (props.medrecordid) {
            // Fetch MedRecord data.
            axios.get('/vet/api/medrecord/' + props.medrecordid + '/', {
              cancelToken: source.token,
            })
            .then(response => {
              if (!unmounted) {
                response.data.exam_object = data.exam_object;
                response.data.exam_object['medrecord_id'] = props.medrecordid
                response.data.exam_object['age'] = response.data.animal_object.age
                response.data.exam_object['sex'] = response.data.animal_object.sex
                response.data.exam_object['microchip'] = response.data.animal_object.microchip
                response.data.exam_object['fixed'] = response.data.animal_object.fixed
                filterDataBySpecies(response);
                setData(response.data);
                props.handleMedicalRecord(response.data);
              }
            })
            .catch(error => {
              setShowSystemError(true);
            });
          }
          if (props.id) {
            const fetchExamData = async () => {
              // Fetch exam data.
              await axios.get('/vet/api/exam/' + props.id + '/', {
                cancelToken: source.token,
              })
              .then(response => {
                if (!unmounted) {
                  response.data.answers.forEach(answer => {
                    response.data[answer.name.toLowerCase().replace(' ','_').replace('/','_')] = answer.answer;
                    response.data[answer.name.toLowerCase().replace(' ','_').replace('/','_') + '_notes'] = answer.answer_notes;
                    response.data[answer.name.toLowerCase().replace(' ','_').replace('/','_') + '_id'] = answer.question;
                  });
      
                  response.data['age'] = response.data.animal_object.age
                  response.data['sex'] = response.data.animal_object.sex
                  response.data['microchip'] = response.data.animal_object.microchip
                  response.data['fixed'] = response.data.animal_object.fixed
                  filterDataBySpecies(response);
                  setData(response.data);
                }
              })
              .catch(error => {
                setShowSystemError(true);
              });
            };
            fetchExamData();
          }
        }
      })
      .catch(error => {
        setShowSystemError(true);
      });
    };

    fetchExamQuestionData();

    const fetchAssignees = async () => {
      // Fetch assignee data.
      await axios.get('/accounts/api/user/?vet=true&organization=' + state.organization.id, {
        cancelToken: source.token,
      })
      .then(response => {
        if (!unmounted) {
          let options = [];
          response.data.forEach(function(person) {
            options.unshift({value: person.id, label: person.first_name + ' ' + person.last_name})
          });
          setAssigneeChoices(options);
        }
      })
      .catch(error => {
        setShowSystemError(true);
      });
    };
    fetchAssignees();

    // Cleanup.
    return () => {
      unmounted = true;
      source.cancel();
    };
  }, [props.medrecordid]);

  return (
    <Formik
      initialValues={props.id ? data : data.exam_object}
      enableReinitialize={true}
      validateOnChange={false}
      validationSchema={Yup.object().shape(formSchema)}
      onSubmit={(values, { setSubmitting }) => {
        values['animal_id'] = data.animal_object.id;
        values['vetrequest_id'] = vetrequest_id;
        if (props.id || values.exam) {
          axios.put('/vet/api/exam/' + (props.id || values.exam) + '/', values)
          .then(response => {
            if (is_workflow) {
              if (saveAndFinish) {
                navigate('/' + props.organization + '/' + props.incident + '/vet/medrecord/' + props.medrecordid);
              }
              else {
                props.onSubmit('exam', values, 'diagnostics');
              }
            }
            else {
              navigate('/' + props.organization + '/' + props.incident + '/vet/medrecord/' + data.medical_record);
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
              if (saveAndFinish) {
                navigate('/' + props.organization + '/' + props.incident + '/vet/medrecord/' + props.medrecordid);
              }
              else {
                values['exam'] = response.data.id;
                props.onSubmit('exam', values, 'orders');
              }
            }
            else {
              navigate('/' + props.organization + '/' + props.incident + '/vet/medrecord/' + props.medrecordid)
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
          <Card.Header as="h5" className="pl-3"><span style={{ cursor: 'pointer' }} onClick={() => navigate('/' + props.organization + '/' + props.incident + '/vet/medrecord/' + (is_workflow ? props.medrecordid : data.medical_record) + '/')} className="mr-3"><FontAwesomeIcon icon={faArrowAltCircleLeft} size="lg" inverse /></span>Veterinary Exam Form</Card.Header>
          <Patient animal={data.animal_object} vet_request={vetrequest_id && data.vet_requests.length > 0 ? data.vet_requests.filter(vr => vr.id === Number(vetrequest_id))[0] : data.vet_request_object} organization={props.organization} incident={props.incident} />
          <Card.Body>
            <Form>
              <FormGroup>
                <BootstrapForm.Row>
                  <Col xs={"4"}>
                    <DropDown
                      label="Examiner*"
                      id="assigneeDropdown"
                      name="assignee"
                      type="text"
                      key={`my_unique_assignee_select_key__${formikProps.values.assignee}`}
                      options={assigneeChoices}
                      isClearable={false}
                      onChange={(instance) => {
                        formikProps.setFieldValue("assignee", instance === null ? '' : instance.value);
                      }}
                    />
                  </Col>
                </BootstrapForm.Row>
                {props.id ? <BootstrapForm.Row className="mt-3 pl-0">
                  <DateTimePicker
                    label="Performed"
                    name="open"
                    id="open"
                    xs="4"
                    onChange={(date, dateStr) => {
                      formikProps.setFieldValue("open", dateStr)
                    }}
                    value={formikProps.values.open||null}
                  />
                </BootstrapForm.Row> : ""}
                <BootstrapForm.Row className="mt-3">
                  <Col xs="2">
                    <ToggleSwitch id="confirm_sex_age" name="confirm_sex_age" label="Confirm Age/Sex*" disabled={!formikProps.values.age && !formikProps.values.sex} />
                    {/* <BootstrapForm.Label htmlFor="confirm_sex_age" style={{marginBottom:"-5px"}}>Confirm Age/Sex</BootstrapForm.Label>
                    <div style={{marginLeft:"20px"}}><Field component={Switch} name="confirm_sex_age" type="checkbox" color="primary" disabled={!formikProps.values.age && !formikProps.values.sex} /></div>
                    {formikProps.errors['confirm_sex_age'] ? <div style={{ color: "#e74c3c", marginTop: ".5rem", fontSize: "80%" }}>{formikProps.errors['confirm_sex_age']}</div> : ""} */}
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
                  <Col xs="2">
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
                  <Col xs="2">
                    <DropDown
                      label="Altered"
                      id="fixedDropDown"
                      name="fixed"
                      type="text"
                      key={`my_unique_fixed_select_key__${formikProps.values.fixed}`}
                      options={[{value:'yes', label:'Yes'},{value:'no', label:'No'}]}
                      isClearable={false}
                      disabled={formikProps.values.confirm_sex_age}
                      value={formikProps.values.fixed||data.animal_object.age}
                    />
                  </Col>
                </BootstrapForm.Row>
                <Row className="mt-3">
                  <Col xs="2">
                    <ToggleSwitch id="confirm_chip" name="confirm_chip" label="Microchip Present" disabled={false} />
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
                <BootstrapForm.Row style={{marginBottom:"-15px"}}>
                  <TextInput
                    id="weight"
                    name="weight"
                    type="text"
                    label="Weight*"
                    xs="3"
                    value={data.weight || formikProps.values.weight || ''}
                  />
                  <Col xs="1" style={{marginBottom:"-2px"}}>
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
                  <input
                    id="weight_estimated"
                    name="weight_estimated"
                    type="checkbox"
                    className="ml-3"
                    checked={formikProps.values['weight_estimated']}
                    onChange={() => {
                      formikProps.setFieldValue('weight_estimated', !formikProps.values['weight_estimated']);
                    }}
                    style={{marginTop:"-60px"}}
                  />
                  <span>&nbsp;&nbsp;Estimated</span>
                </BootstrapForm.Row>
                <BootstrapForm.Row className="mt-3" style={{marginBottom:"-15px"}}>
                  <TextInput
                    id="temperature"
                    name="temperature"
                    type="text"
                    label="Temperature (F)*"
                    xs="2"
                  />
                  <Col xs="2">
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
                </BootstrapForm.Row>
                <BootstrapForm.Row className="mt-3" style={{marginBottom:"-15px"}}>
                  <TextInput
                    id="pulse"
                    name="pulse"
                    type="text"
                    label="Pulse*"
                    xs="2"
                  />
                  <TextInput
                    id="respiratory_rate"
                    name="respiratory_rate"
                    type="text"
                    label="Respiratory Rate*"
                    xs="2"
                  />
                </BootstrapForm.Row>
              {examQuestions.map((question, index) =>
                <span key={question.id}>
                  <Row className="mt-3" style={{marginBottom:"4px"}}>
                    <Col xs="2" className="">
                      {question.name}
                    </Col>
                    <Col xs="2" className="pl-0 " style={{marginLeft:"-5px"}}>
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
                  <BootstrapForm.Row>
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
                          if (instance.value === 'Other' || instance.value === 'Abnormal') {
                            showNotes[question.name.toLowerCase().replace(' ','_').replace('/','_')] = true;
                            setTimeout(() => (getRef(question.name).current.focus(),3000))
                          }
                        }}
                      />
                    </Col>
                    <Col xs="1" style={{marginTop:"15px", minWidth:"95px", paddingLeft:"0px"}} hidden={!question.open_notes}>
                      {"Notes"}
                      <FontAwesomeIcon icon={faChevronCircleRight} hidden={Object.keys(showNotes).length ? showNotes[question.name.toLowerCase().replace(' ','_').replace('/','_')] : true} onClick={() => {setShowNotes(prevState => ({ ...prevState, [question.name.toLowerCase().replace(' ','_').replace('/','_')]:true }));setTimeout(() => (getRef(question.name).current.focus(),3000));}} className="ml-1" style={{cursor:'pointer'}} inverse />
                      <FontAwesomeIcon icon={faChevronCircleDown} hidden={Object.keys(showNotes).length ? !showNotes[question.name.toLowerCase().replace(' ','_').replace('/','_')] : true} onClick={() => {setShowNotes(prevState => ({ ...prevState, [question.name.toLowerCase().replace(' ','_').replace('/','_')]:false }));}} className="ml-1" style={{cursor:'pointer'}} inverse />
                    </Col>
                  </BootstrapForm.Row>
                  <Collapse in={showNotes[question.name.toLowerCase().replace(' ','_').replace('/','_')]}>
                    <div className="mt-2">
                      <TextInput
                        as="textarea"
                        name={question.name.toLowerCase().replace(' ','').replace('/','') + "_notes"}
                        id={question.name.toLowerCase().replace(' ','_').replace('/','_') + "_notes"}
                        ref={setRef(question.name)}
                        xs="6"
                        rows={3}
                        style={{marginLeft:"-15px", margTop:"-2px"}}
                        errstyle={{marginLeft:"-15px"}}
                      />
                    </div>
                  </Collapse>
                </span>
                )}
                <Row className="mt-3" style={{marginBottom:"-15px"}}>
                  <TextInput
                    as="textarea"
                    label="Medical Plan"
                    name="medical_plan"
                    id="medical_plan"
                    xs="12"
                    rows={4}
                  />
                </Row>
              </FormGroup>
            </Form>
          </Card.Body>
          <ButtonGroup>
            {is_workflow ? <ButtonSpinner isSubmitting={formikProps.isSubmitting} isSubmittingText="Saving..."  type="submit" className="btn btn-primary" onClick={() => { setShouldCheckForScroll(true);setSaveAndFinish(true);formikProps.submitForm(); }}>Save and Finish</ButtonSpinner> : ""}
            <ButtonSpinner isSubmitting={formikProps.isSubmitting} isSubmittingText="Saving..."  type="submit" className="btn btn-primary border" onClick={() => { setShouldCheckForScroll(true);setSaveAndFinish(false);formikProps.submitForm(); }}>{is_workflow ? "Next Step" : "Save"}</ButtonSpinner>
          </ButtonGroup>
        </Card>
      )}
    </Formik>
  );
};

export default ExamForm;
