import React, { useState, useEffect } from 'react';
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

function getSteps(is_intake, sr_id) {
  if (is_intake) {
    return ['Create Contacts', 'Create Animals'];
  }
  return ['Lookup Address', 'Create Contacts', 'Create Animals', (sr_id ? 'Update' : 'Create') + ' Service Request'];
}

function getStepContent(incident, organization, step, handleStepSubmit, handleBack, state, is_intake) {
  switch (is_intake ? step + 1 : step) {
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
  ownerIndex: 0,
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
      organization_slug: '',
      change_reason: '',},
    owners: [],
    // owner: {
    //   id: '',
    //   first_name: '',
    //   last_name: '',
    //   phone: '',
    //   alt_phone: '',
    //   email: '',
    //   drivers_license: '',
    //   comments: '',
    //   agency: '',
    //   address: '',
    //   apartment: '',
    //   city: '',
    //   state: '',
    //   zip_code: '',
    //   latitude: null,
    //   longitude: null,
    //   incident_slug: '',
    //   change_reason: '',},
    animals: [],
    request: {
      id: '',
      address: '',
      apartment: '',
      city: '',
      state: '',
      zip_code: '',
      latitude: null,
      longitude: null,
      directions:'',
      followup_date: new Date().toJSON().slice(0, 10),
      verbal_permission: false,
      key_required: false,
      accessible: false,
      turnaround: false,
      incident_slug: '',
      owner_objects: [],
      organization_slug: '',
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
  initialWorkflowData['stepIndex'] = 0;

  // Determine if this is an intake workflow.
  let is_intake = window.location.pathname.includes("intake");

  const classes = useStyles();

  // Tracks the workflow state and data.
  const [state, setState] = useState(initialWorkflowData);

  // The major overall step tracker.
  const [activeStep, setActiveStep] = React.useState(0);
  const steps = getSteps(is_intake, state.steps.request.id);

  // Counts number of reporter + owner
  const [contactCount, setContactCount] = React.useState({'new':0, 'existing':0});

  function handleBack(currentStep, nextStep, data=null) {
    // Lower the active step if going backwards between major steps.
    if (nextStep === 'initial' || (currentStep === 'animals' && nextStep !== 'animals') || (currentStep === 'request' && nextStep === 'animals')) {
      setActiveStep((prevActiveStep) => prevActiveStep - 1);
    }

    // Reduce the owner index when going backward from an owner to another owner.
    var owner_track_index = state.ownerIndex;
    if (nextStep === 'owners' && currentStep === 'owners') {
      owner_track_index = state.ownerIndex -1;
    }

    // Reduce the animal index when going backward from an animal to another animal.
    var track_index = state.animalIndex;
    if (nextStep === 'animals' && currentStep === 'animals') {
      track_index = state.animalIndex -1;
    }
    // Reset state if going back to address lookup.
    if (nextStep === 'initial') {
      setState(initialWorkflowData);
      setContactCount({new:0, existing:0});
    }
    else {
      setState((prevState) => ({
        ...prevState,
        hasOwner: nextStep === 'owners',
        stepIndex: prevState.stepIndex - 1,
        animalIndex: track_index,
        ownerIndex: owner_track_index,
        steps: { ...prevState.steps, 'request':data ? data : prevState.steps.request } // Only set SR data if present.
      }))
    }
  };

  function handleStepSubmit(currentStep, data, nextStep, allData={}) {

    // Populate data if existing SR was picked.
    if (currentStep === 'initial' && Object.keys(allData).length) {
      setState((prevState) => ({
        ...prevState,
        stepIndex: prevState.stepIndex + 1,
        animalCount: allData.animal_count,
        steps: { ...prevState.steps, ['owners']:allData.owner_objects, ['animals']:allData.animals, ['request']:allData, ['initial']:{address:data.address, city:data.city, state:data.state, apartment:data.apartment, zip_code:data.zip_code, latitude:data.latitude, longitude:data.longitude} }
      }))
    }
    // Otherwise proceed without SR data.
    else if (currentStep === 'initial') {
      setState((prevState) => ({
        ...prevState,
        stepIndex: prevState.stepIndex + 1,
        steps: { ...prevState.steps, ['owners']:data.id ? [...prevState.steps.owners, data] : [], ['initial']:{address:data.address, city:data.city, state:data.state, apartment:data.apartment, zip_code:data.zip_code, latitude:data.latitude, longitude:data.longitude} }
      }))
    }
    // Treat owners differently since we need an array of N owners.
    else if (currentStep === 'owners') {
      // Only increase owner index on save if we're adding another owner.
      var index = state.ownerIndex;
      if (nextStep === 'owners') {
        index = index + 1;
      }
      // If we're not on the last owner, update the current owner based on the index.
      if (state.ownerIndex !== state.steps.owners.length) {
        const ownerList = [...state.steps.owners];
        ownerList[state.ownerIndex] = data;
        setState((prevState) => ({
          ...prevState,
          stepIndex: prevState.stepIndex + 1,
          ownerIndex: index,
          steps: { ...prevState.steps, [currentStep]:ownerList }
        }))
      }
      else {
        setState((prevState) => ({
          ...prevState,
          stepIndex: prevState.stepIndex + 1,
          ownerIndex: index,
          steps: { ...prevState.steps, [currentStep]:[...prevState.steps.owners, data] }
        }))
      }
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
        let animal_count = 0;
        if (animalList[state.animalIndex] instanceof FormData) {
          animal_count = animalList[state.animalIndex].get('animal_count');
        }
        else {
          animal_count = animalList[state.animalIndex].animal_count
        }

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
      else if (data instanceof FormData) {
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
        hasOwner: nextStep === 'owners',
        stepIndex: prevState.stepIndex + 1,
        steps: { ...prevState.steps, [currentStep]:data }
      }))
    }

    // Only bump up the major active step when moving to a new type of object creation.
    if ((currentStep === 'initial') || (currentStep !== 'animals' && nextStep === 'animals') || (currentStep === 'animals' && nextStep === 'request')){
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  }

  // Calculate number of contacts.
  useEffect(() => {
    setContactCount({new:state.steps.owners.filter(owner => !owner.id).length + (state.steps.reporter.first_name && !state.steps.reporter.id ? 1 : 0), existing:state.steps.owners.filter(owner => owner.id).length + (state.steps.reporter.first_name && state.steps.reporter.id ? 1 : 0)});
  }, [state.steps.owners.length, state.steps.reporter.id]);

  return (
    <div className={classes.root}>
      <Stepper className={classes.stepper} activeStep={activeStep}>
        {steps.map((label, index) => {
          const stepProps = {};
          const labelProps = {};
          if (index === 0 && !is_intake && state.steps.initial.address) {
            labelProps.optional = <Typography variant="caption" component={'span'}><div>{state.steps.initial.address}</div><div>{state.steps.initial.apartment ? <span>Apt #{state.steps.initial.apartment}, </span> : ""}{state.steps.initial.city}, {state.steps.initial.state}</div></Typography>;
          }
          if ((index === 1 && !is_intake) || (is_intake && index === 0)) {
            labelProps.optional = <Typography variant="caption" component={'span'}><div>{contactCount.new} Contact{contactCount.new === 1 ? "" : "s"} Created</div>{contactCount.existing ? <div>{contactCount.existing} Contact{contactCount.existing === 1 ? "" : "s"} Updated</div> : ""}</Typography>;
          }
          else if ((index === 2 && !is_intake) || (is_intake && index === 1)) {
            labelProps.optional = <Typography variant="caption" component={'span'}><div>{state.steps.animals.filter(animal => !animal.id).length || 0} Animal{state.steps.animals.filter(animal => !animal.id).length === 1 ? "" : "s"} Created</div>{state.steps.animals.filter(animal => animal.id).length ? <div>{state.steps.animals.filter(animal => animal.id).length} Animal{state.steps.animals.filter(animal => !animal.id).length === 1 ? "" : "s"} Updated</div> : ""}</Typography>;
          }
          return (
            <Step key={label} {...stepProps}>
              <StepLabel
                // Use a custom checkbox for completed state in order to have a white background.
                StepIconComponent={activeStep < index + 1 ? undefined : CustomStepIcon}
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
                {...labelProps}><span className="steps">{label}</span>
              </StepLabel>
            </Step>
          );
        })}
      </Stepper>
      <div>
          <div>
            <Typography className={classes.instructions} component={'span'}>{getStepContent(incident, organization, activeStep, handleStepSubmit, handleBack, state, is_intake)}</Typography>
          </div>
      </div>
    </div>
  );
}

export default StepperWorkflow;
