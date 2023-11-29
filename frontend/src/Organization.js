import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import Select from 'react-select';
import SimpleValue from 'react-select-simple-value';
import { Button, Col, Row } from 'react-bootstrap';
import { navigate } from "raviger";
import { useCookies } from 'react-cookie';
import { AuthContext } from "./accounts/AccountsReducer";
import { logoutUser } from "./accounts/AccountsUtils";
import { SystemErrorContext } from './components/SystemError';

function Organization() {

  const { dispatch, state } = useContext(AuthContext);
  const { setShowSystemError } = useContext(SystemErrorContext);

  const [organization, setOrganization] = useState({id: '', name:'', slug:''});
  const [options, setOptions] = useState([]);
  const [, , removeCookie] = useCookies(['token']);

  const handleSubmit = (organization_id, organization_name) => {
    dispatch({type: "SET_ORGANIZATION", data: {id:organization_id, name:organization_name}});
    navigate(organization.slug);
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

  // Hook for initializing data.
  useEffect(() => {
    let unmounted = false;
    let source = axios.CancelToken.source();

    const fetchOrganizationData = async () => {
      // Fetch ServiceRequest data.
      await axios.get('/incident/api/organization/', {
        cancelToken: source.token,
      })
      .then(response => {
        if (!unmounted) {
          let options = [];
          response.data.forEach(organization => {
            // Build organization option list.
            options.push({value: organization.id, label: organization.name, slug:organization.slug});
          });
          setOptions(options)
          // setData(response.data)
        }
      })
      .catch(error => {
        if (!unmounted) {
          setShowSystemError(true);
        }
      });
    };
    fetchOrganizationData();
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
      <h1 style={{fontSize:"100px"}}>Shelterly</h1>
    </Row>
    <Col xs={{ span:5 }} className="border rounded border-light shadow-sm ml-auto mr-auto mb-auto" style={{maxHeight:"200px", minWidth:"572px"}}>
      <SimpleValue options={options}>
        {simpleProps => <Select styles={customStyles} {...simpleProps} className="mt-3" placeholder="Select organization..." onChange={(instance) => setOrganization({id:instance.value, name:instance.label, slug:instance.slug})} />}
      </SimpleValue>
      <Button size="lg" className="btn-primary mt-3" onClick={() => handleSubmit(organization.id, organization.name)} disabled={organization.id ? false : true} block>Select Organization</Button>
      <Button size="lg" className="btn-primary mt-2 mb-3" onClick={() => logoutUser({dispatch}, {removeCookie})} block>Return to Login</Button>
    </Col>
    </>
  );
}

export default Organization;
