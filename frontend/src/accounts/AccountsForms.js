import React, { useContext } from "react";
import axios from "axios";
import { navigate, useQueryParams } from "raviger";
import { Form, Formik } from 'formik';
import {
  Button,
  FormGroup,
  Row,
} from 'reactstrap';
import { Alert } from 'react-bootstrap';
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
    <div>
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
        <Form>
          <FormGroup>
            <Row>
              <TextInput
                type="text"
                label="Username*"
                name="username"
                id="username"
                xs="6"
              />
            </Row>
            <Row>
              <TextInput
                type="password"
                label="Password*"
                name="password"
                id="password"
                xs="6"
              />
            </Row>

          </FormGroup>
          { status && <Alert variant="danger">{status} </Alert>}

         <Button type="submit" className="btn-success mr-1">Login</Button>
        </Form>
          
      )}
      </Formik>
    </div>
  )
}
