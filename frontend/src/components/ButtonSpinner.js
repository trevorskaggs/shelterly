import React, { useRef } from "react";
import { Button, Spinner } from "react-bootstrap";

const ButtonSpinner = ({
  as = Button,
  isSubmitting = false,
  isSubmittingText = 'Loading...',
  children,
  spinnerProps,
  ...buttonProps
}) => {
  const ButtonComponent = as;

  const childrenRef = useRef({
    children,
    isLoading: false
  });

  const loadingComponent = (
    <>
      <Spinner
        {...{
          as: 'span',
          animation: 'border',
          size: 'sm',
          role: 'status',
          'aria-hidden': 'true',
          ...spinnerProps
        }}
      />
      <span className="visually-hidden ml-2 fa-move-up">{isSubmittingText}</span>
    </>
  );

  childrenRef.current = {
    children: isSubmitting ? loadingComponent : children,
    isLoading: isSubmitting
  }

  return <ButtonComponent {...buttonProps} disabled={childrenRef.current.isLoading || buttonProps.disabled}>
    {childrenRef.current.children}
  </ButtonComponent>
};

export default ButtonSpinner;