import React, { useContext, useEffect, useState } from 'react';
import axios from "axios";
import Moment from 'react-moment';
import moment from 'moment';
import { Link } from 'raviger';
import { Button, Card, Col, Collapse, ListGroup, Modal, OverlayTrigger, Row, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEdit,
  faPlusSquare,
  faTimes,
  faCheckSquare,
  faChevronCircleDown,
  faChevronCircleRight,
  faStethoscope
} from '@fortawesome/free-solid-svg-icons';
import {
  faDiamondExclamation,
  faPrescriptionBottlePill,
  faSquareExclamation,
  faSquareEllipsis
} from '@fortawesome/pro-solid-svg-icons';
import Header from '../components/Header';
import Scrollbar from '../components/Scrollbars';
import { SystemErrorContext } from '../components/SystemError';

function MedicalRecordDetails({ id, incident, organization }) {

  const { setShowSystemError } = useContext(SystemErrorContext);

  const priorityText = {urgent:'Urgent', when_available:'When Available'};

  const [data, setData] = useState({id: '', exams: [], patient:null, vet_requests:[], open: '', diagnosis: '', other_diagnosis:'', treatment_plans:[], animal_object: {id:'', name:'', species:'', category:'', sex:'', age:'', fixed:'', pcolor:'', scolor:'', medical_notes:'', shelter_object:{}, room_name:''}});
  const [examQuestions, setExamQuestions] = useState([]);
  const [showExam, setShowExam] = useState(true);
  const [activeVR, setActiveVR] = useState(null);
  const [activeExam, setActiveExam] = useState(null);

  // const [showModal, setShowModal] = useState(false);

  // Hook for initializing data.
  useEffect(() => {
    let unmounted = false;
    let source = axios.CancelToken.source();

    const fetchExamQuestions = async () => {
      // Fetch exam question data.
      await axios.get('/vet/api/examquestions/', {
        cancelToken: source.token,
      })
      .then(response => {
        if (!unmounted) {
          setExamQuestions(response.data);
        }
      })
      .catch(error => {
        setShowSystemError(true);
      });
    };

    const fetchMedRecordData = async () => {
      // Fetch MedicalRecord details data.
      await axios.get('/vet/api/medrecord/' + id + '/?incident=' + incident, {
          cancelToken: source.token,
      })
      .then(response => {
        if (!unmounted) {
          setData(response.data);
          setActiveVR(response.data.vet_requests[0].id);
          setActiveExam(response.data.exams[0].id);
          fetchExamQuestions();
        }
      })
      .catch(error => {
        setShowSystemError(true);
      });
    };
    fetchMedRecordData();
    // Cleanup.
    return () => {
      unmounted = true;
      source.cancel();
    };
  }, [id, incident]);

  return (
    <>
    <Header>
      Medical Record #{data.id}
    </Header>
    <hr/>
    <div className="row">
      <div className="col-6 d-flex">
        <Card className="border rounded" style={{width:"100%"}}>
          <Card.Body>
            <Card.Title>
              <h4 className="mb-0">Patient
                {data.vet_requests.filter(vet_request => vet_request.caution === true).length > 0 ? <OverlayTrigger
                  key={"caution"}
                  placement="top"
                  overlay={
                    <Tooltip id={`tooltip-caution`}>
                      Use caution when handling this animal.
                    </Tooltip>
                  }
                >
                  <FontAwesomeIcon icon={faDiamondExclamation} className="ml-2" inverse />
                </OverlayTrigger> : ""}
              </h4>
            </Card.Title>
            <hr/>
            <ListGroup variant="flush" style={{marginTop:"-13px", marginBottom:"-13px"}}>
              <ListGroup.Item>
                <div className="row" style={{textTransform:"capitalize"}}>
                  <span className="col-4"><b>ID:</b> <Link href={"/" + organization + "/" + incident + "/animals/" + data.animal_object.id} className="text-link" style={{textDecoration:"none", color:"white"}}>A#{data.animal_object.id}</Link></span>
                  <span className="col-4"><b>Name:</b> {data.animal_object.name||"Unknown"}</span>
                  <span className="col-4"><b>Species:</b> {data.animal_object.species_string}</span>
                </div>
              </ListGroup.Item>
              <ListGroup.Item>
                <div className="row" style={{textTransform:"capitalize"}}>
                  <span className="col-4"><b>Age:</b> {data.animal_object.age||"Unknown"}</span>
                  <span className="col-4"><b>Sex:</b> {data.animal_object.sex||"Unknown"}</span>
                  <span className="col-4"><b>Altered:</b> {data.animal_object.fixed||"Unknown"}</span>
                </div>
              </ListGroup.Item>
              <ListGroup.Item style={{textTransform:"capitalize"}}>
                <div className="row">
                  <span className="col-12"><b>Location:</b> {data.animal_object.shelter_object ? data.animal_object.shelter_object.name:"Unknown"}{data.animal_object.room_name ? <span> - {data.animal_object.room_name}</span> : ""}</span>
                </div>
              </ListGroup.Item>
              <ListGroup.Item>
                  <span><b>Medical Notes:</b> {data.animal_object.medical_notes || "N/A"}</span>
              </ListGroup.Item>
            </ListGroup>
          </Card.Body>
        </Card>
      </div>
      <div className="col-6 d-flex pl-0">
        <Card className="border rounded d-flex" style={{width:"100%"}}>
          <Card.Body>
            <Card.Title style={{marginTop:"-2px", marginBottom:"-16px", textAlign:"center", alignItems:"center"}}>
              <h4>
                <Scrollbar horizontal="true" autoHide style={{height:"45px", width:"485px"}} renderView={props => <div {...props} style={{...props.style, marginBottom:"-18px", marginRight:"0px", overflowX:"auto", overflowY: "hidden"}}/>} renderThumbVertical={props => <div {...props} style={{...props.style, display: 'none'}} />}>
                  <ListGroup horizontal>
                  {data.vet_requests.map((vet_request,i) => (
                    <ListGroup.Item key={vet_request.id} active={vet_request.id === activeVR} style={{textTransform:"capitalize", cursor:'pointer'}} onClick={() => setActiveVR(vet_request.id)}>
                      <div style={{marginTop:"-3px"}}>VR#{vet_request.id}</div>
                    </ListGroup.Item>
                  ))}
                  </ListGroup>
                </Scrollbar>
              </h4>
            </Card.Title>
            <hr/>
            {data.vet_requests.filter(vet_request => vet_request.id === activeVR).map(vet_request => (
            <ListGroup key={vet_request.id} variant="flush" style={{marginTop:"-13px", marginBottom:"-13px"}}>
              <ListGroup.Item>
                <div className="row">
                  <span className="col-5"><b>Status: </b>{vet_request.status}</span>
                  <span className="col-7"><b>Opened: </b><Moment format="lll">{vet_request.open}</Moment></span>
                </div>
              </ListGroup.Item>
              <ListGroup.Item>
                <div className="row">
                  <span className="col-5"><b>Priority: </b>{priorityText[vet_request.priority]}</span>
                  <span className="col-7"><b>Requested:</b> {vet_request.requested_by_object ? <span>{vet_request.requested_by_object.first_name} {vet_request.requested_by_object.last_name}</span> : "Unknown"}</span>
                </div>
              </ListGroup.Item>
              <ListGroup.Item>
                <b>Presenting Complaints:</b> {vet_request.complaints_text || "None"}
              </ListGroup.Item>
              <ListGroup.Item>
                <b>Concern:</b> {vet_request.concern || "N/A"}
              </ListGroup.Item>
            </ListGroup>
            ))}
          </Card.Body>
        </Card>
      </div>
    </div>
    {data.exams.length > 0 ? 
    <div className="row mt-3">
      <div className="col-12 d-flex">
        <Card className="border rounded" style={{width:"100%"}}>
          <Card.Body style={{marginBottom:showExam ? "-7px" : "-15px"}}>
            <Card.Title style={{marginTop:"-2px", marginBottom:"-16px"}}>
              <h4 className="mb-0">
                <Scrollbar horizontal="true" autoHide style={{height:"45px", width:"485px"}} renderView={props => <div {...props} style={{...props.style, marginBottom:"-18px", marginRight:"0px", overflowX:"auto", overflowY: "hidden"}}/>} renderThumbVertical={props => <div {...props} style={{...props.style, display: 'none'}} />}>
                  <ListGroup horizontal>
                    {data.vet_requests.filter(vet_request => vet_request.status === 'Open').length > 0 ? <ListGroup.Item className="small-exam-hover-div" style={{width:"50px"}}>
                      <OverlayTrigger
                        key={"start-exam"}
                        placement="top"
                        overlay={
                          <Tooltip id={`tooltip-start-exam`}>
                            Start a new exam
                          </Tooltip>
                        }
                      >
                        <Link href={"/" + organization + "/" + incident + "/vet/medrecord/" + data.id + "/workflow"}><FontAwesomeIcon icon={faStethoscope} className="exam-icon" style={{marginLeft:"-8px", marginBottom:"3px"}} inverse /></Link>
                      </OverlayTrigger>
                    </ListGroup.Item> : ""}
                    {data.exams.map((exam,i) => (
                    <ListGroup.Item key={exam.id} active={exam.id === activeExam} style={{textTransform:"capitalize", cursor:'pointer'}} onClick={() => setActiveExam(exam.id)}>
                      <div style={{marginTop:"-3px"}}>
                        Exam {moment(exam.open).format('l')}
                        {exam.id === activeExam ? <span>
                          <FontAwesomeIcon icon={faChevronCircleRight} hidden={showExam} onClick={() => {setShowExam(true)}} className="ml-1 fa-move-up" size="sm" style={{cursor:'pointer'}} inverse />
                          <FontAwesomeIcon icon={faChevronCircleDown} hidden={!showExam} onClick={() => {setShowExam(false)}} className="ml-1 fa-move-up" size="sm" style={{cursor:'pointer'}} inverse />
                        </span> : ""}
                      </div>
                    </ListGroup.Item>
                    ))}
                  </ListGroup>
                </Scrollbar>
                {/* Exam Results */}
                {/* <OverlayTrigger
                  key={"edit-exam"}
                  placement="bottom"
                  overlay={
                    <Tooltip id={`tooltip-start-exam`}>
                      Edit exam
                    </Tooltip>
                  }
                >
                  <Link href={"/" + organization + "/" + incident + "/vet/medrecord/" + id + "/exam/"}><FontAwesomeIcon icon={faEdit} className="ml-1" size="lg" style={{cursor:'pointer'}} inverse /></Link>
                </OverlayTrigger> */}
              </h4>
            </Card.Title>
            <hr className="mb-3" />
            {data.exams.filter(exam => exam.id === activeExam).map(exam => (
            <Collapse in={showExam} key={exam.id}>
              <ListGroup variant="flush" style={{marginTop:"-13px", marginBottom:"-13px"}}>
              <ListGroup.Item>
                <div className="row" style={{textTransform:"capitalize"}}>
                  <span className="col-3"><b>Performed:</b> {moment(exam.open).format('lll')}</span>
                  <span className="col-4"><b>Doctor Assigned:</b> {exam.assignee_object.first_name} {exam.assignee_object.last_name}</span>
                </div>
              </ListGroup.Item>
              <ListGroup.Item>
                <div className="row" style={{textTransform:"capitalize"}}>
                  <span className="col-3"><b>Weight:</b> {exam.weight_estimated ? "Estimated ":""}{exam.weight}{exam.weight_unit}</span>
                  <span className="col-3"><b>Temperature (F):</b> {exam.temperature}</span>
                  <span className="col-4"><b>Temperature Method:</b> {exam.temperature_method}</span>
                </div>
              </ListGroup.Item>
              <ListGroup.Item>
                <div className="row" style={{textTransform:"capitalize"}}>
                  <span className="col-3"><b>Pulse:</b> {exam.pulse}</span>
                  <span className="col-4"><b>Respiratory Rate:</b> {exam.respiratory_rate}</span>
                </div>
              </ListGroup.Item>
              {examQuestions.filter(question => question.categories.includes(data.animal_object.category)).map(question => (
                <ListGroup.Item key={question.id}>
                  <div className="row" style={{textTransform:"capitalize"}}>
                    <span className="col-3"><b>{question.name}:</b> {exam.answers[question.name.toLowerCase().replace(' ','_').replace('/','_')]}</span>
                    <span className="col-4"><b>Notes:</b> {exam.answers[question.name.toLowerCase().replace(' ','_').replace('/','_') + '_notes']}</span>
                  </div>
                </ListGroup.Item>
              ))}
              </ListGroup>
            </Collapse>
            ))}
          </Card.Body>
        </Card>
      </div>
    </div>
    :""}
    {data.exams.length > 0 ?
    <div className="row mt-3">
      <div className="col-12 d-flex">
        <Card className="mb-2 border rounded" style={{width:"100%"}}>
          <Card.Body style={{marginBottom:"-19px"}}>
            <Card.Title>
              <h4 className="mb-0">Treatments
                <OverlayTrigger
                  key={"add-treatment"}
                  placement="top"
                  overlay={
                    <Tooltip id={`tooltip-add-treatment`}>
                      Add a treatment for this patient
                    </Tooltip>
                  }
                >
                  <Link href={"/" + organization + "/" + incident + "/vet/medrecord/" + data.id + "/treatment/new"}><FontAwesomeIcon icon={faPlusSquare} className="ml-1" inverse /></Link>
                </OverlayTrigger>
              </h4>
            </Card.Title>
            <hr className="mb-3" />
            {data.treatment_plans.map(treatment_plan => (
              <Row key={treatment_plan.id} className="ml-0 mb-3">
                <Link href={"/" + organization + "/" + incident + "/vet/treatment/" + treatment_plan.id} className="treatment-link" style={{textDecoration:"none", color:"white"}}>
                  <Card className="border rounded treatment-hover-div" style={{height:"100px", width:"745px", whiteSpace:"nowrap", overflow:"hidden"}}>
                    <div className="row no-gutters hover-div treatment-hover-div" style={{height:"100px", marginRight:"-2px"}}>
                      <Row className="ml-0 mr-0 w-100" style={{flexWrap:"nowrap"}}>
                        <div className="border-right" style={{width:"100px"}}>
                          <FontAwesomeIcon icon={faPrescriptionBottlePill} size="6x" className="ml-1 treatment-icon" style={{marginTop:"5px", paddingRight:"10px"}} inverse />
                        </div>
                        <Col style={{marginLeft:"-5px", marginRight:"-25px"}} className="hover-div">
                          <div className="border treatment-hover-div" style={{paddingTop:"5px", paddingBottom:"7px", paddingLeft:"10px", marginLeft:"-11px", marginTop: "-1px", fontSize:"18px", width:"100%", backgroundColor:"rgb(158 153 153)"}}>
                            {treatment_plan.treatment_object.description}
                            <span className="float-right">
                            {treatment_plan.status === 'Complete' ?
                              <OverlayTrigger
                                key={"complete-treatment-request"}
                                placement="top"
                                overlay={
                                  <Tooltip id={`tooltip-complete-treatment-request`}>
                                    All treatment requests are completed.
                                  </Tooltip>
                                }
                              >
                                <FontAwesomeIcon icon={faCheckSquare} size="3x" className="ml-1 treatment-icon" style={{marginTop:"-13px", marginRight:"-3px"}} transform={'shrink-2'} inverse />
                              </OverlayTrigger>
                              : treatment_plan.status === 'Awaiting' ?
                              <OverlayTrigger
                                key={"awaiting-action-treatment-request"}
                                placement="top"
                                overlay={
                                  <Tooltip id={`tooltip-awaiting-action-treatment-request`}>
                                    At least one treatment request is awaiting action.
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
                                    At least one treatment request is scheduled for a future date/time.
                                  </Tooltip>
                                }
                              >
                                <FontAwesomeIcon icon={faSquareEllipsis} size="3x" className="ml-1 treatment-icon" style={{marginTop:"-13px", marginRight:"-3px"}} transform={'shrink-2'} inverse />
                              </OverlayTrigger>
                              }
                            </span>
                          </div>
                          <div style={{marginTop:"6px"}}>
                            <Row>
                              <Col xs={4}>
                                Start: <Moment format="lll">{treatment_plan.start}</Moment>
                              </Col>
                              <Col xs={4}>
                                End: <Moment format="lll">{treatment_plan.end}</Moment>
                              </Col>
                              {/* <Col>
                                Complete: {treatment_plan.treatment_requests.filter(request => request.actual_admin_time).length + "/" + treatment_plan.treatment_requests.filter(request => !request.not_administered).length}
                              </Col> */}
                              <Col>
                                Quantity: {treatment_plan.quantity}
                              </Col>
                            </Row>
                          </div>
                          <div>
                            <Row>
                              <Col xs={4}>
                                Frequency: every {treatment_plan.frequency} hour{treatment_plan.frequency === 1 ? '' : 's'}
                              </Col>
                              <Col xs={4}>
                                Duration: for {treatment_plan.days} day{treatment_plan.days === 1 ? '' : 's'}
                              </Col>
                              {/* <Col>
                                Unit: {treatment_plan.unit || '-'}
                              </Col> */}
                              <Col>
                                Route: {treatment_plan.route || '-'}
                              </Col>
                            </Row>
                          </div>
                        </Col>
                      </Row>
                    </div>
                  </Card>
                </Link>
              </Row>
            ))}
            {data.treatment_plans.length < 1 ? <p>No treatments have been created for this patient.</p> : ""}
          </Card.Body>
        </Card>
      </div>
    </div> : ""}
    {/* <History action_history={data.action_history} /> */}
    {/* <Modal show={showModal} onHide={() => setShowModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Confirm Veterinary Request Cancelation</Modal.Title>
      </Modal.Header>
      <Modal.Body>Are you sure you want to cancel this Veterinary Request and associated treatments?</Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={() => cancelVetRequest()}>
          Yes
        </Button>
        <Button variant="secondary" onClick={() => setShowModal(false)}>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal> */}
    </>
  );
};

export default MedicalRecordDetails;
