import React, { Fragment, useContext, useState } from "react";
import axios from "axios";
import { navigate, useQueryParams } from "raviger";
import { Form, Formik } from 'formik';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import { Form as BootstrapForm, Modal, Row } from 'react-bootstrap';
import * as Yup from "yup";
import { useCookies } from 'react-cookie';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { TextInput } from '../components/Form.js';
import { AuthContext } from "./AccountsReducer";
import { setAuthToken } from "./AccountsUtils";

const Login = () => {
  const { state, dispatch } = useContext(AuthContext);
  const [, setCookie, removeCookie] = useCookies(['token']);
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);

  // Identify any query param data.
  const [queryParams] = useQueryParams();
  const {
    next = '/',
  } = queryParams;

  return (
    <Fragment>
      <Formik
        initialValues={{ username: "", password: "" }}
        validationSchema={Yup.object({
          username: Yup.string()
            .required('An email address is required.'),
          password: Yup.string()
            .required('No password provided.'),
        })}
        onSubmit={(values, actions ) => {
          dispatch({ type: 'USER_LOADING' });
          axios.post('/login/', values)
          .then(response => {
            // Set token for axios calls.
            setAuthToken(response.data.token);
            // Store token in cookie.
            setCookie("token", response.data.token);
            // Update state information.
            dispatch({type: 'LOGIN_SUCCESSFUL', data: response.data });
            navigate(next);
          })
          .catch(e => {
            removeCookie("token");
            setAuthToken();
            actions.setStatus('Failed to log in with this username and password combination.')
            dispatch({type: "LOGIN_FAILED", data: e});
          });
          actions.setSubmitting(false);
        }}
      >
      {({ isSubmitting, status }) => (
        <>
        <Row className='ml-auto mr-auto mt-5'>
          <img src="/static/images/shelterly.png" alt="Logo" style={{height:"120px", width:"120px", marginTop:"-4px", marginLeft:"-4px"}} />
          <h1  style={{fontSize:"100px"}}>Shelterly</h1>
        </Row>
        <Col xs={{ span:5 }} className="border rounded border-light shadow-sm ml-auto mr-auto mb-auto">
          <BootstrapForm as={Form}>
            <TextInput
              name="username"
              id="username"
              placeholder="Email"
              size="lg"
              label="Email"
              formgroupclasses="mb-0 mt-3"
            />
            <TextInput
              type="password"
              name="password"
              id="password"
              placeholder="Password"
              size="lg"
              label="Password"
              formgroupclasses="mt-0 mb-4 mt-3"
            />
            <BootstrapForm.Group as={Col}>
              <Button type="submit" size="lg" className="btn-primary" block>Login{state.isLoading ? <FontAwesomeIcon icon={faSpinner} className="ml-1" spin inverse /> : ""}</Button>
              <Button size="lg" className="btn-primary" onClick={() => setShow(true)} block>Forgot Password</Button>
              {status && <div className="invalid-feedback invalid-form" variant="warning">{status}</div>}
            </BootstrapForm.Group>
          </BootstrapForm>
        </Col>
        </>
      )}
      </Formik>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Reset Password</Modal.Title>
        </Modal.Header>
          <Formik
            initialValues={{ email: "" }}
            validationSchema={Yup.object({
              email: Yup.string()
                .required('Please enter your email address to reset your password.')
                .email('Please enter a valid email address.'),
            })}
            onSubmit={(values, actions ) => {
              axios.post('/accounts/api/password_reset/', {email:values.email})
              .then(response => {
                setShow(false);
              })
              .catch(error => {
              });
            }}
          >
          {({ isSubmitting }) => (
            <>
            <BootstrapForm as={Form}>
              <Modal.Body>
                <TextInput
                  name="email"
                  id="email"
                  placeholder="Please enter your email address"
                  size="lg"
                  formgroupclasses="mb-0"
                  label="Email Address"
                />
              </Modal.Body>
              <Modal.Footer>
                <Button type="submit" size="lg" className="btn-primary" block>Send Reset Password Email</Button>
              </Modal.Footer>
            </BootstrapForm>
            </>
          )}
        </Formik>
      </Modal>
    </Fragment>
  )
}

export default Login;
