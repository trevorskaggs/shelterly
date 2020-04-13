import React, { useState }from "react";
import ReactDOM from "react-dom";
import { Field, Form, useField, Formik } from "formik";
import { Button, Col, FormGroup, Label, Input, Option, Container, Row } from "reactstrap";
import {Form as ReactstrapForm} from "reactstrap";
import { ReactstrapInput } from "reactstrap-formik";
import "bootstrap/dist/css/bootstrap.min.css";
import * as Yup from 'yup';
import { DropDown, TextInput } from '.././components/Form.js';
import { speciesChoices, sexChoices, dogSizeChoices, catSizeChoices } from './constants'


const AnimalForm = () => {
  const [species, setSpecies] = useState('');
  
    return (
      <>
        <Formik
          initialValues={{
            name: '',
            species: '',
            sex: '',
            description: '', // added for our checkbox
          }}
          validationSchema={Yup.object({
            animalName: Yup.string()
              .max(15, 'Must be 15 characters or less.')
              .required('Required'),
            species: Yup.string().required()
              .oneOf(speciesChoices.map(x => x['value'])),
            ownerName: Yup.string()
              .max(50, 'Must be 50 characters or less')
              .required('Required'),
            sex: Yup.string()
              .required('Required')
              .oneOf(['Male', 'Female']),
          })}
          onSubmit={(values, { setSubmitting }) => {
            setTimeout(() => {
              alert(JSON.stringify(values, null, 2));
              setSubmitting(false);
            }, 400);
          }}
        >{ props => (
          <Form>
          <ReactstrapForm>
          <Container>
          <FormGroup>
            <Label for="animalname">Name</Label>
            <TextInput
              //These are passed into above TextInput,
              // so remaining props passed are name and type
              id="animalname"
              name="animalName"
              type="text"
            />
          </FormGroup>
          <DropDown
              label="Sex"
              id="sexDropDown"
              name="sex"
              type="text"
              options={sexChoices}>
            </DropDown>
            <DropDown 
            label="Species"
            id="speciesDropdown"
            name="species"
            type="text"
            options={speciesChoices}
            />
            <DropDown 
              label="Size"
              id="sizeDropdown"
              name="size"
              type="text"
              options={props.values.species.value == 'dog' ? dogSizeChoices : catSizeChoices }
            />
  
            <Button type="submit">Submit</Button>
            </Container>
            </ReactstrapForm>
          </Form>
        )}
        </Formik>
      </>
    );
  };
  
  export default AnimalForm;