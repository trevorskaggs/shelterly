import React, { useContext, useEffect, useState } from 'react';
import axios from "axios";
import { navigate, useQueryParams, Link } from "raviger";
import { Form, Formik } from 'formik';
import {
  Button,
  ButtonGroup,
  Card,
  Col,
  Form as BootstrapForm,
  FormGroup,
  ListGroup,
  Row,
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowAltCircleLeft,
} from '@fortawesome/free-solid-svg-icons';
import * as Yup from 'yup';
import { DateTimePicker, DropDown, TextInput } from '../components/Form';
import { SystemErrorContext } from '../components/SystemError';
import moment from 'moment';

const TreatmentPlanForm = (props) => {

  const { setShowSystemError } = useContext(SystemErrorContext);

  // Determine if we're in the vet exam workflow.
  var is_workflow = window.location.pathname.includes("workflow");

  let initialData = {
    vet_request: props.vetrequestid,
    start: new Date(),
    end: new Date(),
    category: '',
    treatment: '',
    frequency: '',
    quantity: '',
    unit: '',
    route: '',
    treatment_object: {category:''}
  }

  let current_data = {...initialData};
  if (is_workflow && props.state.steps.treatments[props.state.treatmentIndex]) {
    current_data = props.state.steps.treatments[props.state.treatmentIndex];
  }

  const [data, setData] = useState(current_data);

  const [vetRequestData, setVetRequestData] = useState({animal_object: {id:'', name:'', species_string:'', medical_notes:''}});

  function calc_requests(formikProps) {
    let duration = moment.duration(moment(formikProps.values.end).add(1, 'm').diff(moment(formikProps.values.start)));
    return Math.trunc(((duration.hours() + (duration.days() * 24)) / formikProps.values.frequency) + 1)
  };

  const [treatmentChoices, setTreatmentChoices] = useState([]);
  const [categoryChoices, setCategoryChoices] = useState([]);

  // Track whether or not to add another treatment after saving.
  const [addAnother, setAddAnother] = useState(false);

  useEffect(() => {
    let unmounted = false;
    let source = axios.CancelToken.source();

    const fetchTreatments = async () => {
      // Fetch Treatment data.
      await axios.get('/vet/api/treatment/', {
        cancelToken: source.token,
      })
      .then(response => {
        if (!unmounted) {
          let category_options = [];
          let treatment_options = [];
          response.data.forEach(function(treatment) {
            treatment_options.push({value: treatment.id, label: treatment.description, category:treatment.category});
            if (!category_options.map(category_option => category_option.value).includes(treatment.category)) {
              category_options.push({value: treatment.category, label: treatment.category});
            }
          });
          setTreatmentChoices(treatment_options);
          setCategoryChoices(category_options);
        }
      })
      .catch(error => {
        setShowSystemError(true);
      });
    };
    fetchTreatments();

    if (props.id) {
      const fetchTreatmentPlan = async () => {
        // Fetch TreatmentPlan data.
        await axios.get('/vet/api/treatmentplan/' + props.id + '/', {
          cancelToken: source.token,
        })
        .then(response => {
          if (!unmounted) {
            response.data['category'] = response.data.treatment_object.category
            response.data['treatment'] = response.data.treatment_object.id
            setData(response.data);
          }
        })
        .catch(error => {
          setShowSystemError(true);
        });
      };
      fetchTreatmentPlan();
    };

    if (props.vetrequestid) {
      const fetchVetRequest = async () => {
        // Fetch VetRequest data.
        await axios.get('/vet/api/vetrequest/' + props.vetrequestid + '/', {
          cancelToken: source.token,
        })
        .then(response => {
          if (!unmounted) {
            setVetRequestData(response.data);
          }
        })
        .catch(error => {
          setShowSystemError(true);
        });
      };
      fetchVetRequest();
    };

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
        treatment: Yup.string().required('Required'),
        frequency: Yup.number().positive('Must be positive').required('Required'),
        start: Yup.string().required('Required'),
        end: Yup.string().required('Required'),
        quantity: Yup.number().positive('Must be positive').required('Required'),
        unit: Yup.string().required('Required'),
        route: Yup.string().required('Required'),
      })}
      onSubmit={(values, { resetForm, setSubmitting }) => {
        if (props.id || (props.state.steps.treatments[props.state.treatmentIndex])) {
          axios.put('/vet/api/treatmentplan/' + props.id || props.state.steps.treatments[props.state.treatmentIndex].id + '/', values)
          .then(response => {
            if (addAnother) {
              if (is_workflow) {
                props.onSubmit('treatments', values, 'treatments');
              }
              // Reset form data with existing treatment data if we have it.
              let formdata = props.state && props.state.steps.treatments.length > 0 ? props.state.steps.treatments[props.state.treatmentIndex + 1] : data;
              resetForm({values:formdata});
            }
            else {
              navigate('/' + props.organization + '/' + props.incident + '/vet/vetrequest/' + props.vetrequestid);
            }
          })
          .catch(error => {
            setShowSystemError(true);
          });
          setSubmitting(false);
        }
        else {
          axios.post('/vet/api/treatmentplan/', values)
          .then(response => {
            if (addAnother) {
              if (is_workflow) {
                values['id'] = response.data.id;
                props.onSubmit('treatments', values, 'treatments');
              }
              // Reset form data with existing treatment data if we have it.
              let formdata = props.state.steps.treatments[props.state.treatmentIndex + 1] ? props.state.steps.treatments[props.state.treatmentIndex + 1] : initialData;
              resetForm({values:formdata});
            }
            else {
              navigate('/' + props.organization + '/' + props.incident + '/vet/vetrequest/' + props.vetrequestid);
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
        <Card border="secondary" className={is_workflow ? "mt-3" : "mt-5"}>
          <Card.Header as="h5" className="pl-3">
          {!is_workflow ? <span style={{ cursor: 'pointer' }} onClick={() => navigate('/' + props.organization + '/' + props.incident + '/vet/vetrequest/' + props.vetrequestid + '/')} className="mr-3"><FontAwesomeIcon icon={faArrowAltCircleLeft} size="lg" inverse /></span>
          :
          <span>{props.state.treatmentIndex > 0 ? <span style={{cursor:'pointer'}} onClick={() => {setAddAnother(false); setData(props.state.steps.treatments[props.state.treatmentIndex-1]); props.handleBack('treatments', 'treatments')}} className="mr-3"><FontAwesomeIcon icon={faArrowAltCircleLeft} size="lg" inverse /></span>
          :
          <span style={{cursor:'pointer'}} onClick={() => {setAddAnother(false);props.handleBack('treatments', 'diagnostics')}} className="mr-3"><FontAwesomeIcon icon={faArrowAltCircleLeft} size="lg" inverse /></span>}</span>}
          {!props.id ? "" : "Update "}Treatment Form
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
                      <span className="col-3"><b>ID:</b> <Link href={"/" + props.organization + "/" + props.incident + "/animals/" + vetRequestData.animal_object.id} className="text-link" style={{textDecoration:"none", color:"white"}}>A#{vetRequestData.animal_object.id}</Link></span>
                      <span className="col-3"><b>Name:</b> {vetRequestData.animal_object.name||"Unknown"}</span>
                      <span className="col-3"><b>Species:</b> {vetRequestData.animal_object.species_string}</span>
                    </div>
                  </ListGroup.Item>
                  <ListGroup.Item>
                      <span><b>Medical Notes:</b> {vetRequestData.animal_object.medical_notes || "N/A"}</span>
                  </ListGroup.Item>
                </ListGroup>
              </Card.Body>
            </Card>
          </div>
          <Card.Body>
            <BootstrapForm as={Form}>
              <FormGroup>
                <BootstrapForm.Row>
                <Col xs={"4"}>
                    <DropDown
                      label="Category"
                      id="categoryDropdown"
                      name="category"
                      type="text"
                      options={categoryChoices}
                      value={formikProps.values.category||data.category}
                      key={`my_unique_category_select_key__${data.category}`}
                      isClearable={false}
                      onChange={(instance) => {
                        formikProps.setFieldValue("category", instance === null ? '' : instance.value);
                        formikProps.setFieldValue("treatment", '');
                      }}
                    />
                  </Col>
                  <Col xs={"6"}>
                    <DropDown
                      label="Treatment"
                      id="treatmentDropdown"
                      name="treatment"
                      type="text"
                      key={`my_unique_treatment_select_key__${formikProps.values.category}`}
                      options={treatmentChoices.filter(option => option.category === formikProps.values.category)}
                      value={formikProps.values.treatment||data.treatment}
                      isClearable={false}
                      onChange={(instance) => {
                        formikProps.setFieldValue("treatment", instance === null ? '' : instance.value);
                      }}
                    />
                  </Col>
                </BootstrapForm.Row>
                <BootstrapForm.Row className="mt-3 pl-0">
                  <TextInput
                    id="frequency"
                    name="frequency"
                    type="text"
                    xs="2"
                    label="Frequency (in hours)"
                  />
                  <DateTimePicker
                    label="Start"
                    name="start"
                    id="start"
                    xs="4"
                    onChange={(date, dateStr) => {
                      formikProps.setFieldValue("start", dateStr)
                    }}
                    value={formikProps.values.start||new Date()}
                    disabled={false}
                  />
                  <DateTimePicker
                    label="End"
                    name="end"
                    id="end"
                    xs="4"
                    onChange={(date, dateStr) => {
                      formikProps.setFieldValue("end", dateStr)
                    }}
                    value={formikProps.values.end||new Date()}
                    disabled={false}
                    style={{}}
                  />
                </BootstrapForm.Row>
                <BootstrapForm.Row>
                  <TextInput
                    id="quantity"
                    name="quantity"
                    type="text"
                    xs="2"
                    label="Quantity"
                  />
                  <Col xs={"4"}>
                    <DropDown
                      label="Unit"
                      id="unitDropdown"
                      name="unit"
                      type="text"
                      key={`my_unique_unit_select_key__${formikProps.values.unit}`}
                      options={[
                        { value: 'ml', label: 'ml' },
                        { value: 'cap', label: 'cap' },
                        { value: 'tab', label: 'tab' },
                      ]}
                      value={formikProps.values.unit||data.unit}
                      isClearable={false}
                      onChange={(instance) => {
                        formikProps.setFieldValue("unit", instance === null ? '' : instance.value);
                      }}
                    />
                  </Col>
                  <Col xs={"4"}>
                    <DropDown
                      label="Route"
                      id="routeDropdown"
                      name="route"
                      type="text"
                      key={`my_unique_route_select_key__${formikProps.values.route}`}
                      options={[
                        { value: 'IV', label: 'IV' },
                        { value: 'SQ', label: 'SQ' },
                        { value: 'PO', label: 'PO' },
                      ]}
                      value={formikProps.values.route||data.route}
                      isClearable={false}
                      onChange={(instance) => {
                        formikProps.setFieldValue("route", instance === null ? '' : instance.value);
                      }}
                    />
                  </Col>
                </BootstrapForm.Row>
              </FormGroup>
            </BootstrapForm>
          </Card.Body>
          {formikProps.values.end && formikProps.values.start && formikProps.values.frequency && formikProps.values.frequency > 0 ? <div className="alert alert-warning text-center" style={{fontSize:"16px", marginTop:"-35px"}}>This will generate {calc_requests(formikProps)} treatment request{calc_requests(formikProps) === 1 ? "" : "s"}.</div> : ""}
          <ButtonGroup>
            {!props.id ?
            <Button onClick={() => {
              setAddAnother(true);
              formikProps.submitForm();
            }}>
              {props.state.steps.treatments.length -1 > props.state.treatmentIndex ? "Next Treatment" : "Add Another"}
            </Button> : ""}
            <Button type="button" className="btn btn-primary border" onClick={() => { setAddAnother(false);formikProps.submitForm() }}>Save{is_workflow ? " and Finish" : ""}</Button>
          </ButtonGroup>
        </Card>
      )}
    </Formik>
  );
};

export default TreatmentPlanForm;
