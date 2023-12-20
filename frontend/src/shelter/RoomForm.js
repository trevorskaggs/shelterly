import React, { useContext, useEffect, useState } from 'react';
import axios from "axios";
import { navigate, useQueryParams } from 'raviger';
import { Formik } from 'formik';
import { Form as BootstrapForm, ButtonGroup, Card } from "react-bootstrap";
import { TextInput } from '../components/Form';
import * as Yup from 'yup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowAltCircleLeft } from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from "../accounts/AccountsReducer";
import ButtonSpinner from '../components/ButtonSpinner';
import { SystemErrorContext } from '../components/SystemError';

// Regex validators.
const nameRegex = /^[a-z0-9 ,.'-]+$/i

const RoomForm = ({ id, incident, organization }) => {

  const { state } = useContext(AuthContext);
  const { setShowSystemError } = useContext(SystemErrorContext);

  // Identify any query param data.
  const [queryParams] = useQueryParams();
  const {
    building_id = ''
  } = queryParams;

  // Initial Room data.
  const [data, setData] = useState({
    name: '',
    description: '',
    building: building_id,
  });

  // Hook for initializing data.
  useEffect(() => {
    let unmounted = false;
    let source = axios.CancelToken.source();

    if (id) {
      const fetchRoomData = async () => {
        // Fetch ServiceRequest data.
        await axios.get('/shelter/api/room/' + id + '/', {
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
      fetchRoomData();
    }
    // Cleanup.
    return () => {
      unmounted = true;
      source.cancel();
    };
  }, [id]);

  return (
    <>
      <Formik
        initialValues={data}
        enableReinitialize={true}
        validationSchema={Yup.object({
          name: Yup.string()
            .max(50, 'Must be 50 characters or less')
            .matches(nameRegex, "Name is not valid")
            .required('Required'),
          description: Yup.string()
            .max(400, 'Must be 400 characters or less'),
        })}
        onSubmit={(values, { setSubmitting }) => {
          setTimeout(() => {
            if (id) {
              axios.put('/shelter/api/room/' + id + '/', values)
              .then(function() {
                if (state.prevLocation) {
                  navigate(state.prevLocation);
                }
                else {
                  navigate('/' + organization + '/' + incident + '/shelter/room/' + id);
                }
              })
              .catch(error => {
                setSubmitting(false);
                setShowSystemError(true);
              });
            }
            else {
              axios.post('/shelter/api/room/', values)
              .then(function() {
                if (state.prevLocation) {
                  navigate(state.prevLocation);
                }
                else {
                  navigate('/' + organization + '/' + incident + '/shelter/building/' + building_id);
                }
              })
              .catch(error => {
                setSubmitting(false);
                setShowSystemError(true);
              });
            }
          }, 500);
        }}
      >
        {props => (
          <Card border="secondary" className="mt-5">
          <Card.Header as="h5" className="pl-3"><span style={{cursor:'pointer'}} onClick={() => window.history.back()} className="mr-3"><FontAwesomeIcon icon={faArrowAltCircleLeft} size="lg" inverse /></span>{!id ? "New" : "Update"} Room</Card.Header>
          <Card.Body>
            <BootstrapForm noValidate>
              <BootstrapForm.Row>
                <TextInput
                  xs="5"
                  type="text"
                  label="Name*"
                  name="name"
                  id="name"
                />
                <TextInput
                  xs="5"
                  type="text"
                  label="Description"
                  name="description"
                />
              </BootstrapForm.Row>
            </BootstrapForm>
          </Card.Body>
          <ButtonGroup size="lg">
            <ButtonSpinner isSubmitting={props.isSubmitting} isSubmittingText="Saving..." type="submit" onClick={() => { props.submitForm()}}>Save</ButtonSpinner>
          </ButtonGroup>
        </Card>
        )}
      </Formik>
    </>
  );
};

export default RoomForm;
