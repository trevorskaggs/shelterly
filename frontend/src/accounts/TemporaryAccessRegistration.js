import React, { useContext, useEffect, useState } from 'react';
import axios from "axios";
import { Link, navigate } from "raviger";
import { Field, Form, Formik, } from 'formik';
import { Switch } from 'formik-material-ui';
import {
  Button,
  ButtonGroup,
  Card,
  Col,
  Form as BootstrapForm,
  ListGroup,
  Row,
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowAltCircleLeft,
} from '@fortawesome/free-solid-svg-icons';
import * as Yup from 'yup';
import { DateTimePicker, DropDown, TextInput } from '../components/Form';
import { SystemErrorContext } from '../components/SystemError';
import { AuthContext } from "./AccountsReducer";
import Header from '../components/Header';

const TemporaryAccessRegistration = ({ organization, id }) => {

  const { setShowSystemError } = useContext(SystemErrorContext);
  const { state } = useContext(AuthContext);

  const [data, setData] = useState({id:'', org_name:'', access_expires_at:null, link_expires_at:null});

  const [success, setSuccess] = useState(null);

  useEffect(() => {
    let unmounted = false;
    let source = axios.CancelToken.source();
    const fetchTempAccess = async () => {
      // Fetch Temporary Access data.
      await axios.get('/incident/api/tempaccess/' + id + '/', {
        cancelToken: source.token,
      })
      .then(response => {
        console.log(response)
        if (!unmounted) {
          setData(response.data);
          // If temp access is still valid.
          if (new Date(new Date(response.data.link_expires_at.replace(/-/g, '\/')).toDateString()) >= new Date(new Date().toDateString())) {
            const values = {'organization':response.data.organization, 'access_expires_at':response.data.access_expires_at, 'temp_access_id':id};
            axios.patch('/accounts/api/user/' + state.user.id + '/', values)
            .then(function () {
              setSuccess(true);
              setTimeout(() => {
                navigate('/' + organization);
              }, 5000)
            })
            .catch(error => {
              setShowSystemError(true);
              setSuccess(false)
            });
          }
          else {
            setSuccess(false)
          }
        }
      })
      .catch(error => {
        if (!unmounted) {
          setShowSystemError(true);
        }
      });
    };
    fetchTempAccess();
    // Cleanup.
    return () => {
      unmounted = true;
      source.cancel();
    };
  }, [id]);

  return (
    <>
    <span className="mt-3 ml-auto mr-auto" style={{width:"80%", maxWidth:"80%"}}>
      <Header>
        <span style={{cursor:'pointer'}} onClick={() => navigate("/" + organization)} className="mr-2"><FontAwesomeIcon icon={faArrowAltCircleLeft} size="sm" inverse /></span>
        {data.org_name} - Signup
      </Header>
      <hr/>
      <div className="row mt-1">
        <div className="col-8 d-flex">
          <Card className="border rounded d-flex" style={{width:"100%"}}>
            <Card.Body>
              {success ? <span>You were successfully added to the organization {state.organization.name}! You will be redirected in 5 seconds.</span> : ""}
              {success === false ? <span>You were unable to be added to the organization {state.organization.name}.</span> : ""}
            </Card.Body>
          </Card>
        </div>
      </div>
    </span>
    </>
  );
};

export default TemporaryAccessRegistration;