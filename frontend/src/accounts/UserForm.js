import React, { useContext, useEffect, useState } from 'react';
import axios from "axios";
import { navigate } from "raviger";
import { Field, Formik } from 'formik';
import { Switch } from 'formik-material-ui';
import {
  Form as BootstrapForm,
  ButtonGroup,
  Card,
  Col,
} from 'react-bootstrap';
import { Typeahead } from 'react-bootstrap-typeahead';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowAltCircleLeft,
} from '@fortawesome/free-solid-svg-icons';
import * as Yup from 'yup';
import { DateTimePicker, DropDown, TextInput } from '.././components/Form.js';
import ButtonSpinner from '../components/ButtonSpinner.js';
import { SystemErrorContext } from '../components/SystemError';
import { AuthContext } from "./AccountsReducer";

const UserForm = ({ id, organization }) => {

  const { dispatch, state } = useContext(AuthContext);
  const { setShowSystemError } = useContext(SystemErrorContext);

  // Regex validators.
  const phoneRegex = /^((\+\d{1,3}(-| )?\(?\d\)?(-| )?\d{1,3})|(\(?\d{2,3}\)?))(-| )?(\d{3,4})(-| )?(\d{4})(( x| ext)\d{1,5}){0,1}$/;

  const [existingUsers, setExistingUsers] = useState({data:{}, options:[], fetching:true});

  const initialData = {
    first_name: '',
    last_name: '',
    email: '',
    cell_phone: '',
    agency_id: '',
    user_perms: false,
    incident_perms: false,
    vet_perms: false,
    email_notification: false,
    access_expires_at: null,
    organizations: [],
    presets: 0
  }

  const [data, setData] = useState(initialData)

  // Hook for initializing data.
  useEffect(() => {
    let unmounted = false;
    let source = axios.CancelToken.source();
    if (id) {
      const fetchUserData = async () => {
        // Fetch User data.
        await axios.get('/accounts/api/user/' + id + '/?organization=' + state.organization.id, {
          cancelToken: source.token,
        })
        .then(response => {
          if (!unmounted) {
            setData(response.data);
          }
        })
        .catch(error => {
          if (!unmounted) {
            setShowSystemError(true);
          }
        });
      };
      fetchUserData();
    }

    const fetchExistingUserData = async () => {
      // Fetch all users data.
      await axios.get('/accounts/api/user/', {
        cancelToken: source.token,
      })
      .then(existingUsersResponse => {
        if (!unmounted) {
          let options = [];
          existingUsersResponse.data.forEach(user => {
            options.push({id: user.id, label: user.first_name + ' ' + user.last_name + ' - ' + user.display_phone + ' - ' + user.email})
          })
          setExistingUsers({data:existingUsersResponse.data, options:options, fetching:false});
        }
      })
      .catch(error => {
        if (!unmounted) {
          setShowSystemError(true);
        }
      });
    }
    fetchExistingUserData();

    // Cleanup.
    return () => {
      unmounted = true;
      source.cancel();
    };
  }, [id]);

  return (
    <>
    {state.user.is_superuser || state.user.user_perms ?
    <Formik
      initialValues={data}
      enableReinitialize={true}
      validationSchema={Yup.object({
        first_name: Yup.string()
          .max(50, 'Must be 50 characters or less')
          .required('Required'),
        last_name: Yup.string()
          .max(50, 'Must be 50 characters or less')
          .required('Required'),
        email: Yup.string()
          .max(50, 'Must be 50 characters or less')
          .required('Required'),
        cell_phone: Yup.string()
          .matches(phoneRegex, "Phone number is not valid")
          .required('Required'),
        agency_id: Yup.string().nullable(),
        access_expires_at: Yup.string().nullable(),
        user_perms: Yup.boolean(),
        incident_perms: Yup.boolean(),
        vet_perms: Yup.boolean(),
        email_notification: Yup.boolean(),
      })}
      onSubmit={(values, { setFieldError, setSubmitting }) => {
        // Pass current organization value.
        values['organization'] = state.organization.id;
        setTimeout(() => {
          if (data.id) {
            axios.put('/accounts/api/user/' + data.id + '/', values)
            .then(function () {
              navigate('/' + organization + '/accounts/user_management');
            })
            .catch(error => {
              setSubmitting(false);
              setShowSystemError(true);
            });
          }
          else {
            axios.post('/accounts/api/user/', values)
            .then(function () {
              navigate('/' + organization + '/accounts/user_management');
            })
            .catch(error => {
              setSubmitting(false);
              setShowSystemError(true);
            });
          }
        }, 500);
      }}
    >
      {formikProps => (
        <Card border="secondary" className="mt-4 ml-auto mr-auto" style={{width:"50%", maxWidth:"50%"}}>
          <Card.Header as="h5" className="pl-3"><span style={{ cursor: 'pointer' }} onClick={() => navigate('/' + organization + '/accounts/user_management')} className="mr-3"><FontAwesomeIcon icon={faArrowAltCircleLeft} size="lg" inverse /></span>{state.organization.name} - {id ? "Edit" : "New"} User</Card.Header>
          <Card.Body>
            <BootstrapForm>
              {!id ? <span>
                <label>Use Existing User</label>
                <Typeahead
                  id="existing_user"
                  className="mb-3"
                  onChange={(values) => {
                    if (values.length) {
                      setData(existingUsers.data.filter(user => user.id === values[0].id)[0])
                    }
                    else {
                      setData(initialData);
                    }
                  }}
                  options={existingUsers.options}
                  placeholder={existingUsers.fetching ? "Loading..." : "Search..."}
                  disabled={existingUsers.fetching ? true : false}
                  emptyLabel="No matches found. Please fill out the form below."
                />
              </span> : ""}
              <BootstrapForm.Row>
                <TextInput
                  type="text"
                  label="First Name*"
                  name="first_name"
                  id="first_name"
                  xs="6"
                />
                <TextInput
                  type="text"
                  label="Last Name*"
                  name="last_name"
                  id="last_name"
                  xs="6"
                />
              </BootstrapForm.Row>
              <BootstrapForm.Row>
                <TextInput
                  type="text"
                  label="Email*"
                  name="email"
                  id="email"
                  xs="6"
                />
                <TextInput
                  type="text"
                  label="Phone*"
                  name="cell_phone"
                  id="cell_phone"
                  xs="3"
                  value={formikProps.values.cell_phone || ''}
                />
                <TextInput
                  type="text"
                  label="Agency ID"
                  name="agency_id"
                  id="agency_id"
                  xs="3"
                  value={formikProps.values.agency_id || ''}
                />
              </BootstrapForm.Row>
              <BootstrapForm.Row className="mb-3">
                <DateTimePicker
                  label="Access Expires At"
                  name="access_expires_at"
                  id="access_expires_at"
                  xs="6"
                  data-enable-time={false}
                  onChange={(date, dateStr) => {
                    formikProps.setFieldValue("access_expires_at", dateStr)
                  }}
                  value={formikProps.values.access_expires_at||null}
                  more_options={{minDate:'today'}}
                  disabled={false}
                />
                <Col xs="3">
                  <DropDown
                    label="&nbsp;"
                    id="presets"
                    name="presets"
                    type="text"
                    options={[{value:0, label:'Never'}, {value:1, label:'1 day'}, {value:3, label:'3 days'}, {value:5, label:'5 days'}, {value:7, label:'7 days'}, {value:14, label:'14 days'}, {value:30, label:'30 days'}]}
                    onChange={(instance) => {
                      if (instance.value > 0) {
                        var access_date = new Date(new Date().setDate(new Date().getDate() + (instance.value - 1)));
                        formikProps.setFieldValue("access_expires_at", access_date)
                      }
                      else {
                        formikProps.setFieldValue("access_expires_at", null)
                      }
                      formikProps.setFieldValue("presets", instance.value)
                    }}
                    isClearable={false}
                  />
                </Col>
              </BootstrapForm.Row>
              <BootstrapForm.Label htmlFor="user_perms">User Permissions</BootstrapForm.Label>
              <Field component={Switch} name="user_perms" id="user_perms" type="checkbox" color="primary" />
              <BootstrapForm.Label htmlFor="incident_perms">Incident Permissions</BootstrapForm.Label>
              <Field component={Switch} name="incident_perms" id="incident_perms" type="checkbox" color="primary" />
              <BootstrapForm.Label htmlFor="vet_perms">Veterinary Permissions</BootstrapForm.Label>
              <Field component={Switch} name="vet_perms" id="vet_perms" type="checkbox" color="primary" />
              <BootstrapForm.Label htmlFor="email_notification">SR Email Notification</BootstrapForm.Label>
              <Field component={Switch} name="email_notification" id="email_notification" type="checkbox" color="primary" />
            </BootstrapForm>
          </Card.Body>
          <ButtonGroup size="lg">
            <ButtonSpinner isSubmitting={formikProps.isSubmitting} isSubmittingText="Saving..." onClick={() => { formikProps.submitForm() }}>Save</ButtonSpinner>
          </ButtonGroup>
        </Card>
      )}
    </Formik> : ""}
    </>
  );
};

export default UserForm;
