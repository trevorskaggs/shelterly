import React, { useContext, useEffect, useState } from 'react';
import axios from "axios";
import Moment from 'react-moment';
import { Link } from 'raviger';
import { Card, Col, ListGroup, OverlayTrigger, Row, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEdit,
  faUserMd,
  faCheckSquare,
} from '@fortawesome/free-solid-svg-icons';
import {
  faSquareExclamation,
  faSquareEllipsis
} from '@fortawesome/pro-solid-svg-icons';
import Header from '../components/Header';
import { SystemErrorContext } from '../components/SystemError';

function TreatmentPlanDetails({ id, incident }) {

  const { setShowSystemError } = useContext(SystemErrorContext);

  const [data, setData] = useState({id: '', treatment_object:{name:'', category:''}, animal_object:{name:'', id:''}, start: '', end:'', frequency: '', quantity: '', unit: '', route: '', treatment_requests:[]});

  // Hook for initializing data.
  useEffect(() => {
    let unmounted = false;
    let source = axios.CancelToken.source();

    const fetchTreatmentPlanData = async () => {
      // Fetch Room Details data.
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
      Treatment Plan Details
      <OverlayTrigger
        key={"edit-treatment-plan"}
        placement="bottom"
        overlay={
          <Tooltip id={`tooltip-edit-treatment-plan`}>
            Update treatment plan
          </Tooltip>
        }
      >
        <Link href={"/" + incident + "/vet/treatmentplan/edit/" + id}><FontAwesomeIcon icon={faEdit} className="ml-1" inverse /></Link>
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
                <div className="row">
                  <span className="col-6"><b>ID:</b> TP#{data.id}</span>
                  <span className="col-6"><b>Vet Request:</b>&nbsp;<Link href={"/" + incident + "/vet/vetrequest/" + data.vet_request} className="text-link" style={{textDecoration:"none", color:"white"}}>VR#{data.vet_request}</Link></span>
                </div>
              </ListGroup.Item>
              <ListGroup.Item>
                <b>Treatment:</b> {data.treatment_object.description}
              </ListGroup.Item>
              <ListGroup.Item>
                <div className="row">
                  <span className="col-6"><b>Start: </b><Moment format="lll">{data.start}</Moment></span>
                  <span className="col-6"><b>End: </b><Moment format="lll">{data.end}</Moment></span>
                </div>
              </ListGroup.Item>
              <ListGroup.Item>
                <div className="row">
                  <span className="col-6"><b>Quantity:</b> {data.quantity}</span>
                  <span className="col-6"><b>Frequency:</b> Every {data.frequency} hours</span>
                </div>
              </ListGroup.Item>
              <ListGroup.Item>
                <div className="row">
                  <span className="col-6"><b>Unit:</b> {data.unit}</span>
                  <span className="col-6"><b>Route:</b> {data.route}</span>
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
              <h4 className="mb-0">Patient</h4>
            </Card.Title>
            <hr/>
            <ListGroup variant="flush" style={{marginTop:"-13px", marginBottom:"-13px"}}>
              <ListGroup.Item>
                <div className="row" style={{textTransform:"capitalize"}}>
                  <span className="col-6"><b>ID:</b> <Link href={"/" + incident + "/animals/" + data.animal_object.id} className="text-link" style={{textDecoration:"none", color:"white"}}>A#{data.animal_object.id}</Link></span>
                  <span className="col-6"><b>Name:</b> {data.animal_object.name||"Unknown"}</span>
                </div>
              </ListGroup.Item>
              <ListGroup.Item>
                <div className="row" style={{textTransform:"capitalize"}}>
                  <span className="col-6"><b>Species:</b> {data.animal_object.species}</span>
                  <span className="col-6"><b>Sex:</b> {data.animal_object.sex||"Unknown"}</span>
                </div>
              </ListGroup.Item>
              <ListGroup.Item>
                <div className="row" style={{textTransform:"capitalize"}}>
                  <span className="col-6"><b>Age:</b> {data.animal_object.age||"Unknown"}</span>
                  <span className="col-6"><b>Size:</b> {data.animal_object.size||"Unknown"}</span>
                </div>
              </ListGroup.Item>
              <ListGroup.Item style={{textTransform:"capitalize"}}>
                <div className="row">
                  <span className="col-6"><b>Primary Color:</b> {data.animal_object.pcolor||"N/A"}</span>
                  <span className="col-6"><b>Secondary Color:</b> {data.animal_object.scolor||"N/A"}</span>
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
              {data.treatment_requests.map(treatment_request => (
              <Row key={treatment_request.id} className="mb-3">
                <Col xs={9}>
                  <Link href={"/" + incident + "/vet/treatmentrequest/edit/" + treatment_request.id} className="shelter-link w-100" style={{textDecoration:"none", color:"white"}}>
                    <Card className="border rounded shelter-hover-div" style={{height:"100px", whiteSpace:"nowrap", overflow:"hidden"}}>
                      <div className="row no-gutters hover-div" style={{height:"100px", textTransform:"capitalize", marginRight:"-2px"}}>
                        <Row className="ml-0 mr-0 w-100" style={{flexWrap:"nowrap"}}>
                          <div className="border-right" style={{width:"100px"}}>
                            <FontAwesomeIcon icon={faUserMd} size="6x" className="ml-2 shelter-icon" style={{marginTop:"5px", paddingLeft:"5px"}} inverse />
                          </div>
                          <Col style={{marginLeft:"-5px", marginRight:"-25px"}}>
                            <div className="border" style={{paddingTop:"5px", paddingBottom:"7px", paddingLeft:"10px", marginLeft:"-11px", marginTop: "-1px", fontSize:"18px", width:"100%", backgroundColor:"#615e5e"}}>
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
                                  <FontAwesomeIcon icon={faCheckSquare} size="3x" className="ml-1 shelter-icon" style={{marginTop:"-13px", marginRight:"-3px"}} transform={'shrink-2'} inverse />
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
                                  <FontAwesomeIcon icon={faSquareExclamation} size="3x" className="ml-1 shelter-icon" style={{marginTop:"-13px", marginRight:"-3px"}} transform={'shrink-2'} inverse />
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
                                  <FontAwesomeIcon icon={faSquareEllipsis} size="3x" className="ml-1 shelter-icon" style={{marginTop:"-13px", marginRight:"-3px"}} transform={'shrink-2'} inverse />
                                </OverlayTrigger>
                                }
                              </span>
                            </div>
                            <div style={{marginTop:"6px"}}>
                              Actual Admin Time: {treatment_request.actual_admin_time ? <Moment format="lll">{treatment_request.actual_admin_time}</Moment> : "Pending"}
                            </div>
                            <div>
                              Assignee: {treatment_request.assignee_object ? <span>{treatment_request.assignee_object.first_name} {treatment_request.assignee_object.last_name}</span> : "Unassigned"}
                            </div>
                          </Col>
                        </Row>
                      </div>
                    </Card>
                  </Link>
                </Col>
              </Row>
              ))}
            {data.treatment_requests.length < 1 ? <p>No treatment requests have been created for this treatment plan.</p> : ""}
          </Card.Body>
        </Card>
      </div>
    </div>
    {/* <History action_history={data.action_history} /> */}
    </>
  );
};

export default TreatmentPlanDetails;
