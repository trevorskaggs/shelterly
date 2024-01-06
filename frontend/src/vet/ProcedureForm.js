import React, { useContext, useEffect, useState } from 'react';
import axios from "axios";
import { navigate, Link } from "raviger";
import { Form, Formik, } from 'formik';
import Select from 'react-select';
import {
  Button,
  ButtonGroup,
  Card,
  Col,
  FormGroup,
  ListGroup,
  Row,
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowAltCircleLeft,
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

const ProcedureForm = (props) => {

  const { setShowSystemError } = useContext(SystemErrorContext);

  // Determine if we're in the vet exam workflow.
  var is_workflow = window.location.pathname.includes("workflow");

  const [data, setData] = useState({
    patient: props.animalid,
    assignee: null,
    concern: '',
    procedures: [],
    procedure_notes: '',
    procedure_other: '',
    priority: '',
    presenting_complaints: [],
    animal_object: {id:''}
  })

  const [procedureChoices, setProcedureChoices] = useState([]);

  useEffect(() => {
    let unmounted = false;
    let source = axios.CancelToken.source();
    if (props.id) {
      const fetchVetRequest = async () => {
        // Fetch VetRequest data.
        await axios.get('/vet/api/medrecord/' + props.id + '/', {
          cancelToken: source.token,
        })
        .then(response => {
          if (!unmounted) {
            setData(response.data);
          }
        })
        .catch(error => {
          setShowSystemError(true);
        });
      };
      fetchVetRequest();
    };


    const fetchProcedures = async () => {
      // Fetch procedure data.
      await axios.get('/vet/api/procedures/', {
        cancelToken: source.token,
      })
      .then(response => {
        if (!unmounted) {
          let options = [];
          response.data.forEach(function(procedure) {
            options.push({value: procedure.id, label: procedure.name})
          });
          setProcedureChoices(options);
        }
      })
      .catch(error => {
        setShowSystemError(true);
      });
    };

    fetchProcedures();

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
      validationSchema={Yup.object({
        procedures: Yup.array(),
        procedure_other: Yup.string().nullable().max(50, 'Maximum character limit of 50.'),
        procedure_notes: Yup.string().nullable().max(300, 'Maximum character limit of 300.'),
      })}
      onSubmit={(values, { setSubmitting }) => {
        axios.patch('/vet/api/medrecord/' + props.id + '/', values)
        .then(response => {
          if (is_workflow) {
            props.onSubmit('procedures', values, 'diagnosis');
          }
          else {
            navigate('/' + props.organization + '/' + props.incident + '/vet/medrecord/' + props.id);
          }
        })
        .catch(error => {
          setShowSystemError(true);
        });
        setSubmitting(false);
      }}
    >
      {formikProps => (
        <Card border="secondary" className="mt-3">
          <Card.Header as="h5" className="pl-3">
            {is_workflow ?
            <span style={{cursor:'pointer'}} onClick={() => {props.handleBack('procedures', 'treatments')}} className="mr-3"><FontAwesomeIcon icon={faArrowAltCircleLeft} size="lg" inverse /></span>
            :
            <span style={{ cursor: 'pointer' }} onClick={() => window.history.back()} className="mr-3"><FontAwesomeIcon icon={faArrowAltCircleLeft} size="lg" inverse /></span>}
            Procedures Form
            </Card.Header>
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
                <Row className="mb-3">
                  <Col xs={"6"}>
                    <label>Procedures</label>
                    <Select
                      label="Procedures"
                      id="proceduresDropdown"
                      name="procedures"
                      type="text"
                      styles={customStyles}
                      isMulti
                      options={procedureChoices}
                      value={procedureChoices.filter(choice => formikProps.values.procedures.includes(choice.value))}
                      isClearable={false}
                      onChange={(instance) => {
                        let values = [];
                        instance && instance.forEach(option => {
                          values.push(option.value);
                        })
                        formikProps.setFieldValue("procedures", instance === null ? [] : values);
                      }}
                    />
                    {formikProps.errors['procedures'] ? <div style={{ color: "#e74c3c", marginTop: ".5rem", fontSize: "80%" }}>{formikProps.errors['procedures']}</div> : ""}
                  </Col>
                </Row>
                {procedureChoices.length && formikProps.values.procedures.includes(procedureChoices.filter(option => option.label === 'Other')[0].value) ?
                <Row>
                  <TextInput
                    type="text"
                    label="Other Procedure"
                    name="procedure_other"
                    id="procedure_other"
                    xs="6"
                  />
                </Row>
                : ""}
                <Row style={{marginBottom:"-15px"}}>
                  <TextInput
                    as="textarea"
                    label="Procedure Notes"
                    name="procedure_notes"
                    id="procedure_notes"
                    xs="6"
                    rows={3}
                  />
                </Row>
              </FormGroup>
            </Form>
          </Card.Body>
          <ButtonGroup>
            <Button type="button" className="btn btn-primary" onClick={() => { formikProps.submitForm() }}>{is_workflow ? "Next" : "Save"}</Button>
          </ButtonGroup>
        </Card>
      )}
    </Formik>
  );
};

export default ProcedureForm;
