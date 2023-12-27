import React, { useContext, useEffect, useState } from 'react';
import axios from "axios";
import { Link, navigate } from "raviger";
import { Field, Form, Formik, } from 'formik';
import { Switch } from 'formik-material-ui';
import Select from 'react-select';
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

  const [data, setData] = useState({id: '', patient:{}, assignee:{}, exam: null, open: '', assigned:'', closed: '', concern: '', priority: '', diagnosis: '', other_diagnosis:'', treatment_plans:[], presenting_complaints:[], exam_object: {}, animal_object: {id:'', name:'', species:'', category:'', sex:'', age:'', size:'', pcolor:'', scolor:'', medical_notes:''}})
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
            // Unpack existing answers and set at exam_object level.
            if (response.data.exam) {
              Object.keys(response.data.exam_object.answers).forEach(key => {
                response.data.exam_object[key] = response.data.exam_object.answers[key];
              })
            }
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
          setExamQuestions(response.data);
          let open_notes_dict = {};
          response.data.forEach(question => {
            open_notes_dict[question.name] = question.open_notes;
          });
          setShowNotes(open_notes_dict);
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
      initialValues={data.exam ? data.exam_object : {vetrequest_id:props.id}}
      enableReinitialize={true}
      // validationSchema={Yup.object({
      //   assignee: Yup.number().nullable(),
      //   concern: Yup.string(),
      //   priority: Yup.string(),
      // })}
      onSubmit={(values, { setSubmitting }) => {
        console.log(values)
        if (data.exam) {
          axios.put('/vet/api/exam/' + data.exam + '/', values)
          .then(response => {
            navigate('/' + props.organization + '/' + props.incident + '/vet/vetrequest/' + props.id)
          })
          .catch(error => {
            setShowSystemError(true);
          });
          setSubmitting(false);
        }
        else {
          axios.post('/vet/api/exam/', values)
          .then(response => {
            navigate('/' + props.organization + '/' + props.incident + '/vet/vetrequest/' + props.id)
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
                <div className="row" style={{textTransform:"capitalize"}}>
                  <span className="col-3"><b>Sex:</b> {data.animal_object.sex||"Unknown"}</span>
                  <span className="col-3"><b>Age:</b> {data.animal_object.age||"Unknown"}</span>
                  <span className="col-3"><b>Microchip Number:</b> {data.animal_object.age||"Unknown"}</span>
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
                <Col xs="2"><BootstrapForm.Label htmlFor="confirm_sex_age" style={{marginBottom:"-5px"}}>Confirm Age/Sex</BootstrapForm.Label>
                <div><Field component={Switch} name="confirm_sex_age" type="checkbox" color="primary" /></div></Col>

                <Col xs="2"><BootstrapForm.Label htmlFor="confirm_chip" style={{marginBottom:"-5px"}}>Confirm Microchip</BootstrapForm.Label>
                <div><Field component={Switch} name="confirm_chip" type="checkbox" color="primary" /></div></Col>
              </Row>
              <Row>
                  <TextInput
                    id="temperature"
                    name="temperature"
                    type="text"
                    label="Temperature (F)"
                    xs="2"
                  />
                    <Col xs="2" className="pl-0 pr-0" style={{marginLeft:"-5px"}}>
                  <DropDown
                    id={"temperature_method"}
                    name={"temperature_method"}
                    type="text"
                    label="Method"
                    placeholder=""
                    options={[{value:'Axillary', label:'Axillary'}, {value:'Rectal', label:'Rectal'}, {value:'Not taken', label:'Not taken'}, {value:'Unable to obtain', label:'Unable to obtain'}]}
                    isClearable={false}
                  />
                  </Col>
                </Row>
                <Row style={{marginBottom:"-15px"}}>
                  <TextInput
                    id="weight"
                    name="weight"
                    type="text"
                    label="Weight"
                    xs="3"
                  />
                    <Col xs="1" className="pl-0 pr-0" style={{marginBottom:"-2px", marginLeft:"-5px"}}>
                  <DropDown
                    id={"weight_unit"}
                    name={"weight_unit"}
                    type="text"
                    label="Unit"
                    placeholder=""
                    options={[{value:'k', label:'k'}, {value:'kg', label:'kg'}]}
                    isClearable={false}

                  />
                  </Col>
                </Row>
                {examQuestions.filter(question => question.categories.includes(data.animal_object.category)).map(question =>
                    <span  className="mt-3" key={question.id}>
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
                          }}
                          // style={{marginBottom:"-1px"}}
                        />
                        <span>&nbsp;&nbsp;Not examined</span>
                        </span> : ""}
                        </Col>
                    <Col xs="1" className="float-right" style={{marginLeft:"5px", minWidth:"90px"}}>
                      {"Notes"}
                      <FontAwesomeIcon icon={faChevronCircleRight} hidden={Object.keys(showNotes).length ? showNotes[question.name] : true} onClick={() => {setShowNotes(prevState => ({ ...prevState, [question.name]:true }));}} className="ml-1" style={{cursor:'pointer'}} inverse />
                      <FontAwesomeIcon icon={faChevronCircleDown} hidden={Object.keys(showNotes).length ? !showNotes[question.name] : true} onClick={() => {setShowNotes(prevState => ({ ...prevState, [question.name]:false }));}} className="ml-1" style={{cursor:'pointer'}} inverse />
                      </Col>
                      </Row>
                    <Col xs="5" className="pl-0">
                      <DropDown
                        id={question.name + "Dropdown"}
                        name={question.name.toLowerCase().replace(' ','_').replace('/','_')}
                        type="text"
                        key={`my_unique_assignee_select_key__${formikProps.values[question.name.toLowerCase().replace(' ','_').replace('/','_')]}`}
                        options={formikProps.values[question.name.toLowerCase().replace(' ','_').replace('/','_')] === 'Not examined' ? [{value:'Not examined', label:'Not examined'}] : question.options.map(option => ({'value':option, 'label':option}))}
                        isClearable={false}
                        onChange={(instance) => {
                          formikProps.setFieldValue(question.name.toLowerCase().replace(' ','_').replace('/','_'), instance === null ? '' : instance.value);
                          formikProps.setFieldValue(question.name.toLowerCase().replace(' ','_').replace('/','_') + '_id', instance === null ? '' : question.id);
                        }}
                      />
                      </Col>
                  <Collapse in={showNotes[question.name]}>
                    <div className="mt-2">
                    <TextInput
                      as="textarea"
                      name={question.name.toLowerCase().replace(' ','').replace('/','') + "_notes"}
                      id="_notes"
                      xs="5"
                      rows={3}
                      style={{marginLeft:"-15px"}}
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
            <Button type="button" className="btn btn-primary" onClick={() => { formikProps.submitForm() }}>Save</Button>
          </ButtonGroup>
        </Card>
      )}
    </Formik>
  );
};

export default VetRequestForm;
