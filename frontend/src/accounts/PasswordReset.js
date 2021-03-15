import React, { Fragment, useContext } from "react";
import axios from "axios";
import { navigate, useQueryParams } from "raviger";
import { Form, Formik } from 'formik';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import { Form as BootstrapForm } from 'react-bootstrap';
import * as Yup from "yup";
import { useCookies } from 'react-cookie';
import { TextInput } from '../components/Form.js';
import { AuthContext } from "./AccountsReducer";
import { loadUser, setAuthToken } from "./AccountsUtils";

const ResetPassword = () => {

  // Identify any query param data.
  const [queryParams] = useQueryParams();
  const {
    token = '',
  } = queryParams;

  // const resetPassword = async () => {
  //   await axios.post('/accounts/api/password_reset/', {email:"alexander.g.mountain@gmail.com"})
  //   .then(response => {
  //     console.log(response)
  //   })
  //   .catch(error => {
  //     console.log(error.response);
  //   });
  // }

  return (
    <Fragment>
      <Formik
        initialValues={{ token: token, password: "", password2: "" }}
        validationSchema={Yup.object({
          password: Yup.string()
            .max(50, 'Must be 20 characters or less')
            .required('No password provided.'),
          password2: Yup.string()
            .max(50, 'Must be 20 characters or less')
            .required('No password provided.'),
        })}
        onSubmit={(values, actions ) => {
          console.log(values)
          setTimeout(() => {
            axios.post('/accounts/api/password_reset/confirm/', values)
            .then(response => {
              console.log(response)
            })
            .catch(e => {
              console.log(e.response);
            });
            actions.setSubmitting(false);
          }, 500);
        }}
      >
      {({ isSubmitting, status }) => (
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
              <Button type="submit" size="lg" className="btn-primary" block>Reset Password</Button>
              {status && <div className="invalid-feedback invalid-form" variant="warning">{status}</div>}
            </BootstrapForm.Group>
          </BootstrapForm>
        </Col>
        </>
      )}
      </Formik>
    </Fragment>
  )
}

export default ResetPassword;
