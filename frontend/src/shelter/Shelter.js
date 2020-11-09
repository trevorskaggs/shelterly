import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'raviger';
import { ListGroup } from 'react-bootstrap'
import { ShelterForm } from './ShelterForms';
import Header from '../components/Header';

function Shelter() {

  const [data, setData] = useState({shelters: [],  isFetching: false});

  // Hook for initializing data.
  useEffect(() => {
    let source = axios.CancelToken.source();
    const fetchShelters = async () => {
      setData({shelters: [], isFetching: true});
      // Fetch Shelter data.
      await axios.get('/shelter/api/shelter', {
        cancelToken: source.token,
      })
      .then(response => {
        setData({shelters: response.data, isFetching: false});
      })
      .catch(error => {
        console.log(error.response);
        setData({shelters: [], isFetching: false});
      });
    };
    fetchShelters();
    // Cleanup.
    return () => {
      source.cancel();
    };
  }, []);

const Shelter = () => (
<div>
  <h1 style={header_style}>Shelters</h1>
  <ListGroup className="flex-fill p-5 h-50">
    <Link href="/shelter/new">
      <ListGroup.Item action>CREATE NEW SHELTER</ListGroup.Item>
    </Link>
    <Link href="/shelter/list">
      <ListGroup.Item action>SEE ALL SHELTERS</ListGroup.Item>
    </Link>
    <Link href="/animals/search">
      <ListGroup.Item action>ANIMAL SEARCH</ListGroup.Item>
    </Link>
  </ListGroup>
</div>
)

export const NewShelter = ({sid}) => (
  <div>
    <ShelterForm />
  </div>
)

export const UpdateShelter = ({id}) => (
  <div>
    <ShelterForm id={id}/>
  </div>
)

export default Shelter
