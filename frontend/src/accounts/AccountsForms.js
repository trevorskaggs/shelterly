import React from "react";
import { Field, Form, Formik } from 'formik';
import { ReactstrapInput } from 'reactstrap-formik';
import * as Yup from "yup";

export const LoginForm = () => (
  <div>
    <h1>Form Component</h1>
    <Formik
      initialValues={{ username: "", password: "" }}
      validationSchema={Yup.object({
        username: Yup.string()
          .email()
          .required('A Username is required.'),
        password: Yup.string()
          .max(50, 'Must be 20 characters or less')
          .required('No password provided.'),
      })}
      onSubmit={(values, { setSubmitting }) => {
        setTimeout(() => {
          axios.post('http://localhost:8000/accounts/login/', values)
          .then(function() {
            navigate('/evac');
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
          </FormGroup>

          <Button type="submit" className="btn-success mr-1">Login</Button>
        </Container>
      </Form>
    </Formik>
  </div>
);
