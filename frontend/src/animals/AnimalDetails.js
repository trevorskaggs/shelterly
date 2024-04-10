import React, { useContext, useEffect, useState } from 'react';
import axios from "axios";
import { Link, navigate } from 'raviger';
import { AuthContext } from "../accounts/AccountsReducer";
import Moment from 'react-moment';
import { Carousel } from 'react-responsive-carousel';
import { Button, Card, Col, ListGroup, Modal, OverlayTrigger, Row, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBan, faMedkit, faCut, faEdit, faEnvelope, faLink, faMinusSquare, faTimes, faUserPlus
} from '@fortawesome/free-solid-svg-icons';
import { faBadgeSheriff, faUserDoctorMessage, faClawMarks, faHomeHeart, faPhoneRotary } from '@fortawesome/pro-solid-svg-icons';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { AnimalDeleteModal } from "../components/Modals";
import Header from '../components/Header';
import History from '../components/History';
import { printAnimalCareSchedule } from './Utils';
import AnimalCoverImage from '../components/AnimalCoverImage';
import { SystemErrorContext } from '../components/SystemError';
import ShelterlyPrintifyButton from '../components/ShelterlyPrintifyButton';
import { useLocationWithRoutes } from '../hooks';
import LoadingLink from '../components/LoadingLink';

function AnimalDetails({ id, incident, organization }) {
  const { state } = useContext(AuthContext);
  const { setShowSystemError } = useContext(SystemErrorContext);
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initial animal data.
  const [data, setData] = useState({
    id,
    id_for_incident: '',
    owners: [],
    request: null,
    request_id_for_incident: '',
    name: '',
    species_string: '',
    sex: '',
    size: '',
    age: '',
    pcolor: '',
    scolor: '',
    color_notes: '',
    fixed: 'unknown',
    aggressive: 'unknown',
    aco_required: 'unknown',
    confined: 'unknown',
    injured: 'unknown',
    behavior_notes: '',
    medical_notes: '',
    microchip: '',
    last_seen: null,
    intake_date: null,
    front_image: null,
    side_image: null,
    room: null,
    vet_requests: [],
    extra_images: [],
    action_history: [],
    shelter_object: {name: '', full_address: ''}
  });

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const [ownerToDelete, setOwnerToDelete] = useState({id:0, name:''});
  const [showOwnerConfirm, setShowOwnerConfirm] = useState(false);
  const handleOwnerClose = () => setShowOwnerConfirm(false);
  const [showAnimalConfirm, setShowAnimalConfirm] = useState(false);
  const handleAnimalClose = () => setShowAnimalConfirm(false);
  const { getFullLocationFromPath } = useLocationWithRoutes();

  // Handle animal reunited submit.
  const handleSubmit = async () => {
    setIsLoading(true);
    await axios.patch('/animals/api/animal/' + data.id + '/', {status:'REUNITED', shelter:null, room:null})
    .then(response => {
      setData(response.data);
      handleClose()
    })
    .catch(error => {
      setShowSystemError(true);
    })
    .finally(() => setIsLoading(false));
  }

  // Handle remove owner submit.
  const handleOwnerSubmit = async () => {
    setIsLoading(true);
    await axios.patch('/animals/api/animal/' + data.id + '/', {remove_owner:ownerToDelete.id})
    .then(response => {
      setData(prevState => ({ ...prevState, "owners":prevState.owners.filter(owner => owner.id !== ownerToDelete.id) }));
      handleOwnerClose();
    })
    .catch(error => {
      setShowSystemError(true);
    })
    .finally(() => setIsLoading(false));
  }

  // Handle animal removal submit.
  const handleAnimalSubmit = async () => {
    setIsLoading(true);
    await axios.patch('/animals/api/animal/' + data.id + '/', {remove_animal:id})
    .then(response => {
      handleAnimalClose();
      if (data.request) {
        navigate('/' + organization + '/' + incident + '/hotline/servicerequest/' + data.request);
      }
      else if (data.owner) {
        navigate('/' + organization + '/' + incident + '/people/owner/' + data.owner);
      }
      else if (data.reporter) {
        navigate('/' + organization + '/' + incident + '/people/reporter/' + data.reporter);
      }
      else {
        navigate('/' + organization + '/' + incident);
      }
    })
    .catch(error => {
      setShowSystemError(true);
    })
    .finally(() => setIsLoading(false));
  }

  const handleDownloadPdfClick = () => {
    const pageURL = getFullLocationFromPath(`/${organization}/${incident}/animals/${id}`)
    return printAnimalCareSchedule({ ...data, url: pageURL });
  }

  // Hook for initializing data.
  useEffect(() => {
    let unmounted = false;
    let source = axios.CancelToken.source();
    setIsLoading(true);
    const fetchAnimalData = async () => {
      // Fetch Animal data.
      await axios.get('/animals/api/incident/' + state.incident.id + '/animal/' + id + '/', {
        cancelToken: source.token,
      })
      .then(response => {
        if (!unmounted) {
          setData(response.data);
          let image_urls = [];
          image_urls = image_urls.concat(response.data.front_image||[]).concat(response.data.side_image||[]).concat(response.data.extra_images);
          setImages(image_urls);
        }
      })
      .catch(error => {
        if (!unmounted) {
          setShowSystemError(true);
        }
      })
      .finally(() => setIsLoading(false));
    };
    fetchAnimalData();
    // Cleanup.
    return () => {
      unmounted = true;
      source.cancel();
    };
  }, [id]);

  return (
    <>
    <Header>
      Animal #{data.id_for_incident || ' - '}
      <OverlayTrigger
        key={"edit"}
        placement="bottom"
        overlay={
          <Tooltip id={`tooltip-edit`}>
            Update animal
          </Tooltip>
        }
      >
        <LoadingLink
          href={"/" + organization + "/" + incident + "/animals/edit/" + id}
          isLoading={isLoading}
        >
          <FontAwesomeIcon icon={faEdit} className="ml-2" inverse />
        </LoadingLink>
      </OverlayTrigger>
      <ShelterlyPrintifyButton
        id="animal-details-animal-care-schedule"
        spinnerSize={2.0}
        tooltipPlacement='bottom'
        tooltipText='Print Animal Care Schedule'
        printFunc={handleDownloadPdfClick}
        disabled={isLoading}
      />
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
          <LoadingLink onClick={() => setShow(true)} isLoading={isLoading}>
            <FontAwesomeIcon icon={faHomeHeart} className="mr-1" style={{cursor:'pointer'}} inverse />
          </LoadingLink>
        </OverlayTrigger>
      : ""}
      <OverlayTrigger
        key={"vetrequest"}
        placement="bottom"
        overlay={
          <Tooltip id={`tooltip-vetrequest`}>
            Create veterinary request
          </Tooltip>
        }
      >
        <LoadingLink
          href={"/" + organization + "/" + incident + "/animals/" + id + "/vetrequest/new"}
          isLoading={isLoading}
        >
          <FontAwesomeIcon icon={faUserDoctorMessage} className="mr-1 ml-1" inverse />
        </LoadingLink>
      </OverlayTrigger>
      <OverlayTrigger
        key={"cancel-animal"}
        placement="bottom"
        overlay={
          <Tooltip id={`tooltip-cancel-animal`}>
            Cancel animal
          </Tooltip>
        }
      >
        <LoadingLink onClick={() => {setShowAnimalConfirm(true);}} isLoading={isLoading}>
          <FontAwesomeIcon icon={faTimes} style={{cursor:'pointer'}} className="ml-1" size="lg" inverse />
        </LoadingLink>
      </OverlayTrigger>
    </Header>
    <hr/>
    <div className="row" style={{marginBottom:"-13px"}}>
      <div className="col-6 d-flex" style={{marginRight:"-15px"}}>
        <Card className="border rounded d-flex" style={{width:"100%", marginBottom:"16px"}}>
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
                  <FontAwesomeIcon icon={faLink} size="sm" className="ml-1 fa-move-up" transform={'shrink-2'} />
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
              data.aggressive === 'no' ?
                <OverlayTrigger
                  key={"not-aggressive"}
                  placement="top"
                  overlay={
                    <Tooltip id={`tooltip-aggressive`}>
                      Animal is not aggressive
                    </Tooltip>
                  }
                >
                  <span className="fa-layers" style={{marginLeft:"2px"}}>
                    <FontAwesomeIcon icon={faClawMarks} size="sm" />
                    <FontAwesomeIcon icon={faBan} color="#ef5151" size="sm" transform={'shrink-2'} />
                  </span>
                </OverlayTrigger> :
              ""}
              {data.aco_required === 'yes' ?
                <OverlayTrigger
                  key={"aco-required"}
                  placement="top"
                  overlay={
                    <Tooltip id={`tooltip-aco-required`}>
                      ACO required
                    </Tooltip>
                  }
                >
                  <FontAwesomeIcon icon={faBadgeSheriff} size="sm" className="ml-1" />
                </OverlayTrigger> : ""}
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
                  <FontAwesomeIcon icon={faMedkit} size="sm" className="ml-1 fa-move-up" />
                </OverlayTrigger> :
              data.injured === 'no' ?
                <OverlayTrigger
                  key={"not-injured"}
                  placement="top"
                  overlay={
                    <Tooltip id={`tooltip-injured`}>
                      Animal is not injured
                    </Tooltip>
                  }
                >
                  <span className="fa-layers" style={{marginLeft:"2px"}}>
                    <FontAwesomeIcon icon={faMedkit} size="sm" className="fa-move-up" />
                    <FontAwesomeIcon icon={faBan} color="#ef5151" size="sm" transform={'shrink-2'} />
                  </span>
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
              data.fixed === 'no' ?
              <OverlayTrigger
                key={"not-fixed"}
                placement="top"
                overlay={
                  <Tooltip id={`tooltip-fixed`}>
                    Animal is not fixed or neutered
                  </Tooltip>
                }
              >
                <span className="fa-layers" style={{marginLeft:"2px"}}>
                  <FontAwesomeIcon icon={faCut} size="sm" />
                  <FontAwesomeIcon icon={faBan} color="#ef5151" size="sm" transform={'shrink-2'} />
                </span>
              </OverlayTrigger> :
              ""}
            </h4>
            </Card.Title>
            <hr/>
            <ListGroup variant="flush" style={{marginTop:"-13px", marginBottom:"-13px", textTransform:"capitalize"}}>
              <ListGroup.Item>
                <div className="row">
                  <span className="col-6"><b>Name:</b> {data.name||"Unknown"}</span>
                  <span className="col-6"><b>Status:</b> {data.status}</span>
                </div>
              </ListGroup.Item>
              <ListGroup.Item>
                <div className="row">
                  <span className="col-6"><b>Species:</b> {data.species_string}</span>
                  <span className="col-6"><b>Sex:</b> {data.sex||"Unknown"}</span>
                </div>
              </ListGroup.Item>
              <ListGroup.Item>
                <div className="row">
                  <span className="col-6"><b>Age:</b> {data.age||"Unknown"}</span>
                  <span className="col-6"><b>Size:</b> {data.size||"Unknown"}</span>
                </div>
              </ListGroup.Item>
              <ListGroup.Item style={{textTransform:"capitalize"}}>
                <div className="row">
                  <span className="col-6"><b>Primary Color:</b> {data.pcolor||"N/A"}</span>
                  <span className="col-6"><b>Secondary Color:</b> {data.scolor||"N/A"}</span>
                </div>
              </ListGroup.Item>
              {data.microchip ?
              <ListGroup.Item>
                <span><b>Microchip:</b> {data.microchip}</span>
              </ListGroup.Item>
              : ""}
            </ListGroup>
            <Card.Title>
              <h4 className="mb-0 mt-3">Contacts
                <OverlayTrigger
                  key={"add-owner"}
                  placement="top"
                  overlay={
                    <Tooltip id={`tooltip-add-owner`}>
                      Add an owner to this animal
                    </Tooltip>
                  }
                >
                  <Link href={"/" + organization + "/" + incident + "/people/owner/new?animal_id=" + id}><FontAwesomeIcon icon={faUserPlus} size="sm" className="ml-1" inverse /></Link>
                </OverlayTrigger>
              </h4>
            </Card.Title>
            <hr/>
            <ListGroup variant="flush" style={{marginTop:"-13px", marginBottom:"-13px"}}>
              {data.owners.map(owner => (
                <ListGroup.Item key={owner.id}><b>Owner: </b><Link href={"/" + organization + "/" + incident + "/people/owner/" + owner.id} className="text-link" style={{textDecoration:"none", color:"white"}}>{owner.first_name} {owner.last_name}</Link>
                {owner.display_phone ?
                  <OverlayTrigger
                    key={"owner-phone"}
                    placement="top"
                    overlay={
                      <Tooltip id={`tooltip-owner-phone`}>
                        {owner.display_phone}
                      </Tooltip>
                    }
                  >
                    <FontAwesomeIcon icon={faPhoneRotary} className="ml-1" inverse />
                  </OverlayTrigger>
                  : ""}
                  {owner.email ?
                  <OverlayTrigger
                    key={"owner-email"}
                    placement="top"
                    overlay={
                      <Tooltip id={`tooltip-owner-email`}>
                        {owner.email}
                      </Tooltip>
                    }
                  >
                    <FontAwesomeIcon icon={faEnvelope} className="ml-1" inverse />
                  </OverlayTrigger>
                  : ""}
                  <OverlayTrigger
                    key={"remove-owner"}
                    placement="top"
                    overlay={
                      <Tooltip id={`tooltip-remove-owner`}>
                        Remove owner
                      </Tooltip>
                    }
                  >
                    <FontAwesomeIcon icon={faMinusSquare} style={{cursor:'pointer'}} className="ml-1" onClick={() => {setOwnerToDelete({id:owner.id, name: owner.first_name + " " + owner.last_name});setShowOwnerConfirm(true);}} inverse />
                  </OverlayTrigger>
                </ListGroup.Item>
              ))}
              {data.reporter ?
              <ListGroup.Item><b>Reporter: </b><Link href={"/" + organization + "/" + incident + "/people/reporter/" + data.reporter} className="text-link" style={{textDecoration:"none", color:"white"}}>{data.reporter_object.first_name} {data.reporter_object.last_name}</Link></ListGroup.Item> : ""}
              {data.owners.length < 1 && !data.reporter ? <ListGroup.Item>No Contacts</ListGroup.Item> : ""}
            </ListGroup>
            <Card.Title>
               <h4 className="mb-0 mt-3">Location</h4>
            </Card.Title>
            <hr/>
            <ListGroup variant="flush" style={{marginBottom:"-13px", marginTop:"-13px"}}>
              {data.found_location ? <ListGroup.Item><b>Found Location: </b>{data.found_location}</ListGroup.Item> : ""}
              {data.request ?
                <ListGroup.Item><b>Service Request: </b><Link href={"/" + organization + "/" + incident + "/hotline/servicerequest/" + data.request_id_for_incident} className="text-link" style={{textDecoration:"none", color:"white"}}>{data.request_address}</Link></ListGroup.Item>
              : ''}
              {data.shelter ?
              <ListGroup.Item>
                <Row>
                  <Col>
                    <b>Shelter:</b> <Link href={"/" + organization + "/" + incident + "/shelter/" + data.shelter} className="text-link" style={{textDecoration:"none", color:"white"}}>{data.shelter_object.name}</Link>
                  </Col>
                  <Col>
                    {data.room ? <div><b>Room:</b> <Link href={"/" + organization + "/" + incident + "/shelter/room/" + data.room} className="text-link" style={{textDecoration:"none", color:"white"}}>{data.room_name}</Link></div> : ""}
                  </Col>
                </Row>
                {data.intake_date ? <div className="mt-1"><b>Intake Date:</b> <Moment format="MMMM Do YYYY HH:mm">{data.intake_date}</Moment></div> : ""}
                <div className="mt-1"><b>Address:</b> {data.shelter_object.full_address || "Unknown"}</div>
              </ListGroup.Item> : ""}
            </ListGroup>
          </Card.Body>
        </Card>
      </div>
      <Col xs={6} className="pr-0 d-flex flex-column" style={{width:"100%"}}>
        <div className="slide-container flex-grow-1 border rounded pl-0 pr-0" style={{width:"auto", height:"322px"}}>
          {images.length < 1 ?
            <Carousel className="carousel-wrapper" showThumbs={false} showStatus={false}>
              <AnimalCoverImage
                animalSpecies={data.species_string}
                animalImageSrc={data.front_image}
                customStyles={{ width: '100%', padding: '40px' }}
              />
            </Carousel>
          :
            <Carousel className="carousel-wrapper" showThumbs={false} showStatus={false}>
              {images.map(image => (
                <div key={image} className="image-container">
                  <img src={image} alt="Animal" />
                </div>
              ))}
            </Carousel>
          }
        </div>
        <Card className="border rounded mt-3" style={{width:"100%", height:"100%", marginBottom:"16px"}}>
          <Card.Body>
            <Card.Title>
              <h4>Description</h4>
            </Card.Title>
            <hr/>
            <ListGroup variant="flush" style={{marginTop:"-13px", marginBottom:"-13px"}}>
              {data.color_notes ? <ListGroup.Item><b>Breed / Description:</b> {data.color_notes}</ListGroup.Item> : ""}
              {data.behavior_notes ? <ListGroup.Item style={{whiteSpace:"pre-line"}}><b>Animal Notes:</b> {data.behavior_notes}</ListGroup.Item> : ""}
              {data.medical_notes ? <ListGroup.Item style={{whiteSpace:"pre-line"}}><b>Medical Notes:</b> {data.medical_notes}</ListGroup.Item> : ""}
              {data.last_seen ? <ListGroup.Item><b>Last Seen:</b> <Moment format="MMMM Do YYYY HH:mm">{data.last_seen}</Moment></ListGroup.Item> : ""}
              {!data.color_notes && !data.behavior_notes && !data.medical_notes && !data.last_seen ? <ListGroup.Item>No description available</ListGroup.Item> : ""}
            </ListGroup>
          </Card.Body>
        </Card>
        {data.medical_record ?
        <Card className="border rounded" style={{width:"100%", height:"100%", marginBottom:"16px"}}>
          <Card.Body>
            <Card.Title>
              <h4>Medical</h4>
            </Card.Title>
            <hr/>
            <ListGroup variant="flush" style={{marginTop:"-13px", marginBottom:"-13px"}}>
            {state.user.vet_perms ?
              <ListGroup.Item>
                <b>Medical Record:</b> <Link href={"/" + organization + "/" + incident + "/vet/medrecord/" + data.medical_record} className="text-link" style={{textDecoration:"none", color:"white"}}>MR#{data.medical_record}</Link>
              </ListGroup.Item>
            : ""}
            {data.vet_requests.map(vet_request => (
              <ListGroup.Item key={vet_request.id}>
                <b>Vet Request:</b> <Link href={"/" + organization + "/" + incident + "/vet/vetrequest/" + vet_request.id} className="text-link" style={{textDecoration:"none", color:"white"}}>VR#{vet_request.id}</Link> - {vet_request.status}
              </ListGroup.Item>
            ))}
            </ListGroup>
          </Card.Body>
        </Card> : ""}
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
    <AnimalDeleteModal name={data.name} show={showAnimalConfirm} handleClose={handleAnimalClose} handleSubmit={handleAnimalSubmit} />
    </>
  );
};

export default AnimalDetails;
