import React, {useEffect, useState} from 'react';
import axios from "axios";
import { Link } from 'raviger';
import Moment from 'react-moment';
import { Carousel } from 'react-responsive-carousel';
import { Button, Card, Col, ListGroup, Modal, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBandAid, faClipboardList, faCut, faEdit, faMinusSquare, faPlusSquare, faLink,
} from '@fortawesome/free-solid-svg-icons';
import { faClawMarks, faHomeHeart } from '@fortawesome/pro-solid-svg-icons';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import Header from '../components/Header';
import History from '../components/History';
import noImageFound from '../static/images/image-not-found.png';

function AnimalDetails({id}) {

  const [images, setImages] = useState([]);

  // Initial animal data.
  const [data, setData] = useState({
    owners: null,
    request: null,
    name: '',
    species: '',
    sex: '',
    size: '',
    age: '',
    pcolor: '',
    scolor: '',
    color_notes: '',
    fixed: 'unknown',
    aggressive: 'unknown',
    confined: 'unknown',
    injured: 'unknown',
    behavior_notes: '',
    last_seen: null,
    front_image: null,
    side_image: null,
    room: null,
    extra_images: [],
    action_history: [],
    full_address:'',
    shelter_name: '',
    owner_objects: [],
  });

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const [ownerToDelete, setOwnerToDelete] = useState({id:0, name:''});
  const [showOwnerConfirm, setShowOwnerConfirm] = useState(false);
  const handleOwnerClose = () => setShowOwnerConfirm(false);

  const handleSubmit = async () => {
    await axios.patch('/animals/api/animal/' + id + '/', {status:'REUNITED', room:null})
    .then(response => {
      setData(response.data);
      handleClose()
    })
    .catch(error => {
      console.log(error.response);
    });
  }

  const handleOwnerSubmit = async () => {
    await axios.patch('/animals/api/animal/' + id + '/', {remove_owner:ownerToDelete.id})
    .then(response => {
      setData(prevState => ({ ...prevState, ["owner_objects"]:prevState.owner_objects.filter(owner => owner.id !== ownerToDelete.id) }));
      handleOwnerClose();
    })
    .catch(error => {
      console.log(error.response);
    });
  }

  // Hook for initializing data.
  useEffect(() => {
    let source = axios.CancelToken.source();
    const fetchAnimalData = async () => {
      // Fetch Animal data.
      await axios.get('/animals/api/animal/' + id + '/', {
        cancelToken: source.token,
      })
      .then(response => {
        setData(response.data);
        var image_urls = [];
        image_urls = image_urls.concat(response.data.front_image||[]).concat(response.data.side_image||[]).concat(response.data.extra_images);
        setImages(image_urls);
      })
      .catch(error => {
        console.log(error.response);
      });
    };
    fetchAnimalData();
  }, [id]);

  return (
    <>
    <Header>
      Animal Details - {data.status}
      <OverlayTrigger
        key={"edit"}
        placement="bottom"
        overlay={
          <Tooltip id={`tooltip-edit`}>
            Update animal
          </Tooltip>
        }
      >
        <Link href={"/animals/edit/" + id}> <FontAwesomeIcon icon={faEdit} inverse /></Link>
      </OverlayTrigger>
      {data.status !== 'REUNITED' ?
      <OverlayTrigger
        key={"reunite"}
        placement="bottom"
        overlay={
          <Tooltip id={`tooltip-reunite`}>
            Reunite animal
          </Tooltip>
        }
      >
        <FontAwesomeIcon icon={faHomeHeart} onClick={() => setShow(true)} style={{cursor:'pointer'}} inverse />
      </OverlayTrigger>
      : ""}
    </Header>
    <hr/>
    <div className="row">
      <div className="col-6 d-flex" style={{marginRight:"-15px"}}>
        <Card className="border rounded d-flex" style={{width:"100%"}}>
          <Card.Body>
            <Card.Title>
              <h4>Information
              {data.confined === 'yes' ?
                <OverlayTrigger
                  key={"confined"}
                  placement="top"
                  overlay={
                    <Tooltip id={`tooltip-confined`}>
                      Animal is confined
                    </Tooltip>
                  }
                >
                  <FontAwesomeIcon icon={faLink} size="sm" className="ml-1" />
                </OverlayTrigger> :
              ""}
              {data.fixed === 'yes' ?
                <OverlayTrigger
                  key={"fixed"}
                  placement="top"
                  overlay={
                    <Tooltip id={`tooltip-fixed`}>
                      Animal is fixed or neutered
                    </Tooltip>
                  }
                >
                  <FontAwesomeIcon icon={faCut} size="sm" className="ml-1" />
                </OverlayTrigger> :
              ""}
              {data.aggressive === 'yes' ?
                <OverlayTrigger
                  key={"aggressive"}
                  placement="top"
                  overlay={
                    <Tooltip id={`tooltip-aggressive`}>
                      Animal is aggressive
                    </Tooltip>
                  }
                >
                  <FontAwesomeIcon icon={faClawMarks} size="sm" className="ml-1" />
                </OverlayTrigger> :
              ""}
              {data.injured === 'yes' ?
                <OverlayTrigger
                  key={"injured"}
                  placement="top"
                  overlay={
                    <Tooltip id={`tooltip-injured`}>
                      Animal is injured
                    </Tooltip>
                  }
                >
                  <FontAwesomeIcon icon={faBandAid} size="sm" className="ml-1" />
                </OverlayTrigger> :
              ""}
            </h4>
            </Card.Title>
            <hr/>
            <ListGroup variant="flush" style={{marginTop:"-13px", marginBottom:"-13px", textTransform:"capitalize"}}>
              <ListGroup.Item>
                <div className="row">
                  <span className="col"><b>Name:</b> {data.name||"Unknown"}</span>
                </div>
              </ListGroup.Item>
              <ListGroup.Item>
                <div className="row">
                  <span className="col-6"><b>Species:</b> {data.species}</span>
                  <span className="col-6"><b>Sex:</b> {data.sex||"Unknown"}</span>
                </div>
              </ListGroup.Item>
              <ListGroup.Item>
                <div className="row">
                  <span className="col-6"><b>Age:</b> {data.age||"Unknown"}</span>
                  <span className="col-6"><b>Size:</b> {data.size}</span>
                </div>
              </ListGroup.Item>
              {data.last_seen ? <ListGroup.Item><b>Last Seen:</b> <Moment format="MMMM Do YYYY HH:mm">{data.last_seen}</Moment></ListGroup.Item> : ""}
              {data.request ?
              <ListGroup.Item><b>Service Request: </b>{data.request_address}
                <OverlayTrigger
                  key={"service-request-details"}
                  placement="top"
                  overlay={
                    <Tooltip id={`tooltip-service-request-details`}>
                      Service request details
                    </Tooltip>
                  }
                >
                  <Link href={"/hotline/servicerequest/" + data.request}><FontAwesomeIcon icon={faClipboardList} size="sm" className="ml-1" inverse /></Link>
                </OverlayTrigger>
              </ListGroup.Item>: ''}
            </ListGroup>
            <Card.Title>
              <h4 className="mb-0 mt-3">Contacts
                <OverlayTrigger
                  key={"add-owner"}
                  placement="top"
                  overlay={
                    <Tooltip id={`tooltip-add-owner`}>
                      Add owner
                    </Tooltip>
                  }
                >
                  <Link href={"/hotline/owner/new?animal_id=" + id}><FontAwesomeIcon icon={faPlusSquare} size="sm" className="ml-1" inverse /></Link>
                </OverlayTrigger>
              </h4>
            </Card.Title>
            <hr/>
            <ListGroup variant="flush" style={{marginTop:"-13px", marginBottom:"-13px"}}>
              {data.owner_objects.map(owner => (
                <ListGroup.Item key={owner.id}><b>Owner: </b>{owner.first_name} {owner.last_name}
                  <OverlayTrigger
                    key={"owner-details"}
                    placement="top"
                    overlay={
                      <Tooltip id={`tooltip-owner-details`}>
                        Owner details
                      </Tooltip>
                    }
                  >
                    <Link href={"/hotline/owner/" + owner.id}><FontAwesomeIcon icon={faClipboardList} size="sm" className="ml-1 mr-1" inverse /></Link>
                  </OverlayTrigger>
                  <OverlayTrigger
                    key={"remove-owner"}
                    placement="top"
                    overlay={
                      <Tooltip id={`tooltip-remove-owner`}>
                        Remove owner
                      </Tooltip>
                    }
                  >
                    <FontAwesomeIcon icon={faMinusSquare} style={{cursor:'pointer'}} size="sm" onClick={() => {setOwnerToDelete({id:owner.id, name: owner.first_name + " " + owner.last_name});setShowOwnerConfirm(true);}} inverse />
                  </OverlayTrigger>
                &nbsp;| {owner.display_phone||owner.email||"No Contact"}</ListGroup.Item>
              ))}
              {data.reporter ?
              <ListGroup.Item><b>Reporter: </b>{data.reporter_object.first_name} {data.reporter_object.last_name}
                <OverlayTrigger
                  key={"reporter-details"}
                  placement="top"
                  overlay={
                    <Tooltip id={`tooltip-reporter-details`}>
                      Reporter details
                    </Tooltip>
                  }
                >
                  <Link href={"/hotline/reporter/" + data.reporter}><FontAwesomeIcon icon={faClipboardList} size="sm" className="ml-1" inverse /></Link>
                </OverlayTrigger>
              </ListGroup.Item> : ""}
              {data.owner_objects.length < 1 && !data.reporter ? <ListGroup.Item>No Contacts</ListGroup.Item> : ""}
            </ListGroup>
            <Card.Title>
               <h4 className="mb-0 mt-3">Location</h4>
            </Card.Title>
            <hr/>
            <ListGroup variant="flush" style={{marginBottom:"-13px"}}>
              {data.shelter ? <ListGroup.Item style={{marginTop:"-13px"}}><b>Shelter:</b> {data.shelter_name}<Link href={"/shelter/" + data.shelter}> <FontAwesomeIcon icon={faClipboardList} inverse /></Link></ListGroup.Item> : ""}
              <ListGroup.Item style={{marginTop:"-13px"}}><b>Address:</b> {data.full_address || "Unknown"}</ListGroup.Item>
              {data.room ? <ListGroup.Item style={{marginTop:"-13px"}}><b>Room:</b> {data.room_name}<Link href={"/shelter/room/" + data.room}> <FontAwesomeIcon icon={faClipboardList} inverse /></Link></ListGroup.Item> : ""}
              {data.found_location ? 
              <ListGroup.Item><b>Found Location: </b>{data.found_location}</ListGroup.Item>:
              ""}
            </ListGroup>
          </Card.Body>
        </Card>
      </div>
      <Col xs={6} className="pr-0 d-flex flex-column" style={{width:"100%"}}>
        <div className="slide-container flex-grow-1 border rounded pl-0 pr-0" style={{width:"auto", height:"322px"}}>
          <Carousel className="carousel-wrapper" showThumbs={false} showStatus={false}>
            {images.map(image => (
              <div key={image} className="image-container">
                <img src={image} />
              </div>
            ))}
            <img src={noImageFound} hidden={images.length > 0} />
          </Carousel>
        </div>
        <Card className="border rounded mt-3" style={{width:"100%", height:"100%"}}>
          <Card.Body>
            <Card.Title>
              <h4>Description</h4>
            </Card.Title>
            <hr/>
            <ListGroup variant="flush">
              <ListGroup.Item style={{marginTop:"-13px", textTransform:"capitalize"}}>
              <div className="row">
                <span className="col-6"><b>Primary Color:</b> {data.pcolor||"N/A"}</span>
                <span className="col-6"><b>Secondary Color:</b> {data.scolor||"N/A"}</span>
              </div>
              </ListGroup.Item>
              {data.color_notes ? <ListGroup.Item><b>Color Notes:</b> {data.color_notes}</ListGroup.Item> : ""}
              {data.behavior_notes ? <ListGroup.Item><b>Behavior Notes:</b> {data.behavior_notes}</ListGroup.Item> : ""}
              {data.last_seen ? <ListGroup.Item><b>Last Seen:</b> <Moment format="MMMM Do YYYY HH:mm">{data.last_seen}</Moment></ListGroup.Item> : ""}
            </ListGroup>
          </Card.Body>
        </Card>
      </Col>
    </div>
    <History action_history={data.action_history} />
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Confirm Animal Reunification</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          Has this animal been reunited with its owner?
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={handleSubmit}>Yes</Button>
        <Button variant="secondary" onClick={handleClose}>Close</Button>
      </Modal.Footer>
    </Modal>
    <Modal show={showOwnerConfirm} onHide={handleOwnerClose}>
      <Modal.Header closeButton>
        <Modal.Title>Confirm Owner Removal</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          Are you sure you would like to remove owner {ownerToDelete.name} from this animal?
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={handleOwnerSubmit}>Yes</Button>
        <Button variant="secondary" onClick={handleOwnerClose}>Close</Button>
      </Modal.Footer>
    </Modal>
    </>
  );
};

export default AnimalDetails;
