import { useState } from "react";

/**
 * a simple hook for using a submitting state
 * @param {object} [param0]
 * @param {string} [uiLabel='Printifying...   '] optionally use this as the submitting label message in the UI
 * @param {string} [defaultId='defaultId'] optionally provide an identifier for working with multiple spinners
 * @returns 
 */
function useSubmitting({
  uiLabel = 'Printifying...   ',
  defaultId = 'defaultId'
} = {}) {
  const submittingLabel = uiLabel;
  const [isSubmitting, setIsSubmitting] = useState({ [defaultId]: false });

  function submittingComplete(submittingId = defaultId) {
    setIsSubmitting((oldState) => ({
      ...oldState,
      [submittingId]: false
    }));
  }

  async function handleSubmitting(submittingId = defaultId) {
    setIsSubmitting((oldState) => ({
      ...oldState,
      [submittingId]: true
    }));
    await new Promise((resolve) => setTimeout(resolve, 1));
  }

  function isSubmittingById(submittingId = defaultId) {
    if (submittingId in isSubmitting) {
      return isSubmitting[submittingId];
    }
    return false;
  }

  return {
    isSubmitting: isSubmittingById(),
    isSubmittingById,
    submittingComplete,
    handleSubmitting,
    submittingLabel
  };
}

export default useSubmitting;
