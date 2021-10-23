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
      if (state.user) {
        await axios.get('/reports/api/reports/', {
          cancelToken: source.token,
        })
        .then(response => {
          if (!unmounted) {
            setData({days: response.data, isFetching: false});
          }
        })
        .catch(error => {
          if (!unmounted) {
            setData({days: [], isFetching: false});
          }
        });
      }
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
      name: 'New SRs Worked',
      selector: row => row.new_sr_worked,
  },
    {
        name: 'SIP SRs Worked',
        selector: row => row.sip_sr_worked,
    },
    {
      name: 'UTL SRs Worked',
      selector: row => row.utl_sr_worked,
    },
    {
      name: 'Total SRs Worked',
      selector: row => row.total,
    },
    {
      name: '# Evac Teams',
      selector: row => row.teams,
    },
    {
      name: 'SRs Per Team',
      selector: row => row.sr_per_team,
    },
  ];


  return (
    <>
    {!state.user && !cookies.token ? <LoginForm /> :
    <span>
      <h3>Daily Report</h3>
      <DataTable
          columns={daily_columns}
          data={data.days.daily_report}
          pagination
      />
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
