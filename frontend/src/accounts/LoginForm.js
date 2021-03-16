import React, { Fragment, useContext, useState } from "react";
import axios from "axios";
import { navigate, useQueryParams } from "raviger";
import { Form, Formik } from 'formik';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import { Form as BootstrapForm, Modal } from 'react-bootstrap';
import * as Yup from "yup";
import { useCookies } from 'react-cookie';
import { TextInput } from '../components/Form.js';
import { AuthContext } from "./AccountsReducer";
import { loadUser, setAuthToken } from "./AccountsUtils";

const Login = () => {
  const { dispatch } = useContext(AuthContext);
  const [cookies, setCookie, removeCookie] = useCookies(['token']);
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
          setTimeout(() => {
            axios.post('/login/', values)
            .then(response => {
              setAuthToken(response.data.token);
              //set token as cookie 
              setCookie("token", response.data.token, {path: '/'});
              //set authcontext
              dispatch({type: 'LOGIN_SUCCESSFUL', data: response.data });
              //called once
              loadUser({dispatch, removeCookie});
              navigate(next);
            })
            .catch(e => {
              console.log(e.response);
              removeCookie("token", {path: '/'});
              setAuthToken();
              actions.setStatus('Failed to log in with this username and password combination.')
              dispatch({type: "LOGIN_FAILED", data: e});
            });
            actions.setSubmitting(false);
          }, 500);
        }}
      >
      {({ isSubmitting, status }) => (
        <>
        <h1 className='text-center' style={{marginTop:"70px", fontSize:"100px"}}>Shelterly</h1>
        <Col xs={{ span:5 }} className="border rounded border-light shadow-sm" style={{marginRight:"auto", marginLeft:"auto"}}>
          <h3 className='mb-0 text-center mt-3'>Log-in</h3>
          <BootstrapForm as={Form}>
            <TextInput
              name="username"
              id="username"
              placeholder="Email"
              size="lg"
              formGroupClasses="mb-0"
            />
            <TextInput
              type="password"
              name="password"
              id="password"
              placeholder="Password"
              size="lg"
              formGroupClasses="mt-0 mb-4"
            />
            <BootstrapForm.Group as={Col}>
              <Button type="submit" size="lg" className="btn-primary" block>Login</Button>
              <Button size="lg" className="btn-primary" onClick={() => setShow(true)} block>Reset Password</Button>
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
                console.log(error.response);
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
                  formGroupClasses="mb-0"
                  label="Email Address"
                />
              </Modal.Body>
              <Modal.Footer>
                <Button type="submit" size="lg" className="btn-primary" block>Reset Password</Button>
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
