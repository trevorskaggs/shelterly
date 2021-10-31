import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import DataTable from 'react-data-table-component';
import LoginForm from "./accounts/LoginForm";
import { useCookies } from 'react-cookie';
import Select from 'react-select';
import moment from 'moment';
import { AuthContext } from "./accounts/AccountsReducer";
import Header from './components/Header';

function Home() {

  // Initial state.
  const { state } = useContext(AuthContext);
  const [cookies] = useCookies(['token']);

  const [data, setData] = useState({days: [], isFetching: false});
  const [selection, setSelection] = useState({value:'daily', label:"Daily Report"});

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

  const shelter_columns = [
    {
        name: 'Name',
        selector: row => row.name,
        format: row => row.name
    },
    {
        name: 'Dogs',
        selector: row => row.dogs,
    },
    {
      name: 'Cats',
      selector: row => row.cats,
    },
    {
      name: 'Horses',
      selector: row => row.horses,
    },
    {
      name: 'Other',
      selector: row => row.other,
    },
    {
      name: 'Total',
      selector: row => row.total,
    },
  ];

  const reportChoices = [
    {value:'daily', label:"Daily Report"},
    {value:'worked', label:"SR Worked Report"},
    {value:'shelter', label:"Shelter Report"},
    // {value:'giant', label:"Giant"},
  ]

  const customStyles = {
    // For the select it self, not the options of the select
    control: (styles, { isDisabled}) => {
      return {
        ...styles,
        color: '#FFF',
        cursor: isDisabled ? 'not-allowed' : 'default',
        backgroundColor: isDisabled ? '#DFDDDD' : 'white',
        height: 35,
        minHeight: 35
      }
    },
    option: provided => ({
      ...provided,
      color: 'black'
    }),
  };

  return (
    <>
    {!state.user && !cookies.token ? <LoginForm /> :
    <span className="rounded-top">
      <Header>Home</Header>
      <hr/>
      <Select
          label="Reports"
          name="reports"
          options={reportChoices}
          value={selection}
          isClearable={false}
          styles={customStyles}
          onChange={(instance) => {
            setSelection(instance)
          }}
        />
      {selection.value === 'daily' ?
      <DataTable
          columns={daily_columns}
          data={data.days.daily_report}
          pagination
      />
      : selection.value === 'worked' ?
      <DataTable
          columns={sr_worked_columns}
          data={data.days.sr_worked_report}
          pagination
      />
      :
      <DataTable
          columns={shelter_columns}
          data={data.days.shelter_report}
          pagination
      />
      }
    </span>
    }
    </>
  );
}

export default Home;
