import React, {setState, useEffect, useState} from 'react';
import axios from "axios";
import { A, navigate } from "hookrouter";
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

async function TeamMemberHooks() {
  // const [data, setData] = useState({teammembers: [], isFetching: false});
  // useEffect(() => {
  //   const fetchTeamMembers = async () => {
      try {
          // setData({teammembers: data.teammembers, isFetching: true});
          await axios.get('http://localhost:8000/people/api/teammember/').then(function (response) {
          console.log(response.data);
        })
          // setData({teammembers: response.data, isFetching: false});
      } catch (e) {
          console.log(e);
          // setData({teammembers: data.teammembers, isFetching: false});
      }
      return ([{value:'test', label:'test'}])
    }

  //   fetchTeamMembers();
  // }, []);
// }

// const buildOptions = () => {
//   TeamMemberHooks();
  // var teammembers = [];

  // for (let i = 1; i <= 10; i++) {
  //   arr.push({value:'test', label:'test'})
  // }
//   for (let i = 1; i <= data.teammembers.length; i++) {
//     teammembers.push({ value: data.teammembers[i].id, label: data.teammembers[i].first_name })
//   }
//   return teammembers; 
// }

const options = TeamMemberHooks();//buildOptions();

const style = {
  textAlign: "center",
};

export const EvacTeamForm = () => {
  
  return (
    <>
      <h1 style={style}>Evac Team</h1>
      <Formik
        initialValues={{
          evac_team_members: '',
          callsign: '',
        }}
        validationSchema={Yup.object({
          evac_team_members: Yup.array()
            .required('Required'),
          callsign: Yup.string()
            .max(50, 'Must be 20 characters or less')
            .required('Required'),
        })}
        onSubmit={(values, { setSubmitting }) => {
          await axios.post('http://localhost:8000/evac/api/evacteam/', values);
          navigate('/evac');
        }}
      >
        <Form>
          <ReactstrapForm>
            <Container>
              <FormGroup>
                <MySelect label="Evac Team Members*" name="team_members">
                  {/* for (let i = 1; i <= data.teammembers.length; i++) {
                    <option key={i} value="{i}">{i}</option>)
                  } */}
                  {options.map(({ value, label }, index) => <option value={value} >{label}</option>)}
                </MySelect>
                <Field
                  type="text"
                  label="Callsign*"
                  name="callsign"
                  id="callsign"
                  component={ReactstrapInput}
                />
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
              navigate('/evac');
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

// export default EvacTeamForm;