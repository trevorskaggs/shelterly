import React from "react";
import axios from "axios";
import { navigate, useQueryParams } from "raviger";
import { Form, Formik } from 'formik';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import { Form as BootstrapForm } from 'react-bootstrap';
import * as Yup from "yup";
import { TextInput } from '../components/Form.js';

const ResetPassword = () => {

  // Identify any query param data.
  const [queryParams] = useQueryParams();
  const {
    token = '',
  } = queryParams;

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/

  return (
    <>
      <Formik
        initialValues={{ token: token, password: "", password2: "" }}
        validationSchema={Yup.object({
          password: Yup.string()
            .min(8, 'Password must be at least 8 characters.')
            .required('No password provided.')
            .matches(passwordRegex, "Password must contain one uppercase, one lowercase, one number, and one special case character."),
          password2: Yup.string()
            .oneOf([Yup.ref('password'), null], 'Passwords must match.'),
        })}
        onSubmit={(values, actions ) => {
          setTimeout(() => {
            axios.post('/accounts/api/password_reset/confirm/', values)
            .then(response => {
              navigate('/');
            })
            .catch(e => {
            });
            actions.setSubmitting(false);
          }, 500);
        }}
      >
      {({ isSubmitting }) => (
        <>
        <h1 className='text-center' style={{marginTop:"70px", fontSize:"100px"}}>Shelterly</h1>
        <Col xs={{ span:5 }} className="border rounded border-light shadow-sm" style={{marginRight:"auto", marginLeft:"auto"}}>
          <h3 className='mb-0 text-center mt-3'>Reset Password</h3>
          <BootstrapForm as={Form}>
            <TextInput
              name="password"
              id="password"
              type="password"
              label="New Password"
              size="lg"
              formGroupClasses="mt-3 mb-0"
            />
            <TextInput
              type="password"
              name="password2"
              id="password2"
              label="Confirm Password"
              size="lg"
              formGroupClasses="mt-3 mb-4"
            />
            <BootstrapForm.Group as={Col}>
              <Button type="submit" size="lg" className="btn-primary" disabled={isSubmitting} block>Save Password</Button>
              <Button size="lg" className="btn-primary" onClick={() => navigate('/')} disabled={isSubmitting} block>Return to Login</Button>
            </BootstrapForm.Group>
          </BootstrapForm>
        </Col>
        </>
      )}
      </Formik>
    </>
  )
}

export default ResetPassword;
