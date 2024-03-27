import React, { useContext, useEffect, useState } from 'react';
import axios from "axios";
import { navigate, useQueryParams } from 'raviger';
import { Formik } from 'formik';
import { Form as BootstrapForm, ButtonGroup, Card, Col, FormGroup, Row } from "react-bootstrap";
import * as Yup from 'yup';
import { DateTimePicker, TextInput } from '../components/Form';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowAltCircleLeft } from '@fortawesome/free-solid-svg-icons';
import ButtonSpinner from '../components/ButtonSpinner';
import { SystemErrorContext } from '../components/SystemError';

const OwnerContactForm = ({ id, incident, organization }) => {

  const { setShowSystemError } = useContext(SystemErrorContext);

  const [queryParams] = useQueryParams();
  let url;
  let axios_method;

  const {
    owner = null,
  } = queryParams;

  const [data, setData] = useState({
    owner_name: '',
    owner_contact_time: new Date(),
    owner_contact_note: '',
    owner: owner,
  })

  useEffect(() => {
    let unmounted = false;
    let source = axios.CancelToken.source();

    if (id) {
      // Get OwnerContact if editing existing
      const fetchOwnerContact = async () => {
        // Fetch Owner Contact data.
        await axios.get('/people/api/ownercontact/' + id + '/', {
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
      fetchOwnerContact();
    }
    else {
      // Get Owner details for new OwnerContact
      const fetchOwner = async () => {
      // Fetch Owner Data.
      axios.get('/people/api/person/' + owner +'/', {
        cancelToken: source.token,
      })
      .then(response => {
        if (!unmounted) {
          setData(prevState => ({ ...prevState, "owner_name":response.data['first_name'] + ' ' + response.data['last_name'] }));
        }
      })
      .catch(error => {
        setShowSystemError(true);
      });
      }
      fetchOwner();
    };
    // Cleanup.
    return () => {
      unmounted = true;
      source.cancel();
    };
  }, [id, owner]);

  return (
    <Formik
      initialValues={data}
      enableReinitialize={true}
      validationSchema={Yup.object({
        owner_contact_time: Yup.date().required('Required'),
        owner_contact_note: Yup.string().required('Required'),
      })}
      onSubmit={(values, { setSubmitting }) => {
        if (id) {
          url = '/people/api/ownercontact/' + values.id + '/'
          axios_method = axios.patch
        }
        else {
          url = '/people/api/ownercontact/'
          axios_method = axios.post
        }
        axios_method(url, values)
        .then(response => {
          navigate('/' + organization + '/' + incident + '/people/owner/' + response.data.owner)
        })
        .catch(error => {
          setSubmitting(false);
          setShowSystemError(true);
        });
      }}
    >
    {form => (
      <Card border="secondary" className="mt-5">
        <Card.Header as="h5" className="pl-3"><span style={{cursor:'pointer'}} onClick={() => window.history.back()} className="mr-3"><FontAwesomeIcon icon={faArrowAltCircleLeft} size="lg" inverse /></span>{ data.owner_name } - {!id ? "New" : "Update"} Owner Contact Note</Card.Header>
        <Card.Body>
          <BootstrapForm>
            <FormGroup>
              <Row>
                <Col>
                  <DateTimePicker
                    label="Owner Contact Time*"
                    name="owner_contact_time"
                    id="owner_contact_time"
                    xs="4"
                    clearable={false}
                    data-enable-time={true}
                    onChange={(date, dateStr) => {
                      form.setFieldValue("owner_contact_time", dateStr)
                    }}
                    value={form.values.owner_contact_time||null}
                  />
                </Col>
              </Row>
              <Row className="mt-3">
                <Col >
                  <TextInput
                    as="textarea"
                    label="Owner Contact Note*"
                    name="owner_contact_note"
                    id="owner_contact_note"
                    xs="10"
                    rows={5}
                  />
                </Col>
              </Row>
            </FormGroup>
          </BootstrapForm>
        </Card.Body>
        <ButtonGroup>
          <ButtonSpinner isSubmitting={form.isSubmitting} isSubmittingText="Saving..." type="button" className="btn btn-primary" onClick={() => {form.submitForm()}}>Save</ButtonSpinner>
        </ButtonGroup>
      </Card>
      )}
    </Formik>
  );
};

export default OwnerContactForm;
