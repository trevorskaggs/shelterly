import React, { useContext, useEffect, useState } from "react";

import { AuthContext } from "./accounts/AccountsReducer";
import Header from './components/Header';
import { SystemErrorContext } from './components/SystemError';

function Home({ incident }) {

  // Initial state.
  const { state } = useContext(AuthContext);

  // Hook for initializing data.
  useEffect(() => {
  }, [state.user, incident]);

  return (
    <>
    <span className="rounded-top">
      <Header>Home<span className="float-right">{state.user.version}</span></Header>
      <hr/>
      <h4>{state.incident.description}</h4>
    </span>
    </>
  );
}

export default Home;
