import React from "react";
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

export const LoginForm = () => (
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
          // login(this.state.username, this.state.password);
          axios.post('http://localhost:8000/login/', values)
          .then(response => {
            console.log(response.data['token']);
            // dispatch({ type: 'LOGIN_SUCCESS', payload: response.data });
            localStorage.setItem('token', response.data['token']);
            // DISPATCH LOAD USER
            // setData(loadUser());
            // console.log(logged_in);
            navigate('/');
          })
          .catch(e => {
            console.log(e);
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
);
