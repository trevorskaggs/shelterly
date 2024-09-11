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

  const watchdutyUrl = "https://app.watchduty.org/#/i/" + state.incident.watchduty_map_id;

  return (
    <>
    <span className="rounded-top">
      <Header>Home<span className="float-right">{state.user.version}</span></Header>
      <hr/>
      { state.incident.watchduty_map_id ? 
      <div style={{height:"635px" }}>
        <iframe
          src={watchdutyUrl}
          width="100%"
          height="100%"
          scrolling="no"
          frameBorder="0"
          style={{
            width: "100%"
          }}
        >
        </iframe>
      </div>
      : ""}
      <h4>Incident Description: {state.incident.description}</h4>
    </span>
    </>
  );
}

export default Home;
