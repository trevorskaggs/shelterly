import React from "react";
import ReactDOM from "react-dom";
import { Field, Form, useField, Formik } from "formik";
import { Button, Col, FormGroup, Label, Input, Option, Container, Row } from "reactstrap";
import {Form as ReactstrapForm} from "reactstrap";
import { ReactstrapInput } from "reactstrap-formik";
import "bootstrap/dist/css/bootstrap.min.css";
import * as Yup from 'yup';
import { DropDown, TextInput } from '.././components/Form.js';
import { speciesChoices } from './constants'


const AnimalForm = () => {
  
    return (
      <>
        <h1>Animal Form</h1>
        <Formik
          initialValues={{
            name: '',
            owner_name: '',
            sex: '',
            description: '', // added for our checkbox
          }}
          validationSchema={Yup.object({
            animalName: Yup.string()
              .max(15, 'Must be 15 characters or less')
              .required('Required'),
            species: Yup.string().required()
              .oneOf(['cockerspaniel', 'doberman', 'yellow lab']),
            ownerName: Yup.string()
              .max(50, 'Must be 50 characters or less')
              .required('Required'),
            sex: Yup.string()
              .required('Required')
              .oneOf(['Male', 'Female']),
            description: Yup.boolean()
              .required('Required')
              .oneOf([true], 'You must accept the terms and conditions.'),
          })}
          onSubmit={(values, { setSubmitting }) => {
            setTimeout(() => {
              alert(JSON.stringify(values, null, 2));
              setSubmitting(false);
            }, 400);
          }}
        >
          <Form>
              <ReactstrapForm>
              <Container>
          <FormGroup>
            <TextInput
              //These are passed into above TextInput,
              // so remaining props passed are name and type
              label="Animal Name"
              name="animalName"
              type="text"
            />
          </FormGroup>
            <DropDown 
            label="Species"
            id="speciesDropdown"
            name="species"
            type="text"
            options={speciesChoices}
            />
          <FormGroup>
            <TextInput
              label="Email Address"
              name="email"
              type="email"
              placeholder="jane@formik.com"
            />
          </FormGroup>
            <DropDown label="Sex">
              // <option value="male">Male</option>
              // <option value="female">Female</option>
            </DropDown>
  
            <Button type="submit">Submit</Button>
            </Container>
            </ReactstrapForm>
          </Form>
        </Formik>
      </>
    );
  };
  
  export default AnimalForm;