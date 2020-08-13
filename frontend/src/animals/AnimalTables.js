
import axios from "axios";
// import { Fab } from '@material-ui/core';
// import AssignmentIcon from '@material-ui/icons/Assignment';
// import EditIcon from '@material-ui/icons/Edit';

import React, { useEffect, useState } from 'react';
import { Link } from 'raviger';
import { Button, ButtonGroup, Card, CardGroup, Form, FormControl, InputGroup, ListGroup} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClipboardList
} from '@fortawesome/free-solid-svg-icons';







const input_style = {
  width: "40%",
  display: "inline-block",
  position: 'relative',
}

// export function AnimalSearch() {

//   const [data, setData] = useState({animals: [], isFetching: false});
//   const [searchTerm, setSearchTerm] = useState("");

//   // Update searchTerm when field input changes.
//   const handleChange = event => {
//     setSearchTerm(event.target.value);
//   };

//   // Use searchTerm to filter animals.
//   const handleSubmit = async event => {
//     event.preventDefault();

//     let source = axios.CancelToken.source();
//     setData({animals: [], isFetching: true});
//     // Fetch ServiceRequest data filtered searchTerm.
//     await axios.get('http://localhost:8000/animals/api/animal/?search=' + searchTerm, {
//       cancelToken: source.token,
//     })
//     .then(response => {
//       setData({animals: response.data, isFetching: false});
//     })
//     .catch(error => {
//       console.log(error.response);
//       setData({animals: [], isFetching: false});
//     });
//   }

//   return (
//     <div className="ml-2 mr-2">
//       <Form onSubmit={handleSubmit}>
//         <div className="form-row">
//           <Input
//             type="text"
//             placeholder="Search"
//             name="searchTerm"
//             value={searchTerm}
//             onChange={handleChange}
//             style={input_style}
//           />
//           <button className="btn btn-warning ml-1">Search!</button>
//         </div>
//       </Form>
//       <hr/>
//       {data.animals.map(animal => (
//         <div key={animal.id} style={{width:"90%"}} className="card card-body bg-light mb-2">
//           <div className="row">
//             <div className="col-sm-2">
//               Animal Image Here
//             </div>
//             <div className="col-sm-3">
//               <b>{animal.name} - {animal.status}</b> <Fab color="primary" href={"/animals/animal/" + animal.id} className="mb-1" style={{width:23,height:23, minHeight:23, color:"#fff", backgroundColor: "#c82333"}} title="Animal details" aria-label="details"><AssignmentIcon style={{fontSize:10}} /></Fab>
//               <div className="mt-1 mb-1">{animal.species}{animal.species && animal.sex ? ", " : ""}{animal.sex}</div>
//               <div className="mt-1 mb-1">{animal.size}{animal.size && animal.age ? ", " : ""}{animal.age}</div>
//             </div>
//             <div className="col-sm">
//               {animal.request ? <div><b>Request #{animal.request}</b> <Fab color="primary" href={"/hotline/servicerequest/" + animal.request} className="mb-1" style={{width:23,height:23, minHeight:23}} title="request details" aria-label="request_details"><AssignmentIcon style={{fontSize:10}} /></Fab></div> : ""}
//               {animal.owner ? <div><b>Owner:</b> {animal.owner_object.first_name} {animal.owner_object.last_name} {animal.owner_object.phone} {animal.owner_object.first_name !== 'Unknown' ? <Fab href={"/hotline/owner/" + animal.owner} className="mb-1" style={{width:23,height:23, minHeight:23, color:"#fff", backgroundColor: "#28a745"}} title="Owner details" aria-label="owner_details"><AssignmentIcon style={{fontSize:10}} /></Fab> : <Fab href={"/hotline/owner/edit/" + animal.owner} className="mb-1" style={{width:23,height:23, minHeight:23, color:"#fff", backgroundColor: "#28a745"}} title="Edit Owner" aria-label="edit_owner"><EditIcon style={{fontSize:10}} /></Fab>}</div> : ""}
//               <div><b>Location:</b> {animal.full_address ? animal.full_address : "Unknown"}</div>
//             </div>
//           </div>
//         </div>
//       ))}
//       <p>{data.isFetching ? 'Fetching Animals...' : <span>{!data.animals.length && searchTerm ? 'No Animals found.' : ''}</span>}</p>
//     </div>
//   )
// }

export function AnimalRequestTable() {

  const [data, setData] = useState({animals: [], isFetching: false});
  const [searchTerm, setSearchTerm] = useState("");
  const [statusOptions, setStatusOptions] = useState({status:"open", openColor:"primary", closedColor:"secondary"});

  // Update searchTerm when field input changes.
  const handleChange = event => {
    setSearchTerm(event.target.value);
  };

  // Use searchTerm to filter service_requests.
  const handleSubmit = async event => {
    event.preventDefault();

    let source = axios.CancelToken.source();
    setData({animals: [], isFetching: true});
    // Fetch ServiceRequest data filtered searchTerm.
    await axios.get('/animals/api/animal/?search=' + searchTerm, {
      cancelToken: source.token,
    })
    .then(response => {
      setData({animals: response.data, isFetching: false});
    })
    .catch(error => {
      console.log(error.response);
      setData({animals: [], isFetching: false});
    });
  }

  // Hook for initializing data.
  useEffect(() => {
    let source = axios.CancelToken.source();
    const fetchServiceRequests = async () => {
      setData({animals: [], isFetching: true});
      // Fetch animal data.
      await axios.get('/animals/api/animal/?search=' + searchTerm, {
        cancelToken: source.token,
      })
      .then(response => {
        setData({animals: response.data, isFetching: false});
      })
      .catch(error => {
        console.log(error.response);
        setData({animals: [], isFetching: false});
      });
    };
    fetchServiceRequests();
    // Cleanup.
    return () => {
      source.cancel();
    };
  }, [statusOptions.status]);

  return (
    <div className="ml-2 mr-2">
      <Form onSubmit={handleSubmit}>
        <InputGroup className="mb-3">
          <FormControl
            type="text"
            placeholder="Search"
            name="searchTerm"
            value={searchTerm}
            onChange={handleChange}
          />
          <InputGroup.Append>
            <Button variant="outline-light">Search</Button>
          </InputGroup.Append>
          </InputGroup>
      </Form>

      {data.animals.map(animal => (
        <div key={animal.id} className="mt-3">
          <div className="card-header"> {animal.name} ({animal.species ? animal.species : "species unknown"}) - {animal.status}<Link href={"/animals/animal/" + animal.id}> <FontAwesomeIcon icon={faClipboardList} inverse /></Link></div>
        <CardGroup>
          <Card key={animal.id}>
            <Card.Body>
              <Card.Title>Contacts</Card.Title>
              <ListGroup>
                <ListGroup.Item className='owner'><span>{animal.owner_object ? "Owner: " + animal.owner_object.first_name + " " + animal.owner_object.last_name + " " + animal.owner_object.phone : "Owner Not Identified"} {animal.owner_object ? <Link href={"/hotline/owner/" + animal.owner}> <FontAwesomeIcon icon={faClipboardList} inverse /></Link> : "" }</span></ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
          <Card>
            <Card.Body>
              <Card.Title>Related Animals</Card.Title>
              <ListGroup>
                <span><li>None</li></span>
              </ListGroup>
            </Card.Body>
          </Card>
        </CardGroup>
        </div>

      ))}
      <p>{data.isFetching ? 'Fetching service requests...' : <span>{data.service_requests && data.service_requests.length ? '' : 'No Service Requests found.'}</span>}</p>
    </div>
  )
}
