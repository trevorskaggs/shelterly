import React, { useContext, useEffect, useState } from 'react';
import axios from "axios";
import { navigate } from "raviger";
import { Form, Formik, } from 'formik';
import Select from 'react-select';
import {
  Button,
  ButtonGroup,
  Card,
  Col,
  FormGroup,
  Row,
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowAltCircleLeft, faChevronCircleDown, faChevronCircleRight
} from '@fortawesome/free-solid-svg-icons';
import * as Yup from 'yup';
import { DropDown, TextInput } from '../components/Form';
import { SystemErrorContext } from '../components/SystemError';

const customStyles = {
  // For the select it self, not the options of the select
  control: (styles, { isDisabled}) => {
    return {
      ...styles,
      color: '#FFF',
      cursor: isDisabled ? 'not-allowed' : 'default',
      backgroundColor: isDisabled ? '#DFDDDD' : 'white',
      height: 35,
      minHeight: 35
    }
  },
  option: provided => ({
    ...provided,
    color: 'black'
  }),
  // singleValue: (styles, { isDisabled }) => ({
  //   ...styles,
  //   color: isDisabled ? '#595959' : 'black'
  // }),
};

const VetRequestForm = (props) => {

  const { setShowSystemError } = useContext(SystemErrorContext);

  const [data, setData] = useState({id: '', patient:{}, assignee:{}, open: '', assigned:'', closed: '', concern: '', priority: '', diagnosis: '', other_diagnosis:'', treatment_plans:[], presenting_complaints:[], animal_object: {id:'', name:'', species:'', category:'', sex:'', age:'', size:'', pcolor:'', scolor:'', medical_notes:''}})

  const [examQuestions, setExamQuestions] = useState([]);
  const [showNotes, setShowNotes] = useState({});

  useEffect(() => {
    let unmounted = false;
    let source = axios.CancelToken.source();
    if (props.id) {
      const fetchExam = async () => {
        // Fetch Visit Note data.
        await axios.get('/vet/api/vetrequest/' + props.id + '/', {
          cancelToken: source.token,
        })
        .then(response => {
          if (!unmounted) {
            console.log(response.data)
            setData(response.data);
          }
        })
        .catch(error => {
          setShowSystemError(true);
        });
      };
      fetchExam();
    };

    const fetchExamQuestions = async () => {
      // Fetch exam question data.
      await axios.get('/vet/api/examquestions/', {
        cancelToken: source.token,
      })
      .then(response => {
        if (!unmounted) {
          setExamQuestions(response.data)
          console.log(response.data)
        }
      })
      .catch(error => {
        setShowSystemError(true);
      });
    };
    fetchExamQuestions();

    // Cleanup.
    return () => {
      unmounted = true;
      source.cancel();
    };
  }, [props.id]);

  return (
    <Formik
      initialValues={data}
      enableReinitialize={true}
      // validationSchema={Yup.object({
      //   assignee: Yup.number().nullable(),
      //   concern: Yup.string(),
      //   priority: Yup.string(),
      // })}
      onSubmit={(values, { setSubmitting }) => {
        console.log(values)
        // if (props.id) {
        //   axios.put('/vet/api/vetrequest/' + props.id + '/', values)
        //   .then(response => {
        //     navigate('/' + props.organization + '/' + props.incident + '/vet/vetrequest/' + props.id)
        //   })
        //   .catch(error => {
        //     setShowSystemError(true);
        //   });
        //   setSubmitting(false);
        // }
        // else {
        //   axios.post('/vet/api/vetrequest/', values)
        //   .then(response => {
        //     navigate('/' + props.organization + '/' + props.incident + '/vet/vetrequest/' + response.data.id)
        //   })
        //   .catch(error => {
        //     setShowSystemError(true);
        //   });
        //   setSubmitting(false);
        // }
      }}
    >
      {formikProps => (
        <Card border="secondary" className="mt-5">
          <Card.Header as="h5" className="pl-3"><span style={{ cursor: 'pointer' }} onClick={() => window.history.back()} className="mr-3"><FontAwesomeIcon icon={faArrowAltCircleLeft} size="lg" inverse /></span>{data.animal_object.name||"Unknown"} Exam Form</Card.Header>
          <Card.Body>
            <Form>
              <FormGroup>
                {examQuestions.map(question =>
                <span key={question.id}>
                  <Row>
                    <Col xs={"4"}>
                      <label>
                        {question.name}
                        {question.allow_not_examined ? <span>
                        <input
                          id="same_address"
                          type="checkbox"
                          className="ml-3"
                          checked={formikProps.values[question.name.toLowerCase().replace(' ','_').replace('/','_')] === 'Not examined'}
                          onChange={() => formikProps.values[question.name.toLowerCase().replace(' ','_').replace('/','_')] === 'Not examined' ? formikProps.setFieldValue(question.name.toLowerCase().replace(' ','').replace('/',''), null) : formikProps.setFieldValue(question.name.toLowerCase().replace(' ','').replace('/',''), 'Not examined')}
                          // style={{marginBottom:"-1px"}}
                        />
                        &nbsp;&nbsp;Not examined
                        </span> : ""}
                    </label>
                      <DropDown
                        // label={question.name}
                        id={question.name + "Dropdown"}
                        name={question.name.toLowerCase().replace(' ','_').replace('/','_')}
                        type="text"
                        // key={`my_unique_assignee_select_key__${formikProps.values.assignee}`}
                        options={question.options.map(option => ({'value':option, 'label':option}))}
                        isClearable={true}
                        onChange={(instance) => {
                          formikProps.setFieldValue(question.name.toLowerCase().replace(' ','_').replace('/','_'), instance === null ? '' : instance.value.toLowerCase().replace(' ','').replace('/',''));
                        }}
                        disabled={formikProps.values[question.name.toLowerCase().replace(' ','_').replace('/','_')] === 'Not examined'}
                      />
                    </Col>
                    
                  </Row>
                  <label>
                      {question.name + " Notes"}
                      <FontAwesomeIcon icon={faChevronCircleRight} hidden={Object.keys(showNotes).length ? showNotes[question.name] : true} onClick={() => setShowNotes(!showNotes[question.name])} className="ml-2" style={{verticalAlign:"middle"}} inverse /><FontAwesomeIcon icon={faChevronCircleDown} hidden={!Object.keys(showNotes).length ? showNotes[question.name] : true} onClick={() => setShowNotes(!showNotes[question.name])} className="ml-2" style={{verticalAlign:"middle"}} inverse />
                    </label>
                  <Row className="mt-3 pl-0">
                    
                    <TextInput
                      as="textarea"
                      // label={question.name + " Notes"}
                      name={question.name.toLowerCase().replace(' ','').replace('/','') + "_notes"}
                      id="_notes"
                      xs="8"
                      rows={4}
                    />
                  </Row>
                </span>
                )}
                {/* <Row className="mt-3">
                  <Col xs={"4"}>
                    <DropDown
                      label="Priority"
                      id="priorityDropdown"
                      name="priority"
                      type="text"
                      options={[
                        { value: 'urgent', label: 'Urgent' },
                        { value: 'when_available', label: 'When Available' },
                      ]}
                      value={formikProps.values.priority||data.priority}
                      isClearable={false}
                      onChange={(instance) => {
                        formikProps.setFieldValue("priority", instance === null ? '' : instance.value);
                      }}
                    />
                  </Col>
                </Row>
                <Row className="mt-3">
                  <Col xs={"8"}>
                    <label>Presenting Complaints</label>
                    <Select
                      label="Presenting Complaints"
                      id="presenting_complaintsDropdown"
                      name="presenting_complaints"
                      type="text"
                      styles={customStyles}
                      isMulti
                      options={presentingComplaintChoices}
                      value={presentingComplaintChoices.filter(choice => formikProps.values.presenting_complaints.includes(choice.value))}
                      isClearable={true}
                      onChange={(instance) => {
                        let values = [];
                        instance && instance.forEach(option => {
                          values.push(option.value);
                        })
                        formikProps.setFieldValue("presenting_complaints", instance === null ? [] : values);
                      }}
                    />
                  </Col>
                </Row>
                <Row className="mt-3 pl-0">
                  <TextInput
                    as="textarea"
                    label="Concern"
                    name="concern"
                    id="concern"
                    xs="8"
                    rows={4}
                  />
                </Row>
                {props.id ?
                <Row>
                  <Col xs={"6"}>
                    <DropDown
                      label="Diagnosis"
                      id="diagnosisDropdown"
                      name="diagnosis"
                      type="text"
                      options={diagnosisChoices}
                      value={formikProps.values.diagnosis||data.diagnosis}
                      isClearable={false}
                      onChange={(instance) => {
                        formikProps.setFieldValue("diagnosis", instance === null ? '' : instance.value);
                      }}
                    />
                  </Col>
                </Row>
                : ""}
                {diagnosisChoices.length && formikProps.values.diagnosis === diagnosisChoices.filter(option => option.label === 'OPEN')[0].value ?
                <Row className="mt-3">
                  <TextInput
                    type="text"
                    label="Other Diagnosis"
                    name="other_diagnosis"
                    id="other_diagnosis"
                    xs="6"
                  />
                </Row>
                : ""} */}

              </FormGroup>
            </Form>
          </Card.Body>
          <ButtonGroup>
            <Button type="button" className="btn btn-primary" onClick={() => { formikProps.submitForm() }}>Save</Button>
          </ButtonGroup>
        </Card>
      )}
    </Formik>
  );
};

export default VetRequestForm;
