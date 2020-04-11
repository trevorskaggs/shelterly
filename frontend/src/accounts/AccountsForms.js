import React, {useContext, useEffect, useReducer} from "react";
import axios from "axios";
import {navigate} from "hookrouter";
import { Field, Form, Formik } from 'formik';
import {
  Button,
  Col,
  FormGroup,
  Container,
  Row,
} from 'reactstrap';
import { ReactstrapInput } from 'reactstrap-formik';
import * as Yup from "yup";
import {CounterContext} from "./AccountsReducer";
import setAuthToken from "./setAuthToken";


export const LoginForm = () => {
  const { state, dispatch } = useContext(CounterContext);
  useEffect(() => {
    if (state.user) {
      navigate("/");
    }
  }, []);

  function loadUser() {
    if (localStorage.getItem('token')) setAuthToken(localStorage.getItem('token'));

    // DISPATCH USER_LOADING
    dispatch({ type: 'USER_LOADING' });

    let headers = {
      "Content-Type": "application/json",
    };

    axios.get("http://localhost:8000/accounts/auth/user/", {
      headers: headers
    })
    .then(function(results){
      console.log(results.data);
      dispatch({type: 'USER_LOADED', user: results.data });
    })
    .catch(e => {
      console.log('error: '+e);
      dispatch({type: "AUTHENTICATION_ERROR", data: e});
    })
  }

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
        onSubmit={(values, { setSubmitting }) => {
          setTimeout(() => {
            axios.post('http://localhost:8000/login/', values)
            .then(response => {
              console.log(response.data['token']);
              dispatch({type: 'LOGIN_SUCCESSFUL', data: response.data });
              loadUser();
              navigate('/');
            })
            .catch(e => {
              console.log(e);
              dispatch({type: "AUTHENTICATION_ERROR", data: e});
            });
            setSubmitting(false);
          }, 500);
        }}
      >
        <Form>
          <Container>
            <FormGroup>
              <Row>
                <Col xs="6">
                  <Field
                    type="text"
                    label="Username*"
                    name="username"
                    id="username"
                    component={ReactstrapInput}
                  />
                  <Field
                    type="password"
                    label="Password*"
                    name="password"
                    id="password"
                    component={ReactstrapInput}
                  />
                </Col>
              </Row>
            </FormGroup>

            <Button type="submit" className="btn-success mr-1">Login</Button>
          </Container>
        </Form>
      </Formik>
    </div>
  )
}
