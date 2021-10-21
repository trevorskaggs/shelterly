import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import DataTable from 'react-data-table-component';
import LoginForm from "./accounts/LoginForm";
import { useCookies } from 'react-cookie';
import moment from 'moment';
import { AuthContext } from "./accounts/AccountsReducer";
import Header from './components/Header';

function Home() {

  // Initial state.
  const { state } = useContext(AuthContext);
  const [cookies] = useCookies(['token']);

  const [data, setData] = useState({days: [], isFetching: false});

  // Hook for initializing data.
  useEffect(() => {
    let unmounted = false;
    let source = axios.CancelToken.source();

    const fetchServiceRequests = async () => {
      setData({days: [], isFetching: true});
      // Fetch ServiceRequest data.
      await axios.get('/reports/api/reports/', {
        cancelToken: source.token,
      })
      .then(response => {
        if (!unmounted) {
          console.log(response.data)
          setData({days: response.data, isFetching: false});
        }
      })
      .catch(error => {
        if (!unmounted) {
          setData({days: [], isFetching: false});
        }
      });
    };
    fetchServiceRequests();
    // Cleanup.
    return () => {
      unmounted = true;
      source.cancel();
    };
  }, [state.user]);

  const daily_columns = [
    {
        name: 'Date',
        selector: row => row.date,
        format: row => moment(row.date).format('MM/DD/YY')
    },
    {
        name: 'New SRs',
        selector: row => row.new,
    },
    {
      name: 'SRs Worked',
      selector: row => row.assigned,
    },
    {
      name: 'Total SRs',
      selector: row => row.total,
    },
  ];

  const sr_worked_columns = [
    {
        name: 'Date',
        selector: row => row.date,
        format: row => moment(row.date).format('MM/DD/YY')
    },
    {
        name: 'SIP SRs Worked',
        selector: row => row.new,
    },
    {
      name: 'UTL SRs Worked',
      selector: row => row.assigned,
    },
    {
      name: 'Total SRs Worked',
      selector: row => row.total,
    },
    {
      name: '# Evac Teams',
      selector: row => row.total,
    },
    {
      name: 'SRs Per Team',
      selector: row => row.total,
    },
  ];


  return (
    <>
    {!state.user && !cookies.token ? <LoginForm /> :
    <span>
      <Header>Home</Header>
      <hr/>
      <h3>Daily Report</h3>
      <DataTable
          columns={daily_columns}
          data={data.days.daily_report}
          pagination
      />
      <hr/>
      <h3>SR Worked Report</h3>
      <DataTable
          columns={sr_worked_columns}
          data={data.days.sr_worked_report}
          pagination
      />
      <br/>
    </span>
    }
    </>
  );
}

export default Home;
