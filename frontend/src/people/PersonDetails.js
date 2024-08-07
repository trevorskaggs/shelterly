import React, { useContext, useEffect, useState } from 'react';
import axios from "axios";
import { Link } from 'raviger';
import { Button, Card, ListGroup, Modal, OverlayTrigger, Tooltip, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { faHomeHeart, faPhonePlus } from '@fortawesome/pro-solid-svg-icons';
import Moment from 'react-moment';
import Header from '../components/Header';
import History from '../components/History';
import Scrollbar from '../components/Scrollbars';
import AnimalCards from '../components/AnimalCards';
import PhotoDocuments from '../components/PhotoDocuments';
import { SystemErrorContext } from '../components/SystemError';
import ShelterlyPrintifyButton from '../components/ShelterlyPrintifyButton';
import LoadingLink from '../components/LoadingLink';
import ActionsDropdown from '../components/ActionsDropdown';
import { useLocationWithRoutes } from "../hooks";
import { printOwnerDetails, printOwnerAnimalCareSchedules } from './Utils';

function PersonDetails({id, incident, organization}) {

  const { setShowSystemError } = useContext(SystemErrorContext);
  const { getFullLocationFromPath } = useLocationWithRoutes();

  // Determine if this is an owner or reporter when creating a Person.
  let is_owner = window.location.pathname.includes("owner")

  const [isPersonLoading, setIsPersonLoading] = useState(true);
  const [isOrgLoading, setIsOrgLoading] = useState(true);
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);

  // Handle animal reunification submit.
  const handleSubmit = async () => {
    setIsPersonLoading(true);
    await axios.patch('/people/api/person/' + id + '/', {reunite_animals:true})
    .then(response => {
      setData(prevState => ({ ...prevState, "animals":prevState['animals'].map(animal => ({...animal, status:animal.status !== 'DECEASED' ? 'REUNITED' : 'DECEASED'})) }));
      handleClose()
    })
    .catch(error => {
      setShowSystemError(true);
    })
    .finally(() => setIsPersonLoading(false));
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
    reporter_animals: [],
    requests: [],
    images: [],
    owner_contacts: [],
    action_history: [],
  });

  const [organizationData, setOrganizationData] = useState({
    name: '',
    short_name: '',
    liability_name: '',
    liability_short_name: '',
  });

  function buildAnimalUrl(animal) {
    return getFullLocationFromPath(
      `/${organization}/${incident}/animals/${animal.id_for_incident}`
    );
  }

  const handleDownloadPdfClick = async () => {
    setIsPersonLoading(true);
    setIsOrgLoading(true);
    // wait for 1 tick so spinner will set before the print button locks up the browser
    await new Promise(resolve => setTimeout(resolve, 0));
    printOwnerDetails(data, organizationData)
      .finally(() => {
        setIsPersonLoading(false);
        setIsOrgLoading(false);
      });
  }

  const handlePrintAllAnimalsClick = () => {
    const animals = data.animals.map((animal) => ({
      ...animal,
      url: buildAnimalUrl(animal),
      owners: [data]
    }));
    return printOwnerAnimalCareSchedules(animals, id)
  }

  // Hook for initializing data.
  useEffect(() => {
    let unmounted = false;
    let source = axios.CancelToken.source();
    setIsPersonLoading(true);
    setIsOrgLoading(true);

    const fetchPersonData = async () => {
      // Fetch Person data.
      await axios.get('/people/api/person/' + id + '/?incident=' + incident, {
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
      })
      .finally(() => setIsPersonLoading(false));
    };
    fetchPersonData();

    const fetchOrganizationData = async () => {
      // Fetch Organization data.
      await axios.get('/incident/api/organization/?slug=' + organization, {
        cancelToken: source.token,
      })
      .then(response => {
        if (!unmounted) {
          setOrganizationData(response.data[0]);
        }
      })
      .catch(error => {
        if (!unmounted) {
          setShowSystemError(true);
        }
      })
      .finally(() => setIsOrgLoading(false));
    };
    fetchOrganizationData();

    // Cleanup.
    return () => {
      unmounted = true;
      source.cancel();
    };
  }, [id, incident]);

  const isLoading = isPersonLoading || isOrgLoading;

  return (
    <>
    <Header>{is_owner ? 'Owner Details' : 'Reporter Details'}</Header>
    <hr/>
    <div className="row">
      <div className="col-6 d-flex" style={{paddingRight:"9px"}}>
        <Card className="border rounded d-flex" style={{width:"100%", minHeight:"312px"}}>
          <Card.Body>
            <div className="d-flex justify-content-between">
              <h4 className="h5 mb-0 pb-0 pt-2">Information</h4>
              {isLoading ? (
                <Spinner
                  className="align-self-center mr-3"
                  {...{
                    as: 'span',
                    animation: 'border',
                    size: undefined,
                    role: 'status',
                    'aria-hidden': 'true',
                    variant: 'light',
                    style: {
                      height: '1.5rem',
                      width: '1.5rem',
                      marginBottom: '0.75rem'
                    }
                  }}
                />
              ) : (
                <ActionsDropdown alignRight={true} variant="dark" title="Actions">
                  {is_owner ?
                    <LoadingLink
                      href={"/" + organization + "/" + incident + "/people/owner/edit/" + id}
                      isLoading={isLoading}
                      className="text-white d-block py-1 px-3"
                    >
                      <FontAwesomeIcon icon={faEdit} className="mr-1" inverse />
                      Update Owner
                    </LoadingLink>
                  :
                    <LoadingLink
                      href={"/" + organization + "/" + incident + "/people/reporter/edit/" + id}
                      isLoading={isLoading}
                      className="text-white d-block py-1 px-3"
                    >
                      <FontAwesomeIcon icon={faEdit} className="ml-2 mr-1" inverse />
                      Update Reporter
                    </LoadingLink>
                  }
                  <ShelterlyPrintifyButton
                    id="owner-summary"
                    spinnerSize={2.0}
                    tooltipPlacement='right'
                    tooltipText='Download Owner Summary as PDF'
                    printFunc={handleDownloadPdfClick}
                    disabled={isLoading}
                    noOverlay={true}
                  />
                </ActionsDropdown>
              )}
            </div>
            <hr/>
            <Scrollbar no_shadow="true" style={{height:"222px", marginBottom:"-10px"}} renderView={props => <div {...props} style={{...props.style, marginBottom:"-19px"}}/>} renderThumbHorizontal={props => <div {...props} style={{...props.style, display: 'none'}} />}>
              <ListGroup variant="flush" style={{marginTop:"-13px", marginBottom:"-13px"}}>
                <ListGroup.Item><b>Name: </b>{data.first_name} {data.last_name}</ListGroup.Item>
                {data.agency ? <ListGroup.Item><b>Agency: </b>{data.agency}</ListGroup.Item>: ''}
                {data.phone ? <ListGroup.Item><b>Telephone: </b>{data.display_phone} {data.display_alt_phone ? <span>|&nbsp;Alt: {data.display_alt_phone}</span> : ""}</ListGroup.Item> : ""}
                {data.email ? <ListGroup.Item><b>Email: </b>{data.email}</ListGroup.Item> : ""}
                {data.address ?
                  <ListGroup.Item><b>Address: </b>{data.full_address}</ListGroup.Item>
                : ""}
                {data.requests.map(request => (
                  <ListGroup.Item key={request.id}><b>Service Request: </b><Link href={"/" + organization + "/" + incident + "/hotline/servicerequest/" + request.id_for_incident} className="text-link" style={{textDecoration:"none", color:"white"}}>{request.full_address}</Link></ListGroup.Item>
                ))}
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
                  <Link href={"/" + organization + "/" + incident + "/hotline/ownercontact/new?owner=" + id}><FontAwesomeIcon icon={faPhonePlus} className="ml-1" inverse /></Link>
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
                    <Link href={"/" + organization + "/" + incident + "/hotline/ownercontact/" + owner_contact.id}> <FontAwesomeIcon icon={faEdit} inverse /></Link>
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
    {data.animals.length ?
    <div className="row mt-3">
      <div className="col-12 d-flex">
        <Card className="border rounded" style={{width:"100%"}}>
          <Card.Body style={{marginBottom:"-17px"}}>
            <Card.Title>
              <h4 className="mb-0">Animals
                <OverlayTrigger
                  key={"add-owner"}
                  placement="bottom"
                  overlay={
                    <Tooltip id={`tooltip-add-owner`}>
                      Add another owner to all of these animals
                    </Tooltip>
                  }
                >
                  <Link href={"/" + organization + "/" + incident + "/people/owner/new?owner_id=" + id}><FontAwesomeIcon icon={faUserPlus} className="ml-1 fa-move-up" size="sm" inverse /></Link>
                </OverlayTrigger>
                {data.animals.filter(animal => (!['REUNITED', 'DECEASED'].includes(animal.status))).length > 0 ?
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
                {data.animals?.length > 0 && (
                  <ShelterlyPrintifyButton
                    id="owner-animal-care-schedules"
                    spinnerSize={1.5}
                    tooltipPlacement='top'
                    tooltipText='Print All Animal Care Schedules'
                    printFunc={handlePrintAllAnimalsClick}
                  />
                )}
              </h4>
            </Card.Title>
            <hr/>
            <AnimalCards animals={data.animals} show_owner={false} show_status={true} organization={organization} incident={"/" + incident} />
            {data.animals.length < 1 ? <p>This owner has no animals.</p> : ""}
          </Card.Body>
        </Card>
      </div>
    </div> : ""}
    {data.reporter_animals.length ?
    <div className="row mt-3">
      <div className="col-12 d-flex">
        <Card className="border rounded" style={{width:"100%"}}>
          <Card.Body style={{marginBottom:"-17px"}}>
            <Card.Title>
              <h4 className="mb-0">Reported Animals
                <OverlayTrigger
                  key={"add-owner"}
                  placement="bottom"
                  overlay={
                    <Tooltip id={`tooltip-add-owner`}>
                      Add an owner to all of these animals
                    </Tooltip>
                  }
                >
                  <Link href={"/" + organization + "/" + incident + "/people/owner/new?owner_id=" + id}><FontAwesomeIcon icon={faUserPlus} className="ml-1 fa-move-up" size="sm" inverse /></Link>
                </OverlayTrigger>
              </h4>
            </Card.Title>
            <hr/>
            <AnimalCards animals={data.reporter_animals} show_owner={false} show_status={true} organization={organization} incident={"/" + incident} />
            {data.reporter_animals.length < 1 ? <p>This reporter has no animals.</p> : ""}
          </Card.Body>
        </Card>
      </div>
    </div> : ""}
    <PhotoDocuments setData={setData} data={data} id={id} url={'/people/api/person/' + id + '/'} object={is_owner ? "owner" : "reporter"} />
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
