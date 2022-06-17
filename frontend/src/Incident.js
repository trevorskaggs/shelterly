import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import Select from 'react-select';
import SimpleValue from 'react-select-simple-value';
import { Button, Col, Row } from 'react-bootstrap';
import { Link } from "raviger";
import moment from 'moment';
import { AuthContext } from "./accounts/AccountsReducer";

function Home() {

  const [incident, setIncident] = useState('');
  const [options, setOptions] = useState([]);
  const { state } = useContext(AuthContext);

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
    await axios.patch('/incident/api/incident/' + incident + '/', {change_lock:true})
    .then(response => {
      let options_copy = [...options]
      options_copy.filter(option => option.value === response.data.id)[0]['label'] = response.data.name + ' (' + moment(response.data.start_time).format('MM/DD/YYYY') + (response.data.end_time ? ' - ' + moment(response.data.start_time).format('MM/DD/YYYY') : '') + ')';
      options_copy.filter(option => option.value === response.data.id)[0]['end_time'] = response.data.end_time
      setOptions(options_copy);
    })
    .catch(error => {
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
            if (!incident.end_time || state.user.is_superuser) {
              options.push({value: incident.id, label: incident.name + ' (' + moment(incident.start_time).format('MM/DD/YYYY') + (incident.end_time ? ' - ' + moment(incident.start_time).format('MM/DD/YYYY') : '') + ')', end_time:incident.end_time});
            }
          });
          setOptions(options)
        }
      })
      .catch(error => {
      });
    };
    fetchIncidentData();
    // Cleanup.
    return () => {
      unmounted = true;
      source.cancel();
    };
  }, []);


  return (
    <>
    <Row className='ml-auto mr-auto mt-auto align-bottom'>
      <img src="/static/images/shelterly.png" alt="Logo" style={{height:"120px", width:"120px", marginTop:"-4px", marginLeft:"-4px"}} />
      <h1  style={{fontSize:"100px"}}>Shelterly</h1>
    </Row>
    <Col xs={{ span:5 }} className="border rounded border-light shadow-sm ml-auto mr-auto mb-auto" style={{maxHeight:state.user.is_superuser ? "254px" : "145px", minWidth:"572px"}}>
      <SimpleValue options={options}>
        {simpleProps => <Select styles={customStyles} {...simpleProps} className="mt-3" placeholder="Select incident..." onChange={(instance) => setIncident(instance.value)} />}
      </SimpleValue>
      <Link href={incident + '/home'} style={{textDecoration:"none"}}><Button size="lg" className="btn-primary mt-3" disabled={incident ? false : true} block>Select Incident</Button></Link>
      {state.user.is_superuser ?
        <Row>
          <Col style={{marginRight:"-23px"}}>
            <Link href={'/incident/edit/' + incident} style={{textDecoration:"none"}}><Button size="lg" className="btn-primary mt-2" disabled={incident ? false : true} block>Edit Incident</Button></Link>
          </Col>
          <Col>
            <Button size="lg" className="btn-primary mt-2" disabled={incident ? false : true} onClick={() => handleOpenCloseSubmit()} block>{incident && options.filter(option => option.value === incident)[0].end_time ? "Open" : "Close"} Incident</Button>
          </Col>
        </Row>
      : ""}
      {state.user.is_superuser ? <Link href={'/incident/new'} style={{textDecoration:"none"}}><Button size="lg" className="btn-primary mt-2 mb-3" block>Create New Incident</Button></Link> : ""}
    </Col>
    </>
  );
}

export default Home;