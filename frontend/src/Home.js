import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import DataTable from 'react-data-table-component';
import { Row } from 'react-bootstrap';
import Select from 'react-select';
import moment from 'moment';
import { AuthContext } from "./accounts/AccountsReducer";
import Header from './components/Header';
import { DateRangePicker } from './components/Form';
import { SystemErrorModal } from './components/Modals';

function Home({ incident }) {

  // Initial state.
  const { state } = useContext(AuthContext);

  const [data, setData] = useState({'isFetching':true, 'daily_report':[], 'sr_worked_report':[], 'shelter_report':[], 'animal_status_report':[], 'animal_owner_report':[], 'animals_deceased_report':[]});
  const [selection, setSelection] = useState({value:'daily', label:"Daily Report"});

  const [storeDate, setStoreDate] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(moment().format('YYYY-MM-DD'));

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);

  // Hook for initializing data.
  useEffect(() => {
    let unmounted = false;
    let source = axios.CancelToken.source();

    const fetchServiceRequests = async () => {
      // Fetch ServiceRequest data.
      await axios.get('/reports/api/reports/?incident=' + incident, {
        cancelToken: source.token,
      })
      .then(response => {
        if (!unmounted) {
          response.data['isFetching'] = false;
          setData(response.data);
          // Hide Shelter Report species columns if there are 0 animals.
          let columns=[...shelterColumns];
          columns.forEach(col => {
            let count = 0;
            response.data['shelter_report'].forEach(shelter => {
              count = count + shelter[col.name.toLowerCase()]
            })
            if (count === 0) {
              col.omit = true;
            }
          })
          setShelterColumns(columns);
        }
      })
      .catch(error => {
        if (!unmounted) {
          setData({'isFetching':false, 'daily_report':[], 'sr_worked_report':[], 'shelter_report':[], 'animal_status_report':[], 'animal_owner_report':[], 'animals_deceased_report':[]});
          setShow(true);
        }
      });
    };
    fetchServiceRequests();
    // Cleanup.
    return () => {
      unmounted = true;
      source.cancel();
    };
  }, [state.user, incident]);

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
      grow: 1,
    },
    {
      name: 'Alpacas',
      selector: row => row.alpacas,
      compact: true,
    },
    {
      name: 'Cats',
      selector: row => row.cats,
      compact: true,
    },
    {
      name: 'Cows',
      selector: row => row.cows,
      compact: true,
    },
    {
      name: 'Dogs',
      selector: row => row.dogs,
      compact: true,
    },
    {
      name: 'Donkeys',
      selector: row => row.donkeys,
      compact: true,
    },
    {
      name: 'Ducks',
      selector: row => row.ducks,
      compact: true,
    },
    {
      name: 'Emus',
      selector: row => row.emus,
      compact: true,
    },
    {
      name: 'Goats',
      selector: row => row.goats,
      compact: true,
    },
    {
      name: 'Horses',
      selector: row => row.horses,
      compact: true,
    },
    {
      name: 'Llamas',
      selector: row => row.llamas,
      compact: true,
    },
    {
      name: 'Other',
      selector: row => row.other,
      compact: true,
    },
    {
      name: 'Pigs',
      selector: row => row.pigs,
      compact: true,
    },
    {
      name: 'Rabbits',
      selector: row => row.rabbits,
      compact: true,
    },
    {
      name: 'Sheep',
      selector: row => row.sheep,
      compact: true,
    },
    {
      name: 'Turkeys',
      selector: row => row.turkeys,
      compact: true,
    },
    {
      name: 'Total',
      selector: row => row.total,
      compact: true,
    },
  ];

  const [shelterColumns, setShelterColumns] = useState(shelter_columns);

  const animal_status_columns = [
    {
      name: 'Species',
      selector: row => row.species[0].toUpperCase() + row.species.slice(1),
    },
    {
      name: 'Reported',
      selector: row => row.reported,
    },
    {
      name: 'UTL',
      selector: row => row.utl,
    },
    {
      name: 'UTL - NFA',
      selector: row => row.nfa,
    },
    {
      name: 'Sheltered',
      selector: row => row.sheltered,
    },
    {
      name: 'SIP',
      selector: row => row.sip,
    },
    {
      name: 'Reunited',
      selector: row => row.reunited,
    },
    {
      name: 'Deceased',
      selector: row => row.deceased,
    },
    {
      name: 'Total',
      selector: row => row.total,
    },
  ];

  const animal_owner_columns = [
    {
      name: 'Species',
      selector: row => row.species[0].toUpperCase() + row.species.slice(1),
    },
    {
      name: 'Owned',
      selector: row => row.owned,
    },
    {
      name: 'Stray',
      selector: row => row.stray,
    },
    {
      name: 'Total',
      selector: row => row.total,
    },
  ];

  const animal_deceased_columns = [
    {
      name: 'Date',
      selector: row => moment(row.date).format('MM/DD/YY'),
    },
    {
      name: 'ID',
      selector: row => row.id,
    },
    {
      name: 'Name',
      selector: row => row.name || 'Unknown',
    },
    {
      name: 'Address',
      selector: row => row.address + (row.city ? (", " + row.city) : ", ") + ", " + row.state + " " + row.zip_code,
      grow: 2,
    },
    {
      name: 'Species',
      selector: row => row.species[0].toUpperCase() + row.species.slice(1),
    },
    {
      name: 'STATUS',
      selector: row => row.status,
    },
  ];

  const reportChoices = [
    {value:'daily', label:"Daily Report"},
    {value:'worked', label:"Service Requests Worked Report"},
    {value:'shelter', label:"Shelter Report"},
    {value:'animal_deceased', label:"Deceased Animal Report"},
    {value:'animal_status', label:"Total Animals By Status Report"},
    {value:'animal_owner', label:"Total Animals By Ownership Report"},
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
    <span className="rounded-top">
      <Header>Home<span className="float-right">{state.user.version}</span></Header>
      <hr/>
      <Row className="ml-0">
      <Select
        label="Reports"
        name="reports"
        className="mb-2 w-50"
        options={reportChoices}
        value={selection}
        isClearable={false}
        styles={customStyles}
        onChange={(instance) => {
          setSelection(instance)
        }}
      />
      { selection.value === 'daily' || selection.value === 'worked' ?
      <DateRangePicker
        name={`date_range_picker`}
        id={`date_range_picker`}
        placeholder={"Filter by Date Range"}
        onChange={(dateRange) => {
          setStoreDate(dateRange);
          if (!dateRange.length) {
            setStartDate(null);
          }
          else if (dateRange.length > 1) {
            let parsedDateRange = dateRange.toString().split(',');
            setStartDate(moment(parsedDateRange[0]).format('YYYY-MM-DD'));
            setEndDate(moment(parsedDateRange[1]).format('YYYY-MM-DD'));
          }
          else {
            setStartDate(moment(dateRange[0]).format('YYYY-MM-DD'));
            setEndDate(moment(dateRange[0]).format('YYYY-MM-DD'));
          }
        }}
        value={storeDate}
        style={{height:"36px", width:"48%", marginLeft:"6px"}}
      />
      : ""}
      </Row>
      {selection.value === 'daily' ?
      <DataTable
          columns={daily_columns}
          data={data && data.daily_report ? data.daily_report.filter(row => (startDate ? startDate <= moment(row.date)
          .format('YYYY-MM-DD') && endDate >= moment(row.date).format('YYYY-MM-DD') : row)) : []}
          pagination
          striped
          noDataComponent={data && data.daily_report.length === 0 && !data.isFetching ? <div style={{padding:"24px"}}>There are no records to display</div> : <div style={{padding:"24px"}}>Fetching report data...</div>}
      />
      : selection.value === 'worked' ?
      <DataTable
          columns={sr_worked_columns}
          data={data && data.sr_worked_report ? data.sr_worked_report.filter(row => (startDate ? startDate <= moment(row.date)
            .format('YYYY-MM-DD') && endDate >= moment(row.date).format('YYYY-MM-DD') : row)) : []}
          pagination
          striped
      />
      : selection.value === 'shelter' ?
      <DataTable
          columns={shelterColumns}
          data={data.shelter_report}
          pagination
          striped
      />
      : selection.value === 'animal_status' ?
      <DataTable
          columns={animal_status_columns}
          data={data.animal_status_report}
          pagination
          striped
      />
      : selection.value === 'animal_owner' ?
      <DataTable
          columns={animal_owner_columns}
          data={data.animal_owner_report}
          pagination
          striped
      />
      : selection.value === 'animal_deceased' ?
      <DataTable
          columns={animal_deceased_columns}
          data={data.animal_deceased_report}
          pagination
          striped
      />
      :
      <span></span>
      }
    </span>
    <SystemErrorModal show={show} handleClose={handleClose} />
    </>
  );
}

export default Home;
