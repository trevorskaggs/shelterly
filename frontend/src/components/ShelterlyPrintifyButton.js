import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPrint } from '@fortawesome/free-solid-svg-icons';
import ButtonSpinner from '../components/ButtonSpinner';
import { useSubmitting } from '../hooks';

import '../assets/styles.css';

const ShelterlyPrintifyButton = ({
  printFunc,
  spinnerSize = 1.5,
  id = 'shelterly-printify-button',
  tooltipPlacement = 'bottom',
  tooltipText = 'Printify',
  disabled = false,
  disabledClassName = 'text-dark'
}) => {
  const {
    isSubmitting,
    handleSubmitting,
    submittingComplete
  } = useSubmitting({ uiLabel: '' });

  const handleClick = (e) => {
    e.preventDefault();
    if (disabled) return;

    handleSubmitting()
      .then(printFunc)
      .then(() => submittingComplete());
  }

  return (
    <OverlayTrigger
      key={`offline-${id}`}
      placement={`${tooltipPlacement}`}
      overlay={
        <Tooltip id={`tooltip-offline-${id}`}>
          {tooltipText}
        </Tooltip>
      }
    >
      {({ ref, ...triggerHandler }) => (
        <ButtonSpinner
          data-testid="button-test-component"
          as="a"
          variant="outline-light"
          className="fa-icon-spinner-button ml-1 mr-2"
          onClick={handleClick}
          isSubmitting={isSubmitting}
          isSubmittingText={''}
          spinnerProps={{
            size: undefined,
            variant: 'light',
            style: {
              height: `${spinnerSize}rem`,
              width: `${spinnerSize}rem`
            }
          }}
          {...triggerHandler}
        >
          <span ref={ref} data-testid="icon-test-component"><FontAwesomeIcon icon={faPrint} className={`${disabled ? disabledClassName : ''}`} inverse /></span>
        </ButtonSpinner>
      )}
    </OverlayTrigger>
  )
};

export default ShelterlyPrintifyButton;
