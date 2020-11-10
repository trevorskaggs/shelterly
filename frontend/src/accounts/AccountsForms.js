import React, { Fragment, useContext } from "react";
import axios from "axios";
import { navigate, useQueryParams } from "raviger";
import { Form, Formik } from 'formik';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import { Form as BootstrapForm } from 'react-bootstrap';
import * as Yup from "yup";
import { useCookies } from 'react-cookie';
import { TextInput } from '.././components/Form.js';
import { AuthContext } from "./AccountsReducer";
import { loadUser, setAuthToken } from "./AccountsUtils";

export const LoginForm = () => {
  const { state, dispatch } = useContext(AuthContext);
  const [cookies, setCookie, removeCookie] = useCookies(['token']);

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
            .required('A Username is required.'),
          password: Yup.string()
            .max(50, 'Must be 20 characters or less')
            .required('No password provided.'),
        })}
        onSubmit={(values, actions ) => {
          setTimeout(() => {
            axios.post('/login/', values)
            .then(response => {
              setAuthToken(response.data.token);
              setCookie("token", response.data.token, {path: '/'});
              dispatch({type: 'LOGIN_SUCCESSFUL', data: response.data });
              loadUser({dispatch, removeCookie});
              navigate(next);
            })
            .catch(e => {
              console.log(e);
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
      <Col xs={{ span:5 }}
      className="border border-light shadow-sm">
      <div className='text-center mt-5'><h3 className='mb-0'>Log-in</h3></div>
      <BootstrapForm as={Form}>
          <TextInput
            name="username"
            id="username"
            placeholder="Username"
            formGroupClasses="mb-0"
            size="lg"
          />
          <TextInput
            type="password"
            name="password"
            id="password"
            placeholder="Password"
            formGroupClasses="mt-0"
            size="lg"
          />
          <BootstrapForm.Group as={Col}>
          <Button type="submit" size="lg" className="btn-primary" block>Login</Button>
         { status && <div className="invalid-feedback invalid-form" variant="warning">{status}</div>}
         </BootstrapForm.Group>
        </BootstrapForm>
        </Col>
          
      )}
      </Formik>
      </Fragment>
  )
}
