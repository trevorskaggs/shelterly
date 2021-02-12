import React, {useEffect, useState} from 'react';
import axios from "axios";
import { Link } from 'raviger';
import { Card, ListGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClipboardList, faEdit, faPhone, faPlusSquare
} from '@fortawesome/free-solid-svg-icons';
import ReactImageFallback from 'react-image-fallback';
import Moment from 'react-moment';
import noImageFound from '../static/images/image-not-found.png';
import Header from '../components/Header';
import History from '../components/History';

function PersonDetails({id}) {

  // Determine if this is an owner or reporter when creating a Person.
  var is_owner = window.location.pathname.includes("owner")

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
                Add another owner
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
      <div className="col-6 d-flex" style={{marginRight:"-15px"}}>
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
      <div className="col-6 d-flex" style={{marginRight:"-15px"}}>
        <Card className="border rounded d-flex" style={{width:"100%"}}>
          <Card.Body>
            <Card.Title>
              <h4>Owner Contact Log
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
    <div className="row mt-3" hidden={data.animals.length === 0}>
      <div className="col-12 d-flex">
        <Card className="border rounded" style={{width:"100%"}}>
          <Card.Body>
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
              </h4>
            </Card.Title>
            <hr/>
            <span className="d-flex flex-wrap align-items-end">
            {data.animals.map(animal => (
              <Card key={animal.id} className="mr-3" style={{border:"none"}}>
                <ReactImageFallback style={{width:"151px", height:"151px", objectFit: "cover", overflow: "hidden"}} src={animal.front_image} fallbackImage={[animal.side_image, noImageFound]} />
                <Card.Text className="text-center mb-0">
                  {animal.name||"Unknown"}
                  <OverlayTrigger
                    key={"animal-details"}
                    placement="top"
                    overlay={
                      <Tooltip id={`tooltip-animal-details`}>
                        Animal details
                      </Tooltip>
                    }
                  >
                    <Link href={"/animals/" + animal.id}><FontAwesomeIcon icon={faClipboardList} className="ml-1" inverse /></Link>
                  </OverlayTrigger>
                </Card.Text>
                <Card.Text className="text-center mb-0">
                  {animal.status}
                </Card.Text>
                <Card.Text className="text-center" style={{textTransform:"capitalize"}}>
                  {animal.size} {animal.species}
                </Card.Text>
              </Card>
            ))}
            </span>
          </Card.Body>
        </Card>
      </div>
    </div>
    <History action_history={data.action_history} />
    </>
  );
};

export default PersonDetails;
