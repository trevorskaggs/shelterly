import React, { useContext, useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { AnimalForm } from '../animals/AnimalForms';
import { PersonForm } from '../people/PeopleForms';
import { ServiceRequestForm } from './HotlineForms';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  button: {
    marginRight: theme.spacing(1),
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
      return <PersonForm onSubmit={handleStepSubmit} handleBack={handleBack} />;
    case 1:
      return <AnimalForm onSubmit={handleStepSubmit} handleBack={handleBack} state={state} />;
    case 2:
      return <ServiceRequestForm />;
    default:
      return 'Unknown step';
  }
}

export default function HotlineWorkflow() {
  const classes = useStyles();
  const [activeStep, setActiveStep] = React.useState(0);
  const steps = getSteps();
  const [state, setState] = useState({
    activeStep: 0,
    steps: {
      reporter: {},
      owner: {},
      animals: [],
      request: {},
    }
  });
  const [contactCount, setContactCount] = React.useState(0);

  function handleBack () {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  function handleStepSubmit (stepIndex, data, next) {
    if (stepIndex === 'animals') {
      setState((prevState) => ({
        ...prevState,
        activeStep: prevState.activeStep + 1,
        steps: { ...prevState, [stepIndex]:[...prevState.animals, data] }
      }))
    }
    else {
      setState((prevState) => ({
        ...prevState,
        activeStep: prevState.activeStep + 1,
        steps: { ...prevState, [stepIndex]:data }
      }))
    }
    if (next === 'forward'){
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
    setContactCount((count) => count + 1);
  }

  return (
    <div className={classes.root}>
      <Stepper activeStep={activeStep}>
        {steps.map((label, index) => {
          const stepProps = {};
          const labelProps = {};
          if (index === 0) {
            labelProps.optional = <Typography variant="caption" component={'span'}>{contactCount} Contact{contactCount === 1 ? "" : "s"} Created</Typography>;
          }
          else if (index === 1) {
            labelProps.optional = <Typography variant="caption" component={'span'}>0 Animals Created</Typography>;
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