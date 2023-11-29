import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import Select from 'react-select';
import SimpleValue from 'react-select-simple-value';
import { Button, Col, Row } from 'react-bootstrap';
import { Link, navigate } from "raviger";
import moment from 'moment';
import { AuthContext } from "./accounts/AccountsReducer";
import { SystemErrorContext } from './components/SystemError';

function Incident() {

  const { dispatch, state } = useContext(AuthContext);
  const { setShowSystemError } = useContext(SystemErrorContext);

  const [incident, setIncident] = useState({id: '', slug: '', name: ''});
  const [options, setOptions] = useState([]);

  const path = window.location.pathname;
  const org_slug = path.split('/')[1];

  const handleSubmit = (incident_name) => {
    dispatch({type: "SET_INCIDENT", data: incident_name});
    navigate(window.location.pathname + "/" + incident.slug);
  }

  const customStyles = {
    // For the select it self, not the options of the select
    control: (styles) => {
      return {
        ...styles,
        color: '#FFF',
        cursor: 'default',
        backgroundColor: 'white',
        height: 50,
        minHeight: 50
      }
    },
    option: provided => ({
      ...provided,
      color: 'black'
    }),
  };

  // Handle opening and closing an incident.
  const handleOpenCloseSubmit = async () => {
    await axios.patch('/incident/api/incident/' + incident.id + '/', {change_lock:true})
    .then(response => {
      let options_copy = [...options]
      options_copy.filter(option => option.value === response.data.id)[0]['label'] = response.data.name + ' (' + moment(response.data.start_time).format('MM/DD/YYYY') + (response.data.end_time ? ' - ' + moment(response.data.end_time).format('MM/DD/YYYY') : '') + ')';
      options_copy.filter(option => option.value === response.data.id)[0]['end_time'] = response.data.end_time
      setOptions(options_copy);
    })
    .catch(error => {
      setShowSystemError(true);
    });
  }

  // Hook for initializing data.
  useEffect(() => {
    let unmounted = false;
    let source = axios.CancelToken.source();

    const fetchIncidentData = async () => {
      // Fetch ServiceRequest data.
      await axios.get('/incident/api/incident/?organization=' + org_slug, {
        cancelToken: source.token,
      })
      .then(response => {
        if (!unmounted) {
          let options = [];
          response.data.forEach(incident => {
            // Build incident option list.
            if (!incident.end_time || state.user.is_superuser || state.user.incident_perms) {
              options.push({value: incident.id, label: incident.name + ' (' + moment(incident.start_time).format('MM/DD/YYYY') + (incident.end_time ? ' - ' + moment(incident.end_time).format('MM/DD/YYYY') : '') + ')', slug:incident.slug, name:incident.name, end_time:incident.end_time});
            }
          });
          setOptions(options)
        }
      })
      .catch(error => {
        if (!unmounted) {
          setShowSystemError(true);
        }
      });
    };
    fetchIncidentData();
    // Cleanup.
    return () => {
      unmounted = true;
      source.cancel();
    };
  }, [state.user.is_superuser, state.user.incident_perms]);

  return (
    <>
    <Row className='ml-auto mr-auto mt-auto align-bottom'>
      <h1 style={{fontSize:"100px", textTransform: 'capitalize'}}>{state.organization.name}</h1>
    </Row>
    <Col xs={{ span:5 }} className="border rounded border-light shadow-sm ml-auto mr-auto mb-auto" style={{maxHeight:state.user.is_superuser || state.user.incident_perms ? "309px" : "200px", minWidth:"572px"}}>
      <SimpleValue options={options}>
        {simpleProps => <Select styles={customStyles} {...simpleProps} className="mt-3" placeholder="Select incident..." onChange={(instance) => setIncident({id:instance.value, slug:instance.slug, name:instance.name})} />}
      </SimpleValue>
      <Button size="lg" className="btn-primary mt-3" onClick={() => handleSubmit(incident.name)} disabled={incident.id ? false : true} block>Select Incident</Button>
      {state.user.is_superuser || state.user.incident_perms ?
        <Row>
          <Col style={{marginRight:"-23px"}}>
            <Link href={'/' + org_slug + '/incident/edit/' + incident.id} style={{textDecoration:"none"}}><Button size="lg" className="btn-primary mt-2" disabled={incident.id ? false : true} block>Edit Incident</Button></Link>
          </Col>
          <Col>
            <Button size="lg" className="btn-primary mt-2" disabled={incident.id ? false : true} onClick={() => handleOpenCloseSubmit()} block>{incident.id && options.filter(option => option.value === incident.id)[0].end_time ? "Open" : "Close"} Incident</Button>
          </Col>
        </Row>
      : ""}
      {state.user.is_superuser || state.user.incident_perms ? <Link href={'/' + org_slug + '/incident/new'} style={{textDecoration:"none"}}><Button size="lg" className="btn-primary mt-2" block>Create New Incident</Button></Link> : ""}
      <Link href={"/"} style={{textDecoration:"none"}}><Button size="lg" className="btn-primary mt-2 mb-3" block>Return to Organizations</Button></Link>
    </Col>
    </>
  );
}

export default Incident;
