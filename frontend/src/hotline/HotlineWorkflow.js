import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Typography from '@material-ui/core/Typography';
import { AnimalForm } from '../animals/AnimalForms';
import { PersonForm } from '../people/PeopleForms';
import { ServiceRequestForm } from './HotlineForms';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    marginTop: theme.spacing(2),
  },
  test: {
    borderRadius: "0.25rem",
  },
  instructions: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
}));

function getSteps() {
  return ['Create Contacts', 'Create Animals', 'Create Service Request'];
}

function getStepContent(step, handleStepSubmit, handleBack, state) {
  switch (step) {
    case 0:
      return <PersonForm onSubmit={handleStepSubmit} handleBack={handleBack} state={state} />;
    case 1:
      return <AnimalForm onSubmit={handleStepSubmit} handleBack={handleBack} state={state} />;
    case 2:
      return <ServiceRequestForm onSubmit={handleStepSubmit} handleBack={handleBack} state={state} />;
    default:
      return 'Unknown step';
  }
}

export const initialData = {
  stepIndex: 0,
  hasOwner: false,
  animalIndex: 0,
  steps: {
    reporter: {
      first_name: '',
      last_name: '',
      phone: '',
      alt_phone: '',
      email: '',
      drivers_license: '',
      comments: '',
      agency: '',
      address: '',
      apartment: '',
      city: '',
      state: '',
      zip_code: '',
      latitude: null,
      longitude: null,
      change_reason: '',},
    owner: {
      first_name: '',
      last_name: '',
      phone: '',
      alt_phone: '',
      email: '',
      drivers_license: '',
      comments: '',
      agency: '',
      address: '',
      apartment: '',
      city: '',
      state: '',
      zip_code: '',
      latitude: null,
      longitude: null,
      change_reason: '',},
    animals: [],
  }
}

export default function HotlineWorkflow() {
  const classes = useStyles();
  // The major overall step tracker.
  const [activeStep, setActiveStep] = React.useState(0);
  const steps = getSteps();
  // Tracks the workflow state and data.
  const [state, setState] = useState(initialData);
  // Counts number of reporter + owner
  const [contactCount, setContactCount] = React.useState(0);

  function handleBack(currentStep, nextStep) {
    // Lower the active step if going backwards between major steps.
    if ((currentStep === 'animals' && nextStep !== 'animals') || (currentStep === 'request' && nextStep === 'animals')) {
      setActiveStep((prevActiveStep) => prevActiveStep - 1);
    }

    // Reduce the animal index when going backward from an animal to another animal.
    var track_index = state.animalIndex;
    if (nextStep === 'animals' && currentStep === 'animals') {
      track_index = state.animalIndex -1;
    }
    setState((prevState) => ({
      ...prevState,
      hasOwner: nextStep === 'owner',
      stepIndex: prevState.stepIndex - 1,
      animalIndex: track_index,
    }))
  };

  function handleStepSubmit(currentStep, data, nextStep) {
    // Only count contacts the first time.
    if ((currentStep === 'reporter' && state.steps.reporter.first_name === '') || (currentStep === 'owner' && state.steps.owner.first_name === '')) {
      setContactCount((count) => count + 1);
    }

    // Treat animals differently since we need an array of N animals.
    if (currentStep === 'animals') {
      // Only increase animal index on save if we're adding another animal.
      var index = state.animalIndex;
      if (nextStep === 'animals') {
        index = index + 1
      }
      // If we're not on the last animal, update the current animal based on the index.
      if (state.animalIndex !== state.steps.animals.length) {
        const animalList = [...state.steps.animals];
        animalList[state.animalIndex] = data;
        setState((prevState) => ({
          ...prevState,
          stepIndex: prevState.stepIndex + 1,
          animalIndex: index,
          steps: { ...prevState.steps, [currentStep]:animalList }
        }))
      }
      // Otherwise add a new animal to the list.
      else {
        setState((prevState) => ({
          ...prevState,
          stepIndex: prevState.stepIndex + 1,
          animalIndex: index,
          steps: { ...prevState.steps, [currentStep]:[...prevState.steps.animals, data] }
        }))
      }
    }
    // Otherwise update the data respective of the current step.
    else {
      setState((prevState) => ({
        ...prevState,
        hasOwner: nextStep === 'owner',
        stepIndex: prevState.stepIndex + 1,
        steps: { ...prevState.steps, [currentStep]:data }
      }))
    }

    // Only bump up the major active step when moving to a new type of object creation.
    if ((currentStep !== 'animals' && nextStep === 'animals') || (currentStep === 'animals' && nextStep === 'request')){
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  }

  return (
    <div className={classes.root}>
      <Stepper className={classes.test} activeStep={activeStep}>
        {steps.map((label, index) => {
          const stepProps = {};
          const labelProps = {};
          if (index === 0) {
            labelProps.optional = <Typography variant="caption" component={'span'}>{contactCount} Contact{contactCount === 1 ? "" : "s"} Created</Typography>;
          }
          else if (index === 1) {
            labelProps.optional = <Typography variant="caption" component={'span'}>{state.steps.animals.length} Animal{state.steps.animals.length === 1 ? "" : "s"} Created</Typography>;
          }
          return (
            <Step key={label} {...stepProps}>
              <StepLabel {...labelProps}>{label}</StepLabel>
            </Step>
          );
        })}
      </Stepper>
      <div>
          <div>
            <Typography className={classes.instructions} component={'span'}>{getStepContent(activeStep, handleStepSubmit, handleBack, state)}</Typography>
          </div>
      </div>
    </div>
  );
}