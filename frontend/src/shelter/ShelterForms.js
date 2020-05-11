import React from "react";
import axios from "axios";
import { A, navigate } from "hookrouter";
import { Field, Form, Formik } from 'formik';
import {
  Button,
  Col,
  FormGroup,
  Row,
  Container,
} from 'reactstrap';
import { ReactstrapInput } from 'reactstrap-formik';
import 'bootstrap/dist/css/bootstrap.min.css';
import * as Yup from 'yup';


export const ShelterForm = () => {
  return (
    <>
      <Formik
        initialValues={{
          name: '',
          description: '',
          address: '',
        }}
        validationSchema={Yup.object({
          name: Yup.string()
            .max(50, 'Must be 50 characters or less')
            .required('Required'),
        })}
        onSubmit={(values, { setSubmitting }) => {
          setTimeout(() => {
            axios.post('http://localhost:8000/shelter/api/shelter/', values)
            .then(function() {
              navigate('/shelter/list');
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
                <Col xs={{size: 5, offset: 1}}>
                  <Field
                    type="text"
                    label="Name*"
                    name="name"
                    id="name"
                    component={ReactstrapInput}
                  />
                </Col>
                <Col xs="5">
                  <Field
                    type="text"
                    label="Description*"
                    name="description"
                    id="description"
                    component={ReactstrapInput}
                  />
                  </Col>
              </Row>
            </FormGroup>

            <FormGroup>
              <Row>
                <Col xs={{size: 5, offset: 1}}>
                  <Field
                    type="text"
                    label="Address"
                    name="address"
                    id="address"
                    component={ReactstrapInput}
                  />
                </Col>
              </Row>
            </FormGroup>

            <Button type="submit" className="btn-success mr-1">Save</Button>
            <A className="btn btn-secondary" href="/shelter">Cancel</A>
          </Container>
        </Form>
      </Formik>
    </>
  );
};