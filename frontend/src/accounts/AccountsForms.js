import React, { useContext, useEffect } from "react";
import axios from "axios";
import { navigate } from "hookrouter";
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
import { useCookies } from 'react-cookie';
import { AuthContext } from "./AccountsReducer";
import { setAuthToken } from "./AccountsUtils";

export const LoginForm = () => {
  const { state, dispatch } = useContext(AuthContext);
  const [, setCookie, ] = useCookies(['token']);
  useEffect(() => {
    // If user is logged in, redirect to Home.
    if (state.user) {
      navigate("/");
    }
  }, [state.user]);

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
            axios.post('http://localhost:3000/login/', values)
            .then(response => {
              setAuthToken(response.data.token);
              setCookie("token", response.data.token, {path: '/'});
              dispatch({type: 'LOGIN_SUCCESSFUL', data: response.data });
              navigate('/');
            })
            .catch(e => {
              console.log(e);
              dispatch({type: "LOGIN_FAILED", data: e});
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
