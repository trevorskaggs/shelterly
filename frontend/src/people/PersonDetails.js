import React, {useEffect, useState} from 'react';
import axios from "axios";
import { Link } from 'raviger';
import { Button, Card, ListGroup, Modal, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClipboardList, faEdit, faPhone, faPlusSquare
} from '@fortawesome/free-solid-svg-icons';
import { faHomeHeart } from '@fortawesome/pro-solid-svg-icons';
import Moment from 'react-moment';
import Header from '../components/Header';
import History from '../components/History';
import AnimalCards from '../components/AnimalCards';

function PersonDetails({id}) {

  // Determine if this is an owner or reporter when creating a Person.
  var is_owner = window.location.pathname.includes("owner")

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);

  // Handle animal reunification submit.
  const handleSubmit = async () => {
    await axios.patch('/people/api/person/' + id + '/', {reunite_animals:true})
    .then(response => {
      setData(prevState => ({ ...prevState, "animals":prevState['animals'].map(animal => ({...animal, status:'REUNITED'})) }));
      handleClose()
    })
    .catch(error => {
      console.log(error.response);
    });
  }

  const [data, setData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    comments: '',
    agency: '',
    drivers_license: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    zip_code: '',
    animals: [],
    owner_contacts: [],
    action_history: [],
  });

  // Hook for initializing data.
  useEffect(() => {
    let source = axios.CancelToken.source();
    const fetchPersonData = async () => {
      // Fetch Person data.
      await axios.get('/people/api/person/' + id + '/', {
        cancelToken: source.token,
      })
      .then(response => {
        setData(response.data);
      })
      .catch(error => {
        console.log(error.response);
      });
    };
    fetchPersonData();
  }, [id]);

  return (
    <>
    <Header>
      {is_owner ?
        <span>Owner Details
          <OverlayTrigger
            key={"update-owner"}
            placement="bottom"
            overlay={
              <Tooltip id={`tooltip-update-owner`}>
                Update owner
              </Tooltip>
            }
          >
            <Link href={"/people/owner/edit/" + id}><FontAwesomeIcon icon={faEdit} className="ml-1 mr-1" inverse /></Link>
          </OverlayTrigger>
          <OverlayTrigger
            key={"add-owner"}
            placement="bottom"
            overlay={
              <Tooltip id={`tooltip-add-owner`}>
                Add another owner for all of these animals
              </Tooltip>
            }
          >
            <Link href={"/people/owner/new?owner_id=" + id}><FontAwesomeIcon icon={faPlusSquare} className="fa-move-down" inverse /></Link>
          </OverlayTrigger>
        </span>
      :
        <span>Reporter Details
          <OverlayTrigger
            key={"update-reporter"}
            placement="bottom"
            overlay={
              <Tooltip id={`tooltip-update-reporter`}>
                Update reporter
              </Tooltip>
            }
          >
            <Link href={"/people/reporter/edit/" + id}><FontAwesomeIcon icon={faEdit} className="ml-1" inverse /></Link>
          </OverlayTrigger>
        </span>
      }
    </Header>
    <hr/>
    <div className="row">
      <div className="col-6 d-flex" style={{paddingRight:"9px"}}>
        <Card className="border rounded d-flex" style={{width:"100%"}}>
          <Card.Body>
            <Card.Title>
              <h4>Information</h4>
            </Card.Title>
            <hr/>
            <ListGroup variant="flush" style={{marginTop:"-13px", marginBottom:"-13px"}}>
              <ListGroup.Item><b>Name: </b>{data.first_name} {data.last_name}</ListGroup.Item>
              {data.agency ? <ListGroup.Item><b>Agency: </b>{data.agency}</ListGroup.Item>: ''}
              {data.phone ? <ListGroup.Item><b>Telephone: </b>{data.display_phone}</ListGroup.Item> : ""}
              {data.alt_phone ? <ListGroup.Item><b>Alternate Telephone: </b>{data.display_alt_phone}</ListGroup.Item> : ""}
              {data.email ? <ListGroup.Item><b>Email: </b>{data.email}</ListGroup.Item> : ""}
              {data.comments ? <ListGroup.Item><b>Comments: </b>{data.comments}</ListGroup.Item>: ''}
              <ListGroup.Item><b>Address: </b>{data.address ? data.full_address : 'No Address Listed'}</ListGroup.Item>
              {data.request ?
                <ListGroup.Item><b>Service Request: </b>{data.request.full_address}
                  <OverlayTrigger
                    key={"request-details"}
                    placement="top"
                    overlay={
                      <Tooltip id={`tooltip-request-details`}>
                        Service request details
                      </Tooltip>
                    }
                  >
                    <Link href={"/hotline/servicerequest/" + data.request.id}><FontAwesomeIcon icon={faClipboardList} size="sm" className="ml-1" inverse /></Link>
                  </OverlayTrigger>
                </ListGroup.Item>: ''}
            </ListGroup>
          </Card.Body>
        </Card>
      </div>
      <div className="col-6 d-flex" style={{paddingLeft:"9px"}}>
        <Card className="border rounded d-flex" style={{width:"100%"}}>
          <Card.Body>
            <Card.Title>
              <h4>Contact Log
                <Link href={"/hotline/ownercontact/new?owner=" + id}><FontAwesomeIcon icon={faPhone} className="ml-1" inverse /></Link>
              </h4>
            </Card.Title>
            <hr/>
            <ListGroup variant="flush" style={{marginTop:"-13px", marginBottom:"-13px"}}>
              {data.owner_contacts.map(owner_contact => (
              <ListGroup.Item key={owner_contact.id}><b><Moment format="MMMM Do YYYY HH:mm">{owner_contact.owner_contact_time}</Moment></b><Link href={"/hotline/ownercontact/" + owner_contact.id}> <FontAwesomeIcon icon={faEdit} inverse /></Link>: {owner_contact.owner_contact_note}</ListGroup.Item>
              ))}
            </ListGroup>
          </Card.Body>
        </Card>
      </div>
    </div>
    <div className="row mt-3">
      <div className="col-12 d-flex">
        <Card className="border rounded" style={{width:"100%"}}>
          <Card.Body style={{marginBottom:"-17px"}}>
            <Card.Title>
              <h4 className="mb-0">Animals
                <OverlayTrigger
                  key={"add-animal"}
                  placement="top"
                  overlay={
                    <Tooltip id={`tooltip-add-animal`}>
                      Add animal
                    </Tooltip>
                  }
                >
                  <Link href={"/animals/new?owner_id=" + id}><FontAwesomeIcon icon={faPlusSquare} className="ml-1" inverse /></Link>
                </OverlayTrigger>
                {is_owner && data.animals.filter(animal => (animal.status !== 'REUNITED')).length > 0 ?
                <OverlayTrigger
                  key={"reunite"}
                  placement="top"
                  overlay={
                    <Tooltip id={`tooltip-reunite`}>
                      Reunite all owner animals
                    </Tooltip>
                  }
                >
                  <FontAwesomeIcon icon={faHomeHeart} onClick={() => setShow(true)} style={{cursor:'pointer'}} className="ml-1 fa-move-up" inverse />
                </OverlayTrigger>
                : ""}
              </h4>
            </Card.Title>
            <hr/>
            <AnimalCards animals={data.animals} show_owner={false} show_status={true} />
            {data.animals.length < 1 ? <p>This {is_owner ? "owner" : "reporter"} has no animals.</p> : ""}
          </Card.Body>
        </Card>
      </div>
    </div>
    <History action_history={data.action_history} />
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Confirm Animal Reunification</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          Have all of the animals been reunited with this owner?
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={handleSubmit}>Yes</Button>
        <Button variant="secondary" onClick={handleClose}>Close</Button>
      </Modal.Footer>
    </Modal>
    </>
  );
};

export default PersonDetails;
