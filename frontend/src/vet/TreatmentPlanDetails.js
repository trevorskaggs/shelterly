import React, { useContext, useEffect, useState } from 'react';
import axios from "axios";
import Moment from 'react-moment';
import { Link, navigate } from 'raviger';
import { Button, Card, Col, ListGroup, Modal, OverlayTrigger, Row, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEdit,
  faUserMd,
  faCheckSquare,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import {
  faSquareExclamation,
  faSquareEllipsis,
  faFolderMedical,
  faSquareX
} from '@fortawesome/pro-solid-svg-icons';
import Header from '../components/Header';
import { SystemErrorContext } from '../components/SystemError';

function TreatmentPlanDetails({ id, incident, organization }) {

  const { setShowSystemError } = useContext(SystemErrorContext);

  const [data, setData] = useState({id: '', medical_record:null, animal_object:{name:'', id:''}, days:'', frequency: '', quantity: '', unit: '', route: '', treatment_requests:[]});

  const [showModal, setShowModal] = useState(false);
  const cancelTreatmentPlan = () => {
    axios.delete('/vet/api/treatmentplan/' + id + '/')
    .catch(error => {
      setShowSystemError(true);
    });
    navigate("/" + organization + "/" + incident + "/vet/medrecord/" + data.medical_record)
  }

  // Hook for initializing data.
  useEffect(() => {
    let unmounted = false;
    let source = axios.CancelToken.source();

    const fetchTreatmentPlanData = async () => {
      // Fetch TreatmentPlan data.
      await axios.get('/vet/api/treatmentplan/' + id + '/?incident=' + incident, {
          cancelToken: source.token,
      })
      .then(response => {
        if (!unmounted) {
          setData(response.data);
        }
      })
      .catch(error => {
        setShowSystemError(true);
      });
    };
    fetchTreatmentPlanData();
    // Cleanup.
    return () => {
      unmounted = true;
      source.cancel();
    };
  }, [id, incident]);

  return (
    <>
    <Header>
      {data.treatment_requests.length? data.treatment_requests[0]['treatment_object'].description : ''}
      {/* <OverlayTrigger
        key={"edit-treatment"}
        placement="bottom"
        overlay={
          <Tooltip id={`tooltip-edit-treatment`}>
            Update treatment
          </Tooltip>
        }
      >
        <Link href={"/" + organization + "/" + incident + "/vet/treatment/edit/" + id}><FontAwesomeIcon icon={faEdit} className="ml-2" inverse /></Link>
      </OverlayTrigger> */}
      <OverlayTrigger
        key={"cancel-treatment"}
        placement="bottom"
        overlay={
          <Tooltip id={`tooltip-cancel-treatment`}>
            Cancel treatment
          </Tooltip>
        }
      >
        <FontAwesomeIcon icon={faTimes} className="ml-2" size="lg" style={{cursor:'pointer'}} inverse onClick={() => {setShowModal(true)}}/>
      </OverlayTrigger>
    </Header>
    <hr/>
    <div className="row">
      <div className="col-6 d-flex">
        <Card className="border rounded d-flex" style={{width:"100%"}}>
          <Card.Body>
            <Card.Title>
              <h4>Information</h4>
            </Card.Title>
            <hr/>
            <ListGroup variant="flush" style={{marginTop:"-13px", marginBottom:"-13px"}}>
              <ListGroup.Item>
                <Row>
                  <Col>
                    <b>Status:</b> {data.treatment_requests.filter(tr => ['Pending', 'Scheduled'].includes(tr.status)).length > 0 ? 'Open' : 'Completed'}
                  </Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <div className="row">
                  <span className="col-4"><b>Quantity:</b> {data.quantity}</span>
                  <span className="col-4"><b>Unit:</b> {data.unit || '-'}</span>
                  <span className="col-4"><b>Route:</b> {data.route || '-'}</span>
                </div>
              </ListGroup.Item>
              <ListGroup.Item>
                <div className="row">
                  <span className="col-6"><b>Frequency:</b> every {data.frequency} hours</span>
                  <span className="col-6"><b>Duration:</b> for {data.days} days</span>
                </div>
              </ListGroup.Item>
            </ListGroup>
          </Card.Body>
        </Card>
      </div>
      <div className="col-6 d-flex pl-0">
        <Card className="border rounded" style={{width:"100%"}}>
          <Card.Body>
            <Card.Title>
              <h4 className="h5 pb-0" style={{marginBottom:"-3px"}}>Patient: {data.animal_object.name||"Unknown"}
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
    <div className="row mt-3">
      <div className="col-12 d-flex">
        <Card className="mb-2 border rounded" style={{width:"100%"}}>
          <Card.Body style={{marginBottom:"-19px"}}>
            <Card.Title>
              <h4 className="mb-0">Treatment Requests</h4>
            </Card.Title>
            <hr className="mb-3" />
              {data.treatment_requests.sort((a, b) => new Date(a.suggested_admin_time) - new Date(b.suggested_admin_time)).map(treatment_request => (
              <Row key={treatment_request.id} className="ml-0 mb-3">
                <Link href={"/" + organization + "/" + incident + "/vet/treatmentrequest/edit/" + treatment_request.id} className="treatment-link" style={{textDecoration:"none", color:"white"}}>
                  <Card className="border rounded treatment-hover-div" style={{height:"100px", width:"560px", whiteSpace:"nowrap", overflow:"hidden"}}>
                    <div className="row no-gutters hover-div" style={{height:"100px", textTransform:"capitalize", marginRight:"-2px"}}>
                      <Row className="ml-0 mr-0 w-100" style={{flexWrap:"nowrap"}}>
                        <div className="border-right" style={{width:"100px"}}>
                          <FontAwesomeIcon icon={faUserMd} size="6x" className="ml-2 treatment-icon" style={{marginTop:"5px", paddingLeft:"5px"}} inverse />
                        </div>
                        <Col style={{marginLeft:"-5px", marginRight:"-25px"}}>
                          <div className="border" style={{paddingTop:"5px", paddingBottom:"7px", paddingLeft:"10px", marginLeft:"-11px", marginTop: "-1px", fontSize:"18px", width:"100%", backgroundColor:"rgb(158 153 153)"}}>
                            Suggested Admin Time: <Moment format="lll">{treatment_request.suggested_admin_time}</Moment>
                            <span className="float-right">
                              {treatment_request.actual_admin_time ?
                              <OverlayTrigger
                                key={"complete-treatment-request"}
                                placement="top"
                                overlay={
                                  <Tooltip id={`tooltip-complete-treatment-request`}>
                                    Treatment request is completed.
                                  </Tooltip>
                                }
                              >
                                <FontAwesomeIcon icon={faCheckSquare} size="3x" className="ml-1 treatment-icon" style={{marginTop:"-13px", marginRight:"-3px"}} transform={'shrink-2'} inverse />
                              </OverlayTrigger>
                              : treatment_request.not_administered ?
                              <OverlayTrigger
                                key={"not-administered-treatment-request"}
                                placement="top"
                                overlay={
                                  <Tooltip id={`tooltip-not-administered-treatment-request`}>
                                    Treatment request was not administered.
                                  </Tooltip>
                                }
                              >
                                <FontAwesomeIcon icon={faSquareX} size="3x" className="ml-1 treatment-icon" style={{marginTop:"-13px", marginRight:"-3px"}} transform={'shrink-2'} inverse />
                              </OverlayTrigger>
                              : new Date(treatment_request.suggested_admin_time) <= new Date() ?
                              <OverlayTrigger
                                key={"awaiting-action-treatment-request"}
                                placement="top"
                                overlay={
                                  <Tooltip id={`tooltip-awaiting-action-treatment-request`}>
                                    Treatment request is awaiting action.
                                  </Tooltip>
                                }
                              >
                                <FontAwesomeIcon icon={faSquareExclamation} size="3x" className="ml-1 treatment-icon" style={{marginTop:"-13px", marginRight:"-3px"}} transform={'shrink-2'} inverse />
                              </OverlayTrigger>
                              :
                              <OverlayTrigger
                                key={"scheduled-treatment-request"}
                                placement="top"
                                overlay={
                                  <Tooltip id={`tooltip-scheduled-treatment-request`}>
                                    Treatment request is scheduled for a future date/time.
                                  </Tooltip>
                                }
                              >
                                <FontAwesomeIcon icon={faSquareEllipsis} size="3x" className="ml-1 treatment-icon" style={{marginTop:"-13px", marginRight:"-3px"}} transform={'shrink-2'} inverse />
                              </OverlayTrigger>
                              }
                            </span>
                          </div>
                          {!treatment_request.not_administered ? <span>
                          <div style={{marginTop:"6px"}}>
                            Actual Admin Time: {treatment_request.actual_admin_time ? <Moment format="lll">{treatment_request.actual_admin_time}</Moment> : "Pending"}
                          </div>
                          <div>
                            Administrator: {treatment_request.assignee_object ? <span>{treatment_request.assignee_object.first_name} {treatment_request.assignee_object.last_name}</span> : "-"}
                          </div>
                          </span>
                          :
                          <div style={{marginTop:"6px"}}>
                            Not Administered
                          </div>
                          }
                        </Col>
                      </Row>
                    </div>
                  </Card>
                </Link>
              </Row>
              ))}
            {data.treatment_requests.length < 1 ? <p>No treatment requests have been created for this treatment plan.</p> : ""}
          </Card.Body>
        </Card>
      </div>
    </div>
    {/* <History action_history={data.action_history} /> */}
    <Modal show={showModal} onHide={() => setShowModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Confirm Treatment Cancelation</Modal.Title>
      </Modal.Header>
      <Modal.Body>Are you sure you want to cancel this Treatment and associated treatment requests?</Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={() => cancelTreatmentPlan()}>
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

export default TreatmentPlanDetails;
