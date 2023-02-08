import { useState } from "react";

/**
 * a simple hook for using a submitting state
 * @param {object} [param0]
 * @param {string} [uiLabel='Printifying...   '] optionally use this as the submitting label message in the UI
 * @returns 
 */
function useSubmitting({
  uiLabel = 'Printifying...   '
} = {}) {
  const submittingLabel = uiLabel;
  const [isSubmitting, setIsSubmitting] = useState(false);

  function submittingComplete() {
    setIsSubmitting(false);
  }

  async function handleSubmitting() {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1));
  }

  return {
    isSubmitting,
    submittingComplete,
    handleSubmitting,
    submittingLabel
  };
}

export default useSubmitting;
