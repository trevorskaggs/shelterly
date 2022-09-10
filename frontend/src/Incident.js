import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import Select from 'react-select';
import SimpleValue from 'react-select-simple-value';
import { Button, Col, Row } from 'react-bootstrap';
import { Link } from "raviger";
import moment from 'moment';
import { useCookies } from 'react-cookie';
import { AuthContext } from "./accounts/AccountsReducer";
import { logoutUser } from "./accounts/AccountsUtils";
import { SystemErrorContext } from './components/SystemError';

function Home() {

  const { dispatch, state } = useContext(AuthContext);
  const { setShowSystemError } = useContext(SystemErrorContext);

  const [incident, setIncident] = useState({id: '', slug: ''});
  const [options, setOptions] = useState([]);
  const [, , removeCookie] = useCookies(['token']);

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
      await axios.get('/incident/api/incident/', {
        cancelToken: source.token,
      })
      .then(response => {
        if (!unmounted) {
          let options = [];
          response.data.forEach(incident => {
            // Build incident option list.
            if (!incident.end_time || state.user.is_superuser || state.user.incident_perms) {
              options.push({value: incident.id, label: incident.name + ' (' + moment(incident.start_time).format('MM/DD/YYYY') + (incident.end_time ? ' - ' + moment(incident.end_time).format('MM/DD/YYYY') : '') + ')', slug:incident.slug, end_time:incident.end_time});
            }
          });
          setOptions(options)
        }
      })
      .catch(error => {
        setShowSystemError(true);
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
      <img src="/static/images/shelterly.png" alt="Logo" style={{height:"120px", width:"120px", marginTop:"-4px", marginLeft:"-4px"}} />
      <h1  style={{fontSize:"100px"}}>Shelterly</h1>
    </Row>
    <Col xs={{ span:5 }} className="border rounded border-light shadow-sm ml-auto mr-auto mb-auto" style={{maxHeight:state.user.is_superuser || state.user.incident_perms ? "309px" : "200px", minWidth:"572px"}}>
      <SimpleValue options={options}>
        {simpleProps => <Select styles={customStyles} {...simpleProps} className="mt-3" placeholder="Select incident..." onChange={(instance) => setIncident({id:instance.value, slug:instance.slug})} />}
      </SimpleValue>
      <Link href={incident.slug} style={{textDecoration:"none"}}><Button size="lg" className="btn-primary mt-3" disabled={incident.id ? false : true} block>Select Incident</Button></Link>
      {state.user.is_superuser || state.user.incident_perms ?
        <Row>
          <Col style={{marginRight:"-23px"}}>
            <Link href={'/incident/edit/' + incident.id} style={{textDecoration:"none"}}><Button size="lg" className="btn-primary mt-2" disabled={incident.id ? false : true} block>Edit Incident</Button></Link>
          </Col>
          <Col>
            <Button size="lg" className="btn-primary mt-2" disabled={incident.id ? false : true} onClick={() => handleOpenCloseSubmit()} block>{incident.id && options.filter(option => option.value === incident.id)[0].end_time ? "Open" : "Close"} Incident</Button>
          </Col>
        </Row>
      : ""}
      {state.user.is_superuser || state.user.incident_perms ? <Link href={'/incident/new'} style={{textDecoration:"none"}}><Button size="lg" className="btn-primary mt-2" block>Create New Incident</Button></Link> : ""}
      <Button size="lg" className="btn-primary mt-2 mb-3" onClick={() => logoutUser({dispatch}, {removeCookie})} block>Return to Login</Button>
    </Col>
    </>
  );
}

export default Home;
