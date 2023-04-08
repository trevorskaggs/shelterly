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

  return (
    <>
    <span className="rounded-top">
      <Header>Home<span className="float-right">{state.user.version}</span></Header>
      <hr/>
    </span>
    </>
  );
}

export default Home;
