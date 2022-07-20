import React, { useRef } from "react";
import { Button, Spinner } from "react-bootstrap";

const ButtonSpinner = ({
  isSubmitting = false,
  isSubmittingText = 'Loading...',
  children,
  ...buttonProps
}) => {
  const childrenRef = useRef({
    children,
    isLoading: false
  });

  const loadingComponent = (
    <>
      <Spinner
        as="span"
        animation="border"
        size="sm"
        role="status"
        aria-hidden="true"
      />
      <span className="visually-hidden ml-2 fa-move-up">{isSubmittingText}</span>
    </>
  );

  childrenRef.current = {
    children: isSubmitting ? loadingComponent : children,
    isLoading: isSubmitting
  }

  return <Button {...buttonProps} disabled={childrenRef.current.isLoading || buttonProps.disabled}>
    {childrenRef.current.children}
  </Button>
};

export default ButtonSpinner;