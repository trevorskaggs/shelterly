import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Typography from '@material-ui/core/Typography';
import { useQueryParams } from 'raviger';
import ExamForm from './ExamForm';
import OrdersForm from '../vet/OrdersForm';
import TreatmentPlanForm from '../vet/TreatmentPlanForm';
import PageNotFound from "../components/PageNotFound";
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import DiagnosisForm from './DiagnosisForm';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    marginTop: theme.spacing(2),
  },
  stepper: {
    borderRadius: "0.25rem",
    color: '#ffffff',
    backgroundColor: '#444',
    "&$active": {
      color: '#ffffff'
    },
    "&$completed": {
      color: '#ffffff',
    },
  },
  stepIcon: {
    "&$active": {
      color: '#375a7f',
    },
    "&$completed": {
      color: '#375a7f',
    },
  },
  active: {},
  completed: {},
  circle: {
    width: 20,
    height: 20,
    borderRadius: '50%',
    backgroundColor: 'currentColor',
    color:'white',
  },
  checkIcon: {
    color: '#375a7f',
    stroke: '#375a7f',
    zIndex: 1,
    fontSize: 27,
    marginTop: "-6px",
    marginLeft: "-3px"
  },
  instructions: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
}));

function CustomStepIcon() {
  const classes = useStyles();
  return (
    <div className={classes.circle}><CheckCircleIcon className={classes.checkIcon} /></div>
  );
}

function getSteps() {
  return ['Intake Exam', 'Orders', 'Treatments', 'Diagnosis'];
}

function getStepContent(id, incident, organization, step, handleStepSubmit, handleBack, handleMedicalRecord, state) {
  switch (step) {
    case 0:
      return <ExamForm onSubmit={handleStepSubmit} handleBack={handleBack} handleMedicalRecord={handleMedicalRecord} state={state} medrecordid={id} incident={incident} organization={organization} />;
    case 1:
      return <OrdersForm onSubmit={handleStepSubmit} handleBack={handleBack} handleMedicalRecord={handleMedicalRecord} state={state} id={id} incident={incident} organization={organization} />;
    case 2:
      return <TreatmentPlanForm onSubmit={handleStepSubmit} handleBack={handleBack} handleMedicalRecord={handleMedicalRecord} state={state} medrecordid={id} incident={incident} organization={organization} />;
    case 3:
      return <DiagnosisForm onSubmit={handleStepSubmit} handleBack={handleBack} handleMedicalRecord={handleMedicalRecord} state={state} medrecordid={id} incident={incident} organization={organization} />;
    default:
      return <PageNotFound/>;
  }
}

export const initialVetWorkflowData = {
  stepIndex: 0,
  treatmentCount: 0,
  treatmentIndex: 0,
  diagnosticsCount: 0,
  proceduresCount: 0,
  steps: {
    exam: {'medrecord_id':null, 'vetrequest_id':null, 'assignee':null, 'confirm_sex_age':false, 'age':'', 'sex':'', 'confirm_chip':false, 'microchip':'', 'weight':'', 'weight_unit':'kg', 'weight_estimated':false, 'temperature':'', 'temperature_method':'Rectal', 'pulse':null, 'respiratory_rate':'', 'vet_requests':[]},
    orders: {diagnostics:[], diagnostics_other:'', procedures:[], procedure_other:'', animal_object: {id:''}, vet_requests: [], exams:[]},
    treatments: [],
    diagnosis: {diagnosis:[], diagnosis_notes:'', diagnosis_other:'', animal_object:{id:''}, vet_requests: [], exams:[]},
  },
  medRecord: {id:'', medical_plan:'', exams:[], diagnostic_objects:[], procedure_objects:[], patient:null, vet_requests:[], open: '', diagnosis: '', other_diagnosis:'', treatment_plans:[], animal_object: {id:'', name:'', species:'', category:'', sex:'', age:'', fixed:'', pcolor:'', scolor:'', medical_notes:'', shelter_object:{}, room_name:''}}
}

function VetStepperWorkflow({ id, incident, organization }) {

  // Identify any query param data.
  const [queryParams] = useQueryParams();
  const {
  } = queryParams;

  const classes = useStyles();
  // The major overall step tracker.
  const [activeStep, setActiveStep] = React.useState(0);
  const steps = getSteps();

  // Tracks the workflow state and data.
  const [state, setState] = useState(initialVetWorkflowData);

  function handleBack(currentStep, nextStep) {
    // Lower the active step if going backwards between major steps.
    if (currentStep !== nextStep) {
      setActiveStep((prevActiveStep) => prevActiveStep - 1);
    }

    // Reduce the treatment index when going backward from an treatment to another treatment.
    var track_index = state.treatmentIndex;
    if (nextStep === 'treatments' && currentStep === 'treatments') {
      track_index = state.treatmentIndex -1;
    }
    setState((prevState) => ({
      ...prevState,
      stepIndex: prevState.stepIndex - 1,
      treatmentIndex: track_index,
    }))
  };

  function handleStepSubmit(currentStep, data, nextStep) {
    // Treat treatments differently since we need an array of N treatments.
    if (currentStep === 'treatments') {
      // Only increase treatment index on save if we're adding another treatment.
      var index = state.treatmentIndex;
      if (nextStep === 'treatments') {
        index = index + 1;
      }
      // If we're not on the last treatment, update the current treatment based on the index.
      if (state.treatmentIndex !== state.steps.treatments.length) {
        const treatmentList = [...state.steps.treatments];

        treatmentList[state.treatmentIndex] = data;
        setState((prevState) => ({
          ...prevState,
          stepIndex: prevState.stepIndex + 1,
          treatmentIndex: index,
          steps: { ...prevState.steps, [currentStep]:treatmentList }
        }))
      }
      // Otherwise add a new treatment to the list.
      else {
        setState((prevState) => ({
          ...prevState,
          stepIndex: prevState.stepIndex + 1,
          treatmentIndex: index,
          treatmentCount: prevState.treatmentCount + data.treatment ? 1 : 0,
          steps: { ...prevState.steps, [currentStep]:[...prevState.steps.treatments, data] }
        }))
      }
    }
    // Otherwise update the data respective of the current step.
    else {
      setState((prevState) => ({
        ...prevState,
        stepIndex: prevState.stepIndex + 1,
        steps: { ...prevState.steps, [currentStep]:data }
      }))
    }

    // Only bump up the major active step when moving to a new type of object creation.
    if (currentStep !== nextStep){
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  }

  function handleMedicalRecord(data) {
    setState((prevState) => ({
      ...prevState,
      medRecord: data,
    }))
  };

  return (
    <div className={classes.root}>
      <Stepper className={classes.stepper} activeStep={activeStep}>
        {steps.map((label, index) => {
          const stepProps = {};
          const labelProps = {};
          if (index === 2) {
            labelProps.optional = <Typography variant="caption" component={'span'}>{state.treatmentCount} Treatment{state.treatmentCount === 1 ? "" : "s"} Created</Typography>;
          }
          return (
            <Step key={label} {...stepProps}>
              <StepLabel
                // Use a custom checkbox for completed state in order to have a white background.
                StepIconComponent={activeStep < index+1 ? undefined : CustomStepIcon}
                classes={{
                  label: classes.stepper,
                  root: classes.stepper,
                  active: classes.active,
                  completed: classes.completed,
                }}
                StepIconProps={{
                  classes: {
                    root: classes.stepIcon,
                    completed: classes.completed,
                    active: classes.active,
                  }
                }}
                {...labelProps}>{label}
              </StepLabel>
            </Step>
          );
        })}
      </Stepper>
      <div>
          <div>
            <Typography className={classes.instructions} component={'span'}>{getStepContent(id, incident, organization, activeStep, handleStepSubmit, handleBack, handleMedicalRecord, state)}</Typography>
          </div>
      </div>
    </div>
  );
}

export default VetStepperWorkflow;