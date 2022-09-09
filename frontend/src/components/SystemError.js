import React, { useState } from 'react';
import { SystemErrorModal } from '../components/Modals.js';

export const SystemErrorContext = React.createContext();

export function SystemErrorProvider(props) {

  const [showSystemError, setShowSystemError] = useState(false);

  return (
    <SystemErrorContext.Provider value={{ setShowSystemError }}>
      {props.children}
      <SystemErrorModal showSystemError={showSystemError} setShowSystemError={setShowSystemError} />
    </SystemErrorContext.Provider>
  );
};