import React from 'react';
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

const Checkbox = ({ children, ...props }) => {
  // We need to tell useField what type of input this is
  // since React treats radios and checkboxes differently
  // than inputs/select/textarea.
  const [field, meta] = useField({ ...props, type: 'checkbox' });
  return (
    <>
      <label className="checkbox">
        <input type="checkbox" {...field} {...props} />
        {children}
      </label>
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

// function AnimalForm() {
//   return (
//     <Formik
//       initialValues={{ email: "", password: "" }}
//       validate={values => {
//         const errors = {};
//         if (!values.email) {
//           errors.email = "Required";
//         } else if (
//           !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)
//         ) {
//           errors.email = "Invalid email address";
//         }
//         return errors;
//       }}
//       onSubmit={(values, { setSubmitting }) => {
//         console.log(values);
//         //Make API calls here

//         setTimeout(() => {
//           setSubmitting(false);
//           alert(
//             `Submitted Successfully ->  ${JSON.stringify(values, null, 2)}`
//           );
//         }, 2000);
//       }}
//       render={({ submitForm, isSubmitting, values }) => (
//         <Form>
//           <Container style={{ paddingTop: "5px" }}>
//             <Row>
//               <Col xs="12">
//                 <Field
//                   type="email"
//                   label="Email"
//                   name="email"
//                   id="email"
//                   component={ReactstrapInput}
//                 />
//               </Col>
//               <Col xs="12">
//                 <Field
//                   type="password"
//                   label="Password"
//                   name="password"
//                   id="password"
//                   component={ReactstrapInput}
//                 />
//               </Col>
//               <Col xs="12">
//                 <button type="submit">Submit</button>
//               </Col>
//             </Row>
//             <pre>{JSON.stringify(values, null, 2)}</pre>
//           </Container>
//         </Form>
//       )}
//     />
//   );
// }
export default AnimalForm;
