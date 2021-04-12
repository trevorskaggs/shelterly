import React, { useEffect, useState } from 'react';
import axios from "axios";
import { navigate, useQueryParams } from 'raviger';
import { Formik } from 'formik';
import { Form as BootstrapForm, Button, ButtonGroup, Card, Col, FormGroup, Row } from "react-bootstrap";
import * as Yup from 'yup';
import { DateTimePicker, TextInput } from '../components/Form';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowAltCircleLeft } from '@fortawesome/free-solid-svg-icons';

const OwnerContactForm = ({id}) => {

  const [queryParams] = useQueryParams();
  var url;
  var axios_method;

  const {
    owner = null,
  } = queryParams;

  const [data, setData] = useState({
    owner_name: '',
    owner_contact_time: '',
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
        owner_contact_time: Yup.date().required(),
        owner_contact_note: Yup.string().required(),
      })}
      onSubmit={(values, { setSubmitting }) => {
        setTimeout(() => {
          if (id) {
            url = url + values.id
            axios_method = axios.patch
          }
          else {
            url = '/people/api/ownercontact/'
            axios_method = axios.post
          }
          axios_method(url, values)
          .then(
              navigate('/people/owner/' + values.owner)
          )
          .catch(error => {
          });
        setSubmitting(false);
        }, 500);
      }}
    >
    {form => (
      <Card border="secondary" className="mt-5">
        <Card.Header as="h5" className="pl-3"><span style={{cursor:'pointer'}} onClick={() => window.history.back()} className="mr-3"><FontAwesomeIcon icon={faArrowAltCircleLeft} size="lg" inverse /></span>{ data.owner_name } - {!id ? "New" : "Update"} Owner Contact</Card.Header>
        <Card.Body>
          <BootstrapForm>
            <FormGroup>
              <Row>
                <Col>
                  <DateTimePicker
                    label="Owner Contact Time"
                    name="owner_contact_time"
                    id="owner_contact_time"
                    xs="7"
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
                    label="Owner Contact Note"
                    name="owner_contact_note"
                    id="owner_contact_note"
                    xs="7"
                    rows={5}
                  />
                </Col>
              </Row>
            </FormGroup>
          </BootstrapForm>
        </Card.Body>
        <ButtonGroup>
          <Button type="button" className="btn btn-primary" onClick={() => {form.submitForm()}}>Save</Button>
        </ButtonGroup>
      </Card>
      )}
    </Formik>
  );
};

export default OwnerContactForm;
