import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import DataTable from 'react-data-table-component';
import { Row } from 'react-bootstrap';
import Select from 'react-select';
import moment from 'moment';
import { AuthContext } from "./accounts/AccountsReducer";
import Header from './components/Header';
import { DateRangePicker } from './components/Form';
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
      <h4>{state.incident.description}</h4>
      <iframe
        src={watchdutyUrl}
        width="100%"
        height="635"
        scrolling="no"
        frameBorder="0"
        style={{
          width: "100%",
          overflow: "auto",
        }}
      >
      </iframe>
    </span>
    </>
  );
}

export default Home;
