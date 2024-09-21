import React, { useContext, useEffect, useRef, useState } from 'react';
import axios from "axios";
import { navigate, useQueryParams } from "raviger";
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
import { AuthContext } from "../accounts/AccountsReducer";
import moment from 'moment';
import Patient from './components/Patient';
import { faArrowAltFromRight } from '@fortawesome/pro-solid-svg-icons';

const TreatmentPlanForm = (props) => {

  const { state } = useContext(AuthContext);

  const { setShowSystemError } = useContext(SystemErrorContext);

  const categoryRef = useRef(null);
  const treatmentRef = useRef(null);

  // Determine if we're in the vet exam workflow.
  var is_workflow = window.location.pathname.includes("workflow");

  let initialData = {
    is_workflow: is_workflow,
    medical_record: props.medrecordid,
    start: new Date(),
    end: null,
    category: '',
    treatment: '',
    frequency: '',
    days: '',
    quantity: '',
    unit: '',
    route: '',
    treatment_object: {category:''},
    animal_object: {id:''},
    vet_requests: [],
  }

  let current_data = {...initialData};
  if (is_workflow && props.state.steps.treatments[props.state.treatmentIndex]) {
    current_data = props.state.steps.treatments[props.state.treatmentIndex];
  }

  const [data, setData] = useState(current_data);

  const [medRecordData, setMedRecordData] = useState({id:'', animal_object: {id:'', name:'', species_string:'', medical_notes:''}, vet_requests:[], exams:[]});

  function calc_requests(formikProps) {
    if (formikProps.values.days > 0) {
      return 24 * formikProps.values.days / formikProps.values.frequency
    }
    return 1
  };

  const [treatmentChoices, setTreatmentChoices] = useState([]);
  const [categoryChoices, setCategoryChoices] = useState([]);

  // Track whether or not to add another treatment after saving.
  const [addAnother, setAddAnother] = useState(false);

  useEffect(() => {

    let unmounted = false;
    let source = axios.CancelToken.source();

    const fetchMedRecord = async (mr) => {
      // Fetch MedRecord data.
      await axios.get('/vet/api/medrecord/' + mr + '/', {
        cancelToken: source.token,
      })
      .then(response => {
        if (!unmounted) {
          setMedRecordData(response.data);
        }
      })
      .catch(error => {
        setShowSystemError(true);
      });
    };

    const fetchTreatmentPlanData = async () => {
      // Fetch TreatmentPlan data.
      await axios.get('/vet/api/treatmentplan/' + props.id + '/?incident=' + props.incident, {
          cancelToken: source.token,
      })
      .then(response => {
        if (!unmounted) {
          response.data['frequency'] = null;
          response.data['days'] = null;
          response.data['start'] = new Date();
          response.data['treatment'] = response.data.treatment_requests[0].treatment
          setData(response.data);
          fetchMedRecord(response.data.medical_record);
        }
      })
      .catch(error => {
        setShowSystemError(true);
      });
    };
    if (props.id) {
      fetchTreatmentPlanData();
    }

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
            treatment_options.push({value: treatment.id, label: treatment.description, category:treatment.category, unit:treatment.unit, routes:treatment.routes});
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

    if (props.medrecordid) {
      if (is_workflow) {
        setMedRecordData(props.state.medRecord);
      }
      else {
        fetchMedRecord(props.medrecordid);
      }
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
      validateOnChange={false}
      enableReinitialize={true}
      validationSchema={Yup.object({
        is_workflow: Yup.boolean(),
        treatment: Yup.string().when('is_workflow', {
          is: false,
          then: Yup.string().required('Required')}),
        frequency: Yup.number().nullable().integer().when(['is_workflow', 'treatment'], {
          is: (is_workflow, treatment) => (is_workflow === false || treatment) && !props.id,
          then: Yup.number().integer().required('Required')}),
        days: Yup.number().nullable().integer().positive('Must be positive').when(['is_workflow', 'treatment', 'frequency'], {
          is: (is_workflow, treatment, frequency) => (is_workflow === false || treatment) && frequency > 0 && !props.id,
          then: Yup.number().integer().positive('Must be positive').required('Required')}),
        start: Yup.string(),
        quantity: Yup.number().nullable().positive('Must be positive').when(['is_workflow', 'treatment'], {
          is: (is_workflow, treatment) => is_workflow === false || treatment,
          then: Yup.number().positive('Must be positive').required('Required')}),
        unit: Yup.string().nullable(),
        route: Yup.string().nullable(),
      })}
      onSubmit={(values, { resetForm, setSubmitting }) => {
        if (is_workflow) {
          if (addAnother) {
            props.onSubmit('treatments', values, 'treatments');
            resetForm({values:initialData});
          }
          else {
            props.onSubmit('treatments', values, 'diagnoses');
          }
        }
        else if (props.id) {
          axios.patch('/vet/api/treatmentplan/' + props.id + '/', values)
          .then(response => {
            navigate('/' + props.organization + '/' + props.incident + '/vet/treatment/' + props.id);
          })
          .catch(error => {
            setShowSystemError(true);
          });
        }
        else {
          axios.post('/vet/api/treatmentrequest/', values)
          .then(response => {
            if (addAnother) {
              // Reset form data..
              resetForm({values:initialData});
              categoryRef.current.select.clearValue();
              treatmentRef.current.select.clearValue();
            }
            else {
              // if (state.prevLocation) {
              //   if (state.prevLocation.includes('/vet/medrecord/')) {
              //     navigate(state.prevLocation + '?tab=treatments');
              //   }
              //   else {
              //     navigate(state.prevLocation);
              //   }
              // }
              navigate('/' + props.organization + '/' + props.incident + '/vet/medrecord/' + medRecordData.id + '?tab=treatments');
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
          {!is_workflow ? <span style={{ cursor: 'pointer' }} onClick={() => navigate('/' + props.organization + '/' + props.incident + '/vet/treatment/' + props.id + '/')} className="mr-3"><FontAwesomeIcon icon={faArrowAltCircleLeft} size="lg" inverse /></span>
          :
          <span>{props.state.treatmentIndex > 0 ? <span style={{cursor:'pointer'}} onClick={() => {setAddAnother(false); setData(props.state.steps.treatments[props.state.treatmentIndex-1]); props.handleBack('treatments', 'treatments')}} className="mr-3"><FontAwesomeIcon icon={faArrowAltCircleLeft} size="lg" inverse /></span>
          :
          <span style={{cursor:'pointer'}} onClick={() => {setAddAnother(false);props.handleBack('treatments', 'orders')}} className="mr-3"><FontAwesomeIcon icon={faArrowAltCircleLeft} size="lg" inverse /></span>}</span>}
          {!props.id ? "" : "Update "}Treatment Form
          </Card.Header>
          <Patient animal={data.animal_object.id ? data.animal_object : medRecordData.animal_object} vet_request={null} organization={props.organization} incident={props.incident} medical_plan={props.state && props.state.steps.exam && props.state.steps.exam.medical_plan ? props.state.steps.exam.medical_plan : medRecordData.exams.filter(exam => (exam.medical_plan)).length ? medRecordData.exams.filter(exam => (exam.medical_plan))[0].medical_plan : ''} />
          <Card.Body>
            <BootstrapForm as={Form}>
              <FormGroup>
                <BootstrapForm.Row>
                  <Col xs={"2"}>
                    <DropDown
                      label="Category"
                      id="categoryDropdown"
                      name="category"
                      type="text"
                      options={categoryChoices}
                      value={formikProps.values.category||data.category}
                      key={`my_unique_category_select_key__${data.category}`}
                      ref={categoryRef}
                      isClearable={false}
                      onChange={(instance) => {
                        formikProps.setFieldValue("category", instance === null ? '' : instance.value);
                        formikProps.setFieldValue("treatment", '');
                        formikProps.setFieldValue("unit", '');
                      }}
                      disabled={props.id}
                    />
                  </Col>
                  <Col xs={"5"}>
                    <DropDown
                      label="Treatment"
                      id="treatmentDropdown"
                      name="treatment"
                      type="text"
                      key={`my_unique_treatment_select_key__${formikProps.values.category}`}
                      ref={treatmentRef}
                      options={treatmentChoices.filter(option => option.category === formikProps.values.category)}
                      value={formikProps.values.treatment||data.treatment}
                      isClearable={false}
                      onChange={(instance) => {
                        formikProps.setFieldValue("treatment", instance === null ? '' : instance.value);
                        formikProps.setFieldValue("unit", instance === null ? '' : treatmentChoices.filter(option => option.value === instance.value)[0].unit);
                      }}
                      disabled={props.id}
                    />
                  </Col>
                  <Col xs={"1"}>
                    <DropDown
                      label="Unit"
                      id="unitDropdown"
                      name="unit"
                      type="text"
                      key={`my_unique_unit_select_key__${formikProps.values.unit}`}
                      options={treatmentChoices.length > 0 && formikProps.values.treatment ? treatmentChoices.filter(choice => choice.value === formikProps.values.treatment).map(choice => ({'value':choice.unit, 'label':choice.unit})) : [{'value':'', 'label':''}]}
                      value={formikProps.values.unit||data.unit}//||treatmentChoices.filter(choice => choice.value === formikProps.values.treatment)[0].unit}
                      isClearable={false}
                      onChange={(instance) => {
                        formikProps.setFieldValue("unit", instance === null ? '' : instance.value);
                      }}
                      placeholder=""
                      disabled={true}
                    />
                  </Col>
                </BootstrapForm.Row>
                <BootstrapForm.Row className="mt-3 pl-0">
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
                    clearable={false}
                  />
                  <DateTimePicker
                    label="End"
                    name="end"
                    id="end"
                    xs="4"
                    value={formikProps.values.frequency && formikProps.values.days ? moment(formikProps.values.start).add(24 * (formikProps.values.days), 'h').subtract(formikProps.values.frequency, 'h').toDate() : formikProps.values.end}
                    disabled={true}
                  />
                </BootstrapForm.Row>
                <BootstrapForm.Row className="mt-3 pl-0" style={{marginBottom:"-15px"}}>
                  <TextInput
                    id="quantity"
                    name="quantity"
                    type="text"
                    xs="2"
                    label="Quantity"
                  />
                  <Col xs={"2"}>
                    <DropDown
                      label="Frequency"
                      id="frequencyDropdown"
                      name="frequency"
                      type="text"
                      key={`my_unique_frequency_select_key__${formikProps.values.frequency}`}
                      options={[{value:0, label:'once'}, {value:1, label:'every 1 hour'}, {value:2, label:'every 2 hours'}, {value:3, label:'every 3 hours'}, {value:4, label:'every 4 hours'}, {value:6, label:'every 6 hours'}, {value:8, label:'every 8 hours'}, {value:12, label:'every 12 hours'}, {value:24, label:'every 24 hours'}]}
                      value={formikProps.values.frequency||data.frequency}
                      isClearable={false}
                      onChange={(instance) => {
                        formikProps.setFieldValue("frequency", instance === null ? '' : instance.value);
                        if (instance.value === 0) {
                          formikProps.setFieldValue("days", null)
                          formikProps.setFieldValue("end", formikProps.values.start)
                        }
                      }}
                      placeholder=""
                    />
                  </Col>
                  <Col xs={"2"}>
                    <DropDown
                      label="Duration"
                      id="daysDropdown"
                      name="days"
                      type="text"
                      key={`my_unique_days_select_key__${formikProps.values.days}`}
                      options={[{value:1, label:'for 1 day'}, {value:2, label:'for 2 days'}, {value:3, label:'for 3 days'}, {value:4, label:'for 4 days'}, {value:5, label:'for 5 days'}, {value:6, label:'for 6 days'}, {value:7, label:'for 7 days'}, {value:14, label:'for 14 days'}]}
                      value={formikProps.values.days||data.days}
                      isClearable={false}
                      onChange={(instance) => {
                        formikProps.setFieldValue("days", instance === null ? '' : instance.value);
                      }}
                      placeholder=""
                      disabled={formikProps.values.frequency === 0}
                    />
                  </Col>
                  <Col xs={"2"}>
                    <DropDown
                      label="Route"
                      id="routeDropdown"
                      name="route"
                      type="text"
                      key={`my_unique_route_select_key__${formikProps.values.route}`}
                      options={treatmentChoices.length > 0 && formikProps.values.treatment && treatmentChoices.filter(choice => Number(choice.value) === Number(formikProps.values.treatment))[0].routes.length > 0 ? treatmentChoices.filter(choice => Number(choice.value) === Number(formikProps.values.treatment))[0].routes.map(route => ({'value':route, 'label':route})) : [{'value':'', 'label':''}]}
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
          {formikProps.values.days && formikProps.values.frequency && formikProps.values.frequency > 0 ? <div className="alert alert-warning text-center" style={{fontSize:"16px", marginTop:"-20px"}}>This will generate {calc_requests(formikProps)} treatment request{calc_requests(formikProps) === 1 ? "" : "s"}.</div> : ""}
          {formikProps.values.frequency === 0 ? <div className="alert alert-warning text-center" style={{fontSize:"16px", marginTop:"-20px"}}>This will generate 1 treatment request.</div> : ""}
          <ButtonGroup>
            {!props.id ?
            <Button onClick={() => {
              setAddAnother(true);
              formikProps.submitForm();
            }}>
              {props.state.steps.treatments.length -1 > props.state.treatmentIndex ? "Next Treatment" : "Add Another"}
            </Button> : ""}
            <Button type="button" className="btn btn-primary border" onClick={() => { setAddAnother(false);formikProps.submitForm() }}>{is_workflow ? "Next Step" : "Save"}</Button>
          </ButtonGroup>
        </Card>
      )}
    </Formik>
  );
};

export default TreatmentPlanForm;
