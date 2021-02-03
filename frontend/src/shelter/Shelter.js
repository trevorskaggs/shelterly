import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'raviger';
import { ListGroup } from 'react-bootstrap'
import Header from '../components/Header';

function Shelter() {

  const [data, setData] = useState({shelters: [],  isFetching: false});

  // Hook for initializing data.
  useEffect(() => {
    let source = axios.CancelToken.source();
    const fetchShelters = async () => {
      setData({shelters: [], isFetching: true});
      // Fetch Shelter data.
      await axios.get('/shelter/api/shelter/', {
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

  return (
    <>
    <Header>Shelter</Header>
    <hr/>
    <ListGroup className="flex-fill p-5 h-50">
      <Link href="/shelter/new">
        <ListGroup.Item action>CREATE NEW SHELTER</ListGroup.Item>
      </Link>
      <Link href="/animals/search">
        <ListGroup.Item action>ANIMAL SEARCH</ListGroup.Item>
      </Link>
      {data.shelters.map(shelter => (
        <Link href={"/shelter/" + shelter.id} key={shelter.id}>
          <ListGroup.Item action>{shelter.name} - {shelter.animal_count} Animals</ListGroup.Item>
        </Link>
      ))}
    </ListGroup>
    </>
  )
}

export default Shelter
