import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'raviger';
import Moment from 'react-moment';
import { Card, ListGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClipboardList, faEdit, faPlusSquare,
} from '@fortawesome/free-solid-svg-icons';

const btn_style = {
  width: '50%',
  margin: '0 auto',
};

const link_style = {
  textDecoration: 'none',
};

const card_style = {
  width: '90%',
};

const header_style = {
  textAlign: 'center',
};

export function PersonView({ id }) {
  // Determine if this is an owner or reporter when creating a Person.
  const is_owner = window.location.pathname.includes('owner');

  const [data, setData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    best_contact: '',
    agency: '',
    drivers_license: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    zip_code: '',
  });

  // Hook for initializing data.
  useEffect(() => {
    const source = axios.CancelToken.source();
    const fetchPersonData = async () => {
      // Fetch Person data.
      await axios.get(`/people/api/person/${id}/`, {
        cancelToken: source.token,
      })
        .then((response) => {
          setData(response.data);
        })
        .catch((error) => {
          console.log(error.response);
        });
    };
    fetchPersonData();
  }, [id]);

  return (
    <Card className="d-flex" border="primary">
      <Card.Body>
        {is_owner
          ? (
            <Card.Title>
              Owner Details
              <Link href={`/hotline/owner/edit/${id}`}>
                {' '}
                <FontAwesomeIcon icon={faEdit} inverse />
              </Link>
            </Card.Title>
          )
          : (
            <Card.Title>
              Reporter Details
              <Link href={`/hotline/reporter/edit/${id}`}>
                {' '}
                <FontAwesomeIcon icon={faEdit} inverse />
              </Link>
            </Card.Title>
          )}
        <ListGroup variant="flush">
          <ListGroup.Item>
            Name:
            {data.first_name}
            {' '}
            {data.last_name}
          </ListGroup.Item>
          <ListGroup.Item>
            Phone:
            {data.phone ? data.phone : 'N/A' }
          </ListGroup.Item>
          <ListGroup.Item>
            Email:
            {data.email ? data.email : 'N/A'}
          </ListGroup.Item>
          {data.best_contact
            ? (
              <ListGroup.Item>
                Best Contact:
                {data.best_contact}
              </ListGroup.Item>
            ) : ''}
          {data.agency
            ? (
              <ListGroup.Item>
                Agency:
                {data.agency}
              </ListGroup.Item>
            ) : ''}
          <ListGroup.Item>
            Address:
            {data.address ? data.full_address : 'N/A'}
          </ListGroup.Item>
        </ListGroup>
        <Card.Footer>
          <Link href="/hotline/">BACK</Link>
        </Card.Footer>
      </Card.Body>
    </Card>
  );
}
