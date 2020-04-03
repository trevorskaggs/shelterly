import React from 'react';
import axios from "axios";
import { A } from "hookrouter";
import { Field, Form, useField, Formik } from 'formik';
import {
  Button,
  Col,
  FormGroup,
  Label,
  Row,
  Input,
  Container,
} from 'reactstrap';
import { Form as ReactstrapForm } from 'reactstrap';
import { ReactstrapInput } from 'reactstrap-formik';
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
          onSubmit={async(values, { setSubmitting }) => {
            try {
              await axios.post('http://localhost:8000/people/api/teammember/', values);
            }
            catch (e) {
              console.log(e);
            }
            setSubmitting(false);
          }}
        >
          <Form>
            <ReactstrapForm>
              <Container>
                <FormGroup>
                  <Row>
                    <Col xs={{size: 5, offset: 1}}>
                      <Field
                        type="text"
                        label="First Name*"
                        name="first_name"
                        id="first_name"
                        component={ReactstrapInput}
                      />
                    </Col>
                    <Col xs="5">
                      <Field
                        type="text"
                        label="Last Name*"
                        name="last_name"
                        id="last_name"
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
                        label="Cell Phone*"
                        name="cell_phone"
                        id="cell_phone"
                        component={ReactstrapInput}
                      />
                    </Col>
                    <Col xs="5">
                      <Field
                        type="text"
                        label="Agency ID"
                        name="agency_id"
                        id="agency_id"
                        component={ReactstrapInput}
                      />
                    </Col>
                  </Row>
                </FormGroup>
  
                <A class="btn btn-secondary float-right" href="/evac">Cancel</A>
                <Button type="submit" className="btn-success mr-1 float-right">Save</Button>
              </Container>
            </ReactstrapForm>
          </Form>
        </Formik>
      </>
    );
  };

export default EvacTeamForm;