import React from 'react';
import { A } from "hookrouter";
import ReactDOM from 'react-dom';
import { Field, Form, useField, Formik } from 'formik';
import {
  Button,
  Col,
  FormGroup,
  Label,
  Input,
  Option,
  Container,
  Row,
} from 'reactstrap';
import { Form as ReactstrapForm } from 'reactstrap';
// import { ReactstrapInput } from 'reactstrap-formik';
import 'bootstrap/dist/css/bootstrap.min.css';
import * as Yup from 'yup';

// ...props is shorthand for "rest of the items in this array". So the 1st item is
// assigned to label and the rest are assigned to props
const TextInput = ({ label, ...props }) => {
  // useField() returns [formik.getFieldProps(), formik.getFieldMeta()]
  // which we can spread on <input> and also replace ErrorMessage entirely.
  const [field, meta] = useField(props);
  return (
    <>
      <label htmlFor={props.id || props.name}>{label}</label>
      <input className="text-input" {...field} {...props} />
      {meta.touched && meta.error ? (
        <div className="error">{meta.error}</div>
      ) : null}
    </>
  );
};

const MySelect = ({ label, ...props }) => {
  const [field, meta] = useField(props);
  return (
    <>
      <Label htmlFor={props.id || props.name}>{label}</Label>
      <Input type="select" {...field} {...props} />
      {/* {meta.touched && meta.error ? (
        <StyledErrorMessage>{meta.error}</StyledErrorMessage>
      ) : null} */}
    </>
  );
};

// And now we can use these
const EvacTeamForm = () => {
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
          name: Yup.string()
            .max(15, 'Must be 15 characters or less')
            .required('Required'),
          owner_name: Yup.string()
            .max(50, 'Must be 50 characters or less')
            .required('Required'),
          sex: Yup.string().required('Required').oneOf(['Male', 'Female']),
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
              <TextInput label="Owner Name" name="ownerName" type="text" />

              <FormGroup>
                <TextInput
                  label="Email Address"
                  name="email"
                  type="email"
                  placeholder="jane@formik.com"
                />
              </FormGroup>
              <MySelect label="Sex" name="sex">
                // <option value="male">Male</option>
                // <option value="female">Female</option>
              </MySelect>

              <Button type="submit">Submit</Button>
            </Container>
          </ReactstrapForm>
        </Form>
      </Formik>
    </>
  );
};

const style = {
  textAlign: "center",
};

export const TeamMemberForm = () => {
    return (
      <>
        <h1 style={style}>Team Member</h1>
        <Formik
          initialValues={{
            first_name: '',
            last_name: '',
            cell_phone: '',
            agency_id: '',
          }}
          validationSchema={Yup.object({
            first_name: Yup.string()
              .max(50, 'Must be 50 characters or less')
              .required('Required'),
            last_name: Yup.string()
              .max(50, 'Must be 50 characters or less')
              .required('Required'),
            cell_phone: Yup.string().required('Required'),
            agency_id: Yup.string(),
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
                    <TextInput label="First name*" name="first_name" type="text"/>
                    <TextInput label="Last name*" name="last_name" type="text" />
                </FormGroup>
  
                <FormGroup>
                    <TextInput label="Cell phone*" name="cell_phone" type="text"/>
                    <TextInput label="Agency ID" name="agency_id" type="text"/>
                </FormGroup>
  
                <Button type="submit" className="btn-success mr-1">Save</Button>
                <A class="btn btn-secondary" href="/evac">Cancel</A>
              </Container>
            </ReactstrapForm>
          </Form>
        </Formik>
      </>
    );
  };

export default EvacTeamForm;