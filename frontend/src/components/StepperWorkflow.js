import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Typography from '@material-ui/core/Typography';
import { useQueryParams } from 'raviger';
import AnimalForm from '../animals/AnimalForm';
import PersonForm from '../people/PersonForm';
import ServiceRequestForm from '../hotline/ServiceRequestForm';
import AddressForm from '../hotline/AddressForm';
import PageNotFound from "../components/PageNotFound";
import CheckCircleIcon from '@material-ui/icons/CheckCircle';

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

function getSteps(is_intake) {
  if (is_intake) {
    return ['Create Contacts', 'Create Animals'];
  }
  return ['Lookup Address', 'Create Contacts', 'Create Animals', 'Create Service Request'];
}

function getStepContent(incident, organization, step, handleStepSubmit, handleBack, state) {
  switch (step) {
    case 0:
      return <AddressForm onSubmit={handleStepSubmit} handleBack={handleBack} state={state} incident={incident} organization={organization} />
    case 1:
      return <PersonForm onSubmit={handleStepSubmit} handleBack={handleBack} state={state} incident={incident} organization={organization} />;
    case 2:
      return <AnimalForm onSubmit={handleStepSubmit} handleBack={handleBack} state={state} incident={incident} organization={organization} />;
    case 3:
      return <ServiceRequestForm onSubmit={handleStepSubmit} handleBack={handleBack} state={state} incident={incident} organization={organization} />;
    default:
      return <PageNotFound/>;
  }
}

export const initialWorkflowData = {
  stepIndex: 0,
  hasOwner: false,
  animalCount: 0,
  animalIndex: 0,
  shelter: null,
  steps: {
    initial: {
      address: '',
      apartment: '',
      city: '',
      state: '',
      zip_code: '',
      latitude: null,
      longitude: null,
    },
    reporter: {
      id: '',
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
      incident_slug: '',
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
      incident_slug: '',
      change_reason: '',},
    animals: [],
    request: {
      address: '',
      apartment: '',
      city: '',
      state: '',
      zip_code: '',
      latitude: null,
      longitude: null,
      directions:'',
      followup_date: new Date(),
      verbal_permission: false,
      key_required: false,
      accessible: false,
      turnaround: false,
      incident_slug: ''
    },
  }
}

function StepperWorkflow({ incident, organization }) {

  // Identify any query param data.
  const [queryParams] = useQueryParams();
  const {
    shelter_id = null,
  } = queryParams;
  // Set shelter if present.
  initialWorkflowData['shelter'] = Number(shelter_id);

  // Determine if this is an intake workflow.
  let is_intake = window.location.pathname.includes("intake");

  const classes = useStyles();
  // The major overall step tracker.
  const [activeStep, setActiveStep] = React.useState(0);
  const steps = getSteps(is_intake);

  // Tracks the workflow state and data.
  const [state, setState] = useState(initialWorkflowData);
  // Counts number of reporter + owner
  const [contactCount, setContactCount] = React.useState(0);

  function handleBack(currentStep, nextStep, data=null) {
    // Lower the active step if going backwards between major steps.
    if (nextStep === 'initial' || (currentStep === 'animals' && nextStep !== 'animals') || (currentStep === 'request' && nextStep === 'animals')) {
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
      steps: { ...prevState.steps, 'request':data ? data : prevState.steps.request } // Only set SR data if present.
    }))
  };

  function handleStepSubmit(currentStep, data, nextStep) {

    // Only count contacts the first time.
    if ((currentStep === 'reporter' && state.steps.reporter.first_name === '') || (currentStep === 'owner' && state.steps.owner.first_name === '')) {
      setContactCount((count) => count + 1);
    }

    // Populate owner and skip contact step if using matching owner.
    if (currentStep === 'initial' && nextStep === 'animals') {
      setContactCount((count) => count + 1);
      setState((prevState) => ({
        ...prevState,
        stepIndex: prevState.stepIndex + 2,
        steps: { ...prevState.steps, ['owner']:data, ['initial']:{address:data.address, city:data.city, state:data.state, apartment:data.apartment, zip_code:data.zip_code, latitude:data.latitude, longitude:data.longitude} }
      }))
    }
    else if (currentStep === 'initial' && nextStep === 'reporter') {
      setContactCount((count) => count + 1);
      setState((prevState) => ({
        ...prevState,
        stepIndex: prevState.stepIndex + 1,
        steps: { ...prevState.steps, ['owner']:data, ['initial']:{address:data.address, city:data.city, state:data.state, apartment:data.apartment, zip_code:data.zip_code, latitude:data.latitude, longitude:data.longitude} }
      }))
    }
    // Treat animals differently since we need an array of N animals.
    else if (currentStep === 'animals') {
      // Only increase animal index on save if we're adding another animal.
      var index = state.animalIndex;
      if (nextStep === 'animals') {
        index = index + 1;
      }
      // If we're not on the last animal, update the current animal based on the index.
      if (state.animalIndex !== state.steps.animals.length) {
        const animalList = [...state.steps.animals];
        let animal_count = animalList[state.animalIndex].get('animal_count');

        animalList[state.animalIndex] = data;
        setState((prevState) => ({
          ...prevState,
          stepIndex: prevState.stepIndex + 1,
          animalIndex: index,
          animalCount: prevState.animalCount - Number(animal_count) + Number(data.get('animal_count')),
          steps: { ...prevState.steps, [currentStep]:animalList }
        }))
      }
      // Otherwise add a new animal to the list.
      else if (data && data.get('animal_count')) {
        setState((prevState) => ({
          ...prevState,
          stepIndex: prevState.stepIndex + 1,
          animalIndex: index,
          animalCount: prevState.animalCount + Number(data.get('animal_count')),
          steps: { ...prevState.steps, [currentStep]:[...prevState.steps.animals, data] }
        }))
      }
      else {
        setState((prevState) => ({
          ...prevState,
          stepIndex: prevState.stepIndex + 1,
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
    if ((currentStep === 'initial') || (currentStep !== 'animals' && nextStep === 'animals') || (currentStep === 'animals' && nextStep === 'request')){
      setActiveStep((prevActiveStep) => prevActiveStep + (currentStep === 'initial' && nextStep === 'animals' ? 2 : 1));
    }
  }

  return (
    <div className={classes.root}>
      <Stepper className={classes.stepper} activeStep={activeStep}>
        {steps.map((label, index) => {
          const stepProps = {};
          const labelProps = {};
          if (index === 1) {
            labelProps.optional = <Typography variant="caption" component={'span'}>{contactCount} Contact{contactCount === 1 ? "" : "s"} Created</Typography>;
          }
          else if (index === 2) {
            labelProps.optional = <Typography variant="caption" component={'span'}>{state.animalCount} Animal{state.animalCount === 1 ? "" : "s"} Created</Typography>;
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
            <Typography className={classes.instructions} component={'span'}>{getStepContent(incident, organization, activeStep, handleStepSubmit, handleBack, state)}</Typography>
          </div>
      </div>
    </div>
  );
}

export default StepperWorkflow;
