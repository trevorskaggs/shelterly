import React, {useEffect, useState} from 'react';
import axios from "axios";
import { Link } from 'raviger';
import { Button, Card, ListGroup, Modal, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEdit, faPlusSquare, faUserPlus
} from '@fortawesome/free-solid-svg-icons';
import { faHomeHeart, faPhonePlus } from '@fortawesome/pro-solid-svg-icons';
import Moment from 'react-moment';
import Header from '../components/Header';
import History from '../components/History';
import Scrollbar from '../components/Scrollbars';
import AnimalCards from '../components/AnimalCards';

function PersonDetails({id}) {

  // Determine if this is an owner or reporter when creating a Person.
  let is_owner = window.location.pathname.includes("owner")

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);

  // Handle animal reunification submit.
  const handleSubmit = async () => {
    await axios.patch('/people/api/person/' + id + '/', {reunite_animals:true})
    .then(response => {
      setData(prevState => ({ ...prevState, "animals":prevState['animals'].map(animal => ({...animal, status:animal.status !== 'DECEASED' ? 'REUNITED' : 'DECEASED'})) }));
      handleClose()
    })
    .catch(error => {
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
    let unmounted = false;
    let source = axios.CancelToken.source();

    const fetchPersonData = async () => {
      // Fetch Person data.
      await axios.get('/people/api/person/' + id + '/', {
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
    fetchPersonData();
    // Cleanup.
    return () => {
      unmounted = true;
      source.cancel();
    };
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
        <Card className="border rounded d-flex" style={{width:"100%", minHeight:"312px"}}>
          <Card.Body>
            <Card.Title>
              <h4>Information</h4>
            </Card.Title>
            <hr/>
            <Scrollbar no_shadow="true" style={{height:"222px", marginBottom:"-10px"}} renderView={props => <div {...props} style={{...props.style, marginBottom:"-19px"}}/>} renderThumbHorizontal={props => <div {...props} style={{...props.style, display: 'none'}} />}>
              <ListGroup variant="flush" style={{marginTop:"-13px", marginBottom:"-13px"}}>
                <ListGroup.Item><b>Name: </b>{data.first_name} {data.last_name}</ListGroup.Item>
                {data.agency ? <ListGroup.Item><b>Agency: </b>{data.agency}</ListGroup.Item>: ''}
                {data.phone ? <ListGroup.Item><b>Telephone: </b>{data.display_phone} {data.display_alt_phone ? <span>|&nbsp;Alt: {data.display_alt_phone}</span> : ""}</ListGroup.Item> : ""}
                {data.email ? <ListGroup.Item><b>Email: </b>{data.email}</ListGroup.Item> : ""}
                {data.request ?
                  <ListGroup.Item><b>Service Request: </b><Link href={"/hotline/servicerequest/" + data.request.id} className="text-link" style={{textDecoration:"none", color:"white"}}>{data.request.full_address}</Link></ListGroup.Item>
                :
                  <ListGroup.Item><b>Address: </b>{data.address ? data.full_address : 'No Address Listed'}</ListGroup.Item>
                }
                {data.comments ? <ListGroup.Item><b>Comments: </b>{data.comments}</ListGroup.Item>: ''}
              </ListGroup>
            </Scrollbar>
          </Card.Body>
        </Card>
      </div>
      {is_owner ?
      <div className="col-6 d-flex" style={{paddingLeft:"9px"}}>
        <Card className="border rounded d-flex" style={{width:"100%", minHeight:"312px"}}>
          <Card.Body style={{width:"100%", minHeight:"312px"}}>
            <Card.Title>
              <h4>Contact Log
                <OverlayTrigger
                  key={"add-contact-note"}
                  placement="top"
                  overlay={
                    <Tooltip id={`tooltip-add-contact-note`}>
                      Add an owner contact note
                    </Tooltip>
                  }
                >
                  <Link href={"/hotline/ownercontact/new?owner=" + id}><FontAwesomeIcon icon={faPhonePlus} className="ml-1" inverse /></Link>
                </OverlayTrigger>
              </h4>
            </Card.Title>
            <hr/>
            <Scrollbar no_shadow="true" style={{height:"210px"}} renderThumbHorizontal={props => <div {...props} style={{...props.style, display: 'none'}} />}>
              <ListGroup variant="flush" style={{marginTop:"-13px", marginBottom:"-13px"}}>
                {data.owner_contacts.map(owner_contact => (
                <ListGroup.Item key={owner_contact.id}><b><Moment format="MMMM Do YYYY HH:mm">{owner_contact.owner_contact_time}</Moment></b>
                <OverlayTrigger
                    key={"add-contact-note"}
                    placement="top"
                    overlay={
                      <Tooltip id={`tooltip-add-contact-note`}>
                        Update owner contact note
                      </Tooltip>
                    }
                  >
                    <Link href={"/hotline/ownercontact/" + owner_contact.id}> <FontAwesomeIcon icon={faEdit} inverse /></Link>
                  </OverlayTrigger>
                  : {owner_contact.owner_contact_note}</ListGroup.Item>
                ))}
                {data.owner_contacts.length < 1 ? <ListGroup.Item>This owner has not been contacted yet.</ListGroup.Item> : ""}
              </ListGroup>
            </Scrollbar>
          </Card.Body>
        </Card>
      </div> : ""}
    </div>
    <div className="row mt-3">
      <div className="col-12 d-flex">
        <Card className="border rounded" style={{width:"100%"}}>
          <Card.Body style={{marginBottom:"-17px"}}>
            <Card.Title>
              <h4 className="mb-0">Owned Animals
                <OverlayTrigger
                  key={"add-animal"}
                  placement="top"
                  overlay={
                    <Tooltip id={`tooltip-add-animal`}>
                      Add animal to this owner
                    </Tooltip>
                  }
                >
                  <Link href={"/animals/new?owner_id=" + id}><FontAwesomeIcon icon={faPlusSquare} className="ml-1" inverse /></Link>
                </OverlayTrigger>
                <OverlayTrigger
                  key={"add-owner"}
                  placement="bottom"
                  overlay={
                    <Tooltip id={`tooltip-add-owner`}>
                      Add an{is_owner ? "other" : ""} owner to all of these animals
                    </Tooltip>
                  }
                >
                  <Link href={"/people/owner/new?owner_id=" + id}><FontAwesomeIcon icon={faUserPlus} className="ml-1 fa-move-up" size="sm" inverse /></Link>
                </OverlayTrigger>
                {is_owner && data.animals.filter(animal => (!['REUNITED', 'DECEASED'].includes(animal.status))).length > 0 ?
                <OverlayTrigger
                  key={"reunite"}
                  placement="top"
                  overlay={
                    <Tooltip id={`tooltip-reunite`}>
                      Reunite all animals with this owner
                    </Tooltip>
                  }
                >
                  <FontAwesomeIcon icon={faHomeHeart} onClick={() => setShow(true)} style={{cursor:'pointer'}} className="ml-1 fa-move-up" size="sm" inverse />
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
