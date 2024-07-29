import React, { useContext, useEffect, useState } from 'react';
import axios from "axios";
import Moment from 'react-moment';
import { Link } from 'raviger';
import {
  Button,
  Card,
  Col,
  ListGroup,
  Modal,
  OverlayTrigger,
  Row,
  Tooltip,
  Spinner,
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEdit,
  faStethoscope,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import {
  faDiamondExclamation,
  faFolderMedical
} from '@fortawesome/pro-solid-svg-icons';
import Header from '../components/Header';
import { SystemErrorContext } from '../components/SystemError';
import LoadingLink from '../components/LoadingLink';
import ActionsDropdown from '../components/ActionsDropdown';
import { AuthContext } from "../accounts/AccountsReducer";

function VetRequestDetails({ id, incident, organization }) {
  const [isLoading, setIsLoading] = useState(true);
  const { dispatch, state } = useContext(AuthContext);
  const { setShowSystemError } = useContext(SystemErrorContext);

  const priorityText = {urgent:'Urgent', when_available:'When Available', yellow:'Yellow', red:'Red'};

  const [data, setData] = useState({id: '', medical_record: null, requested_by:null, open: '', concern: '', priority: '', presenting_complaints:[], animal_object: {id:'', name:'', species:'', category:'', sex:'', age:'', fixed:'', pcolor:'', scolor:'', medical_notes:'', shelter_object:{}, room_name:''}});

  const [showModal, setShowModal] = useState(false);
  const cancelVetRequest = () => {
    axios.patch('/vet/api/vetrequest/' + id + '/', {status:'Canceled'})
    .catch(error => {
      setShowSystemError(true);
    });
    setData(prevState => ({ ...prevState, 'status':'Canceled'}));
    setShowModal(false)
  }

  // Hook for initializing data.
  useEffect(() => {
    let unmounted = false;
    let source = axios.CancelToken.source();
    setIsLoading(true);

    const fetchVetRequestData = async () => {
      // Fetch VetRequest Details data.
      await axios.get('/vet/api/vetrequest/' + id + '/?incident=' + incident, {
          cancelToken: source.token,
      })
      .then(response => {
        if (!unmounted) {
          setData(response.data);
        }
      })
      .catch(error => {
        setShowSystemError(true);
      })
      .finally(() => setIsLoading(false));
    };
    fetchVetRequestData();
    // Cleanup.
    return () => {
      unmounted = true;
      source.cancel();
    };
  }, [id, incident]);

  return (
    <>
    <Header>{`Veterinary Request #${data.id || ' - '}`}</Header>
    <hr/>
    <div className="row">
      <div className="col-6 d-flex">
        <Card className="border rounded d-flex" style={{width:"100%"}}>
          <Card.Body style={{marginTop:"-10px"}}>
            <div className="d-flex justify-content-between">
              <h4 className="h5 mb-0 pb-0 pt-2">
                <Row className="ml-0 pr-0">
                Information
                {data.caution ? <OverlayTrigger
                  key={"caution"}
                  placement="top"
                  overlay={
                    <Tooltip id={`tooltip-caution`}>
                      Use caution when handling this animal.
                    </Tooltip>
                  }
                >
                  <FontAwesomeIcon icon={faDiamondExclamation} className="ml-1 fa-move-down" inverse />
                </OverlayTrigger> : ""}
                </Row>
              </h4>
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
                <ActionsDropdown>
                  {(state.user.is_superuser || state.user.vet_perms) && data.status === 'Open' ?
                    <LoadingLink
                      href={"/" + organization + "/" + incident + "/vet/medrecord/" + data.medical_record + "/workflow?vetrequest_id=" + id}
                      isLoading={isLoading}
                      className="text-white d-block py-1 px-3"
                    >
                      <FontAwesomeIcon icon={faStethoscope} className="mr-1" inverse />
                      Start Veterinary Exam
                    </LoadingLink>
                  : ""}
                  {data.status !== 'Canceled' ? <LoadingLink
                      href={"/" + organization + "/" + incident + "/vet/vetrequest/edit" + id}
                      isLoading={isLoading}
                      className="text-white d-block py-1 px-3"
                    >
                      <FontAwesomeIcon icon={faEdit} className="mr-1" inverse />
                      Update Vet Request
                    </LoadingLink> : ""}
                  {data.status === 'Open' ? <LoadingLink
                      onClick={() => {setShowModal(true)}}
                      isLoading={isLoading}
                      className="text-white d-block py-1 px-3"
                    >
                      <FontAwesomeIcon icon={faTimes} className="mr-2" style={{cursor:'pointer'}} transform='grow-3' inverse />
                      Cancel veterinary request
                    </LoadingLink> : ""}
                </ActionsDropdown>
              )}
            </div>
            <hr className="pt-0 mt-1" />
            <ListGroup variant="flush" style={{marginTop:"-13px", marginBottom:"-13px"}}>
              <ListGroup.Item>
                <div className="row">
                  <span className="col-6"><b>Status: </b>{data.status}</span>
                  <span className="col-6"><b>Priority: </b>{priorityText[data.priority]}</span>
                </div>
              </ListGroup.Item>
              <ListGroup.Item>
                <div className="row">
                  <span className="col-6">
                    <b>Opener:</b> {data.requested_by_object ? <span>{data.requested_by_object.first_name} {data.requested_by_object.last_name}</span> : "Unknown"}
                  </span>
                  <span className="col-6">
                    <b>Opened: </b><Moment format="ll">{data.open}</Moment>
                  </span>
                </div>
              </ListGroup.Item>
              <ListGroup.Item>
                <b>Presenting Complaints:</b> {data.complaints_text || "None"}
              </ListGroup.Item>
              <ListGroup.Item>
                <b>Concern:</b> {data.concern || "N/A"}
              </ListGroup.Item>
            </ListGroup>
          </Card.Body>
        </Card>
      </div>
      <div className="col-6 d-flex pl-0">
        <Card className="border rounded" style={{width:"100%"}}>
          <Card.Body>
            <Card.Title>
              <h4 className="h5 pb-0" style={{marginBottom:"-7px"}}>Patient: {data.animal_object.name||"Unknown"}
              <span className="float-right">
                <OverlayTrigger
                  key={"medical-record"}
                  placement="top"
                  overlay={
                    <Tooltip id={`tooltip-medical-record`}>
                      View patient medical record.
                    </Tooltip>
                  }
                >
                  <Link href={"/" + organization + "/" + incident + "/vet/medrecord/" + data.medical_record} style={{textDecoration:"none", color:"white"}}><FontAwesomeIcon icon={faFolderMedical} className="" inverse /></Link>
                </OverlayTrigger></span>
              </h4>
            </Card.Title>
            <hr/>
            <ListGroup variant="flush" style={{marginTop:"-13px", marginBottom:"-13px"}}>
              <ListGroup.Item>
                <div className="row" style={{textTransform:"capitalize"}}>
                  <span className="col-4"><b>ID:</b> <Link href={"/" + organization + "/" + incident + "/animals/" + data.animal_object.id_for_incident} className="text-link" style={{textDecoration:"none", color:"white"}}>A#{data.animal_object.id_for_incident}</Link></span>
                  <span className="col-4"><b>Species:</b> {data.animal_object.species_string}</span>
                  <span className="col-4"><b>Age:</b> {data.animal_object.age||"Unknown"}</span>
                </div>
              </ListGroup.Item>
              <ListGroup.Item>
                <div className="row" style={{textTransform:"capitalize"}}>
                  <span className="col-4"><b>Sex:</b> {data.animal_object.sex||"Unknown"}</span>
                  <span className="col-4"><b>Altered:</b> {data.animal_object.fixed||"Unknown"}</span>
                  <span className="col-4"><b>Weight:</b> {data.animal_object.weight||"Unknown"}</span>
                </div>
              </ListGroup.Item>
              <ListGroup.Item style={{textTransform:"capitalize"}}>
                <div className="row">
                  <span className="col-12"><b>Location:</b> {data.animal_object.shelter ? data.animal_object.shelter_object.name : "N/A"} {data.animal_object.room_name ? <span> - {data.animal_object.room_name}</span> : ""}</span>
                </div>
              </ListGroup.Item>
              <ListGroup.Item>
                  <span><b>Medical Notes:</b> {data.animal_object.medical_notes || "N/A"}</span>
              </ListGroup.Item>
            </ListGroup>
          </Card.Body>
        </Card>
      </div>
    </div>
    {/* <History action_history={data.action_history} /> */}
    <Modal show={showModal} onHide={() => setShowModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Confirm Veterinary Request Cancelation</Modal.Title>
      </Modal.Header>
      <Modal.Body>Are you sure you want to cancel this Veterinary Request?</Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={() => cancelVetRequest()}>
          Yes
        </Button>
        <Button variant="secondary" onClick={() => setShowModal(false)}>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
    </>
  );
};

export default VetRequestDetails;
