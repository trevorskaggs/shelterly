import React, { useContext, useEffect, useState } from 'react';
import axios from "axios";
import moment from 'moment';
import { Link, useQueryParams } from 'raviger';
import { Button, Card, Col, Collapse, ListGroup, ListGroupItem, Modal, OverlayTrigger, Row, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEdit,
  faPlusSquare,
  faTimes,
  faCheckSquare,
  faChevronCircleDown,
  faChevronCircleRight,
  faStethoscope,
  faVial,
  faSyringe,
  faSoap,
  faEye,
  faSquare,
  faWater,
  faHeart,
  faTable,
  faWifi,
} from '@fortawesome/free-solid-svg-icons';
import {
  faDiamondExclamation,
  faEyeDropper,
  faPrescriptionBottlePill,
  faSquareExclamation,
  faSquareEllipsis,
  faSquareX,
  faScalpelLineDashed,
  faFlashlight,
  faPeriod,
  faMobileScreenButton
} from '@fortawesome/pro-solid-svg-icons';
import {
  faRectangleVertical,
} from '@fortawesome/sharp-solid-svg-icons';
import { faBandage, faRing, faTankWater } from '@fortawesome/pro-regular-svg-icons';
import Header from '../components/Header';
import Scrollbar from '../components/Scrollbars';
import { SystemErrorContext } from '../components/SystemError';
import { AuthContext } from "../accounts/AccountsReducer";
import TreatmentCard from "./components/TreatmentCard";
import DiagnosticCard from './components/DiagnosticCard';
import ProcedureCard from './components/ProcedureCard';

function MedicalRecordDetails({ id, incident, organization }) {

  const { setShowSystemError } = useContext(SystemErrorContext);
  const { dispatch, state } = useContext(AuthContext);

  // Identify any query param data.
  const [queryParams] = useQueryParams();
  const {
    tab = 'pending',
  } = queryParams;

  const priorityText = {urgent:'Urgent', when_available:'When Available'};

  const [data, setData] = useState({id:'', exams:[], diagnostic_objects:[], procedure_objects:[], patient:null, vet_requests:[], open: '', diagnosis: '', other_diagnosis:'', treatment_requests:[], animal_object: {id:'', name:'', species:'', category:'', sex:'', age:'', fixed:'', pcolor:'', scolor:'', medical_notes:'', shelter_object:{}, room_name:''}});
  const [showExam, setShowExam] = useState(false);
  const [activeVR, setActiveVR] = useState(null);
  const [activeExam, setActiveExam] = useState(null);
  const [activeOrders, setActiveOrders] = useState(tab);

  // Hook for initializing data.
  useEffect(() => {
    let unmounted = false;
    let source = axios.CancelToken.source();

    const fetchMedRecordData = async () => {
      // Fetch MedicalRecord details data.
      await axios.get('/vet/api/medrecord/' + id + '/?incident=' + incident, {
          cancelToken: source.token,
      })
      .then(response => {
        if (!unmounted) {
          setData(response.data);
          setActiveVR(response.data.vet_requests.filter(vr => vr.status === 'Open').length > 0 ? response.data.vet_requests.filter(vr => vr.status === 'Open')[0].id : null);
          setShowExam(response.data.vet_requests.filter(vr => vr.status === 'Open').length > 0 ? true : false);
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
        <Card className="border rounded d-flex" style={{width:"100%"}}>
          <Card.Body>
            <Card.Title>
              <h4 className="mb-0">
                <Row className="ml-0 pr-0">
                  Patient: {data.animal_object.name||"Unknown"}
                </Row>
              </h4>
            </Card.Title>
            <hr/>
            <ListGroup variant="flush" style={{marginTop:"-13px", marginBottom:"-13px"}}>
              <ListGroup.Item>
                <div className="row" style={{textTransform:"capitalize"}}>
                  <span className="col-4"><b>ID:</b> <Link href={"/" + organization + "/" + incident + "/animals/" + data.animal_object.id} className="text-link" style={{textDecoration:"none", color:"white"}}>A#{data.animal_object.id}</Link></span>
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
                  <span className="col-6"><b>Location:</b> {data.animal_object.shelter_object ? <Link href={"/" + organization + "/" + incident + "/shelter/" + data.animal_object.shelter_object.id} className="text-link" style={{textDecoration:"none", color:"white"}}>{data.animal_object.shelter_object.name}</Link>:"Unknown"}{data.animal_object.room_name ? <span> - {data.animal_object.room_name}</span> : ""}</span>
                </div>
                <div className="row">
                  {/* <span className="col-6"><b>Owner:</b> {data.animal_object.owner_object ? <Link href={"/" + organization + "/" + incident + "/shelter/" + data.animal_object.shelter_object.id} className="text-link" style={{textDecoration:"none", color:"white"}}>{data.animal_object.shelter_object.name}</Link>:"Unknown"}{data.animal_object.room_name ? <span> - {data.animal_object.room_name}</span> : ""}</span> */}
                </div>
              </ListGroup.Item>
              <ListGroup.Item style={{marginBottom:"-6px"}}>
                  <span><b>Medical Notes:</b> {data.animal_object.medical_notes || "N/A"}</span>
              </ListGroup.Item>
            </ListGroup>
          </Card.Body>
        </Card>
      </div>
      {data.exams.length > 0 ?
      <div className="col-6 d-flex pl-0">
        <Card className="border rounded d-flex" style={{width:"100%"}}>
          <Card.Body>
            <Card.Title>
              <h4 className="mb-0">
                <Row className="ml-0 pr-0">
                  Diagnosis/Problem List
                  <OverlayTrigger
                    key={"add-diagnosis"}
                    placement="top"
                    overlay={
                      <Tooltip id={`tooltip-add-diagnosis`}>
                        Add a diagnosis for this patient
                      </Tooltip>
                    }
                  >
                    <Link href={"/" + organization + "/" + incident + "/vet/medrecord/" + data.id + "/diagnosis/new"}><FontAwesomeIcon icon={faPlusSquare} className="ml-1" inverse /></Link>
                  </OverlayTrigger>
                </Row>
              </h4>
            </Card.Title>
            <hr/>
            <ListGroup variant="flush" style={{marginTop:"-13px", marginBottom:"-13px"}}>
              <ListGroup.Item>
                <div className="row">
                  <span><b>Diagnoses:</b> {data.diagnosis_text||"N/A"}</span>
                </div>
              </ListGroup.Item>
              <ListGroup.Item>
                <div className="row">
                  <span><b>Notes:</b> {data.diagnosis_notes||"N/A"}</span>
                </div>
              </ListGroup.Item>
            </ListGroup>
          </Card.Body>
        </Card>
      </div> : ""}
      {/* <div className="col-6 d-flex pl-0">
        <Card className="border rounded d-flex" style={{width:"100%"}}>
          <Card.Body>
            <Card.Title style={{marginTop:"-2px", marginBottom:"-16px"}}>
              <h4 style={{marginRight:"-1px"}}>
                <Scrollbar horizontal="true" no_shadow="true" autoHide style={{height:"45px", marginLeft:"-1px", shadowheight:"45px", width:"100%"}} renderView={props => <div {...props} style={{...props.style, marginBottom:"-18px", marginRight:"0px", overflowX:"auto", overflowY: "hidden"}}/>} renderThumbVertical={props => <div {...props} style={{...props.style, display: 'none'}} />}>
                  <ListGroup horizontal>
                    <ListGroup.Item style={{backgroundColor:"rgb(158, 153, 153)"}}>
                      <Row style={{width:"105px"}}>
                        <div style={{marginTop:"-3px", marginLeft:"4px"}}>Open VRs</div>
                      </Row>
                    </ListGroup.Item>
                    {data.vet_requests.filter(vr => vr.status === 'Open').map(vet_request => (
                      <ListGroup.Item key={vet_request.id} active={vet_request.id === activeOpenVR} style={{textTransform:"capitalize", cursor:'pointer'}} onClick={() => setActiveVR(vet_request.id)}>
                        <Row style={{marginTop:"-3px", width:vet_request.caution ? "92px" : "68px"}}>
                          <div className="text-center" style={{marginLeft:"4px"}}>
                            {moment(vet_request.open).format('MM/DD')}
                            {vet_request.caution ?
                            <OverlayTrigger
                              key={"caution"}
                              placement="top"
                              overlay={
                                <Tooltip id={`tooltip-caution`}>
                                  Use caution when handling this animal.
                                </Tooltip>
                              }
                            >
                              <FontAwesomeIcon icon={faDiamondExclamation} className="ml-1 fa-move-up" size="sm" style={{marginTop:"-1px"}} transform={'up-1'} inverse />
                            </OverlayTrigger> : ""}
                          </div>
                        </Row>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </Scrollbar>
              </h4>
            </Card.Title>
            <hr/>
            {data.vet_requests.filter(vet_request => vet_request.id === activeOpenVR).map(vet_request => (
            <ListGroup key={vet_request.id} variant="flush" style={{marginTop:"-13px", marginBottom:"-13px"}}>
              <ListGroup.Item>
                <div className="row">
                  <span className="col-3"><b>ID: </b><Link href={"/" + organization + "/" + incident + "/vet/vetrequest/" + vet_request.id} className="text-link" style={{textDecoration:"none", color:"white"}}>VR#{vet_request.id}</Link></span>
                  {state.user.vet_perms ?
                  <span className="ml-auto mr-3">
                    <Link href={"/" + organization + "/" + incident + "/vet/medrecord/" + data.id + "/workflow?vetrequest_id=" + vet_request.id} className="exam-link" style={{textDecoration:"none", color:"white"}}>
                      <Card className="border rounded exam-hover-div" style={{height:"27px", minWidth:"202px", maxWidth:"202px", marginTop:"-2px", marginBottom:"-15px", whiteSpace:"nowrap", overflow:"hidden"}}>
                        <div className="row no-gutters hover-div" style={{textTransform:"capitalize", marginRight:"-2px"}}>
                          <Col style={{maxWidth:"36px"}}>
                            <div className="border-right" style={{width:"27px", minWidth:"27px"}}>
                              <FontAwesomeIcon icon={faStethoscope} className="ml-1 exam-icon" size="lg" inverse />
                            </div>
                          </Col>
                          <Col style={{fontSize:"17px"}}>
                            <div style={{marginTop:"0px", marginLeft:"-5px"}}>Start Veterinary Exam</div>
                          </Col>
                        </div>
                      </Card>
                    </Link>
                  </span>
                  : ""}
                </div>
              </ListGroup.Item>
              <ListGroup.Item>
                <div className="row">
                  <span className="col-5"><b>Priority: </b>{priorityText[vet_request.priority]}</span>
                  <span className="col-7"><b>Opener:</b> {vet_request.requested_by_object ? <span>{vet_request.requested_by_object.first_name} {vet_request.requested_by_object.last_name}</span> : "Unknown"}</span>
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
      </div> */}
    </div>
    {data.exams.length > 0 ? 
    <div className="row mt-3">
      <div className="col-12 d-flex">
        <Card className="border rounded" style={{width:"100%"}}>
          <Card.Body style={{marginBottom:showExam ? "-7px" : "-15px"}}>
            <Card.Title style={{marginTop:"-2px", marginBottom:"-16px"}}>
              <h4 className="mb-0" style={{marginRight:"-1px"}}>
                <Scrollbar horizontal="true" autoHide no_shadow="true" style={{height:"45px", marginLeft:"-1px", shadowheight:"45px", width:"100%"}} renderView={props => <div {...props} style={{...props.style, marginBottom:"-18px", marginRight:"0px", overflowX:"auto", overflowY: "hidden"}}/>} renderThumbVertical={props => <div {...props} style={{...props.style, display: 'none'}} />}>
                  <ListGroup horizontal>
                    <ListGroup.Item className="border rounded" style={{backgroundColor:"rgb(158, 153, 153)", marginRight:"1px"}}>
                      <Row style={{width:"112px"}}>
                        <div style={{marginTop:"-3px", marginLeft:"4px"}}>Open VRs:</div>
                      </Row>
                    </ListGroup.Item>
                    {data.vet_requests.filter(vr => vr.status === 'Open').map(vet_request => (
                      <ListGroup.Item key={vet_request.id} active={vet_request.id === activeVR} style={{textTransform:"capitalize", cursor:'pointer', borderTopLeftRadius:".25rem", borderTopRightRadius:".25rem"}} onClick={() => {setActiveVR(vet_request.id);setActiveExam(null);vet_request.id === activeVR ? setShowExam(!showExam) : setShowExam(true);}}>
                        <Row style={{marginTop:"-3px", width:"68px"}}>
                          <div className="text-center" style={{marginLeft:"4px"}}>
                            {moment(vet_request.open).format('MM/DD')}
                            {/* {vet_request.caution ?
                            <OverlayTrigger
                              key={"caution"}
                              placement="top"
                              overlay={
                                <Tooltip id={`tooltip-caution`}>
                                  Use caution when handling this animal.
                                </Tooltip>
                              }
                            >
                              <FontAwesomeIcon icon={faDiamondExclamation} className="ml-1 fa-move-up" size="sm" style={{marginTop:"-1px"}} transform={'up-1'} inverse />
                            </OverlayTrigger> : ""} */}
                          </div>
                        </Row>
                      </ListGroup.Item>
                    ))}
                    <ListGroup.Item className="border rounded" style={{backgroundColor:"rgb(158, 153, 153)"}}>
                      <Row style={{width:"77px"}}>
                        <div style={{marginTop:"-3px", marginLeft:"4px"}}>Exams:</div>
                        {/* <FontAwesomeIcon icon={faChevronCircleRight} hidden={showExam} onClick={() => {setShowExam(true)}} className="ml-1" size="sm" style={{cursor:'pointer'}} inverse />
                        <FontAwesomeIcon icon={faChevronCircleDown} hidden={!showExam} onClick={() => {setShowExam(false)}} className="ml-1" size="sm" style={{cursor:'pointer'}} inverse /> */}
                      </Row>
                    </ListGroup.Item>
                    {data.exams.map((exam,i) => (
                    <ListGroup horizontal key={exam.id}>
                      <ListGroup.Item key={exam.id} active={exam.id === activeExam} style={{textTransform:"capitalize", cursor:'pointer', paddingLeft:"5px", paddingRight:"5px"}} onClick={() => {setActiveExam(exam.id);setActiveVR(null);exam.id === activeExam ? setShowExam(!showExam) : setShowExam(true);}}>
                        <div className="text-center" style={{marginTop:"-3px", width:"70px"}}>
                          {moment(exam.open).format('MM/DD')}
                        </div>
                      </ListGroup.Item>
                      {data.vet_requests.filter(vr => vr.id === exam.vet_request).map(vet_request => (
                      <ListGroup.Item key={vet_request.id} active={vet_request.id === activeVR} style={{textTransform:"capitalize", cursor:'pointer'}} onClick={() => {setActiveVR(vet_request.id);setActiveExam(null);vet_request.id === activeVR ? setShowExam(!showExam) : setShowExam(true);}}>
                        <Row style={{marginTop:"-3px", width:"38px"}}>
                          <div className="text-center" style={{marginLeft:"4px"}}>
                            VR
                          </div>
                        </Row>
                      </ListGroup.Item>
                      ))}
                    </ListGroup>
                    ))}
                  </ListGroup>
                </Scrollbar>
              </h4>
            </Card.Title>
            <hr className="mb-3" />
            {data.exams.filter(exam => exam.id === activeExam).map(exam => (
            <Collapse in={showExam} key={exam.id}>
              <ListGroup variant="flush" style={{marginTop:"-13px", marginBottom:"-13px"}}>
              <ListGroup.Item>
                <div className="row" style={{textTransform:"capitalize"}}>
                  <span className="col-3"><b>ID:</b> <Link href={"/" + organization + "/" + incident + "/vet/exam/" + exam.id} className="text-link" style={{textDecoration:"none", color:"white"}}>E#{exam.id}</Link></span>
                  <span className="col-4"><b>Performed:</b> {moment(exam.open).format('lll')}</span>
                  <span className="col-4"><b>Examiner:</b> {exam.assignee_object ? <span>{exam.assignee_object.first_name + ' ' + exam.assignee_object.last_name}</span> : "Unknown"}</span>
                </div>
              </ListGroup.Item>
              <ListGroup.Item>
                <div className="row" style={{textTransform:"capitalize"}}>
                  <span className="col-3"><b>Weight:</b> {exam.weight_estimated ? "~":""}{exam.weight}{exam.weight_unit}</span>
                  <span className="col-4"><b>Temperature (F):</b> {exam.temperature}</span>
                  <span className="col-4"><b>Temperature Method:</b> {exam.temperature_method}</span>
                </div>
              </ListGroup.Item>
              <ListGroup.Item>
                <div className="row" style={{textTransform:"capitalize"}}>
                  <span className="col-3"><b>Pulse:</b> {exam.pulse}</span>
                  <span className="col-4"><b>Respiratory Rate:</b> {exam.respiratory_rate}</span>
                </div>
              </ListGroup.Item>
              {exam.answers.map(answer => (
                <ListGroup.Item key={answer.id}>
                  <div className="row" style={{textTransform:"capitalize"}}>
                    <span className="col-3"><b>{answer.name}:</b> {answer.answer}</span>
                    {answer.answer_notes ? <span className="col-4"><b>Notes:</b> {answer.answer_notes}</span> : ""}
                  </div>
                </ListGroup.Item>
              ))}
              <ListGroup.Item>
                <div className="row" style={{textTransform:"capitalize"}}>
                  <span className="col-12"><b>Medical Plan:</b> {exam.medical_plan || "N/A"}</span>
                </div>
              </ListGroup.Item>
              </ListGroup>
            </Collapse>
            ))}
            {data.vet_requests.filter(vr => vr.id === activeVR).map(vet_request => (
            <Collapse in={showExam} key={vet_request.id}>
              <ListGroup variant="flush" style={{marginTop:"-13px", marginBottom:"-13px"}}>
              {vet_request.caution ? <div className="alert text-center w-100" style={{fontSize:"16px", marginTop:"-3px", marginRight:"15px", marginBottom:"0px", borderRadius:".25rem", backgroundColor:"#cb3636"}}>Use caution when interacting with this animal.</div> : ""}
                <ListGroup.Item>
                  <div className="row" style={{textTransform:"capitalize"}}>
                    <span className="col-3"><b>ID:</b> <Link href={"/" + organization + "/" + incident + "/vet/vetrequest/" + vet_request.id} className="text-link" style={{textDecoration:"none", color:"white"}}>VR#{vet_request.id}</Link></span>
                    <span className="col-4"><b>Opened:</b> {moment(vet_request.open).format('lll')}</span>
                    <span className="col-5"><b>Opener:</b> {vet_request.requested_by_object ? <span>{vet_request.requested_by_object.first_name + ' ' + vet_request.requested_by_object.last_name}</span> : "Unknown"}</span>
                  </div>
                </ListGroup.Item>
                <ListGroup.Item>
                  <div className="row">
                    <span className="col-3"><b>Priority:</b> {priorityText[vet_request.priority]}</span>
                    <span className="col-9"><b>Complaints:</b> {vet_request.complaints_text}</span>
                  </div>
                </ListGroup.Item>
                <ListGroup.Item>
                  <div className="row" style={{marginBottom:"-10px"}}>
                    <span className="col-3">
                      <span className="ml-auto mr-3">
                        <Link href={"/" + organization + "/" + incident + "/vet/medrecord/" + data.id + "/workflow?vetrequest_id=" + vet_request.id} className="exam-link" style={{textDecoration:"none", color:"white"}}>
                          <Card className="border rounded exam-hover-div" style={{height:"27px", minWidth:"202px", maxWidth:"202px", marginTop:"-2px", marginBottom:"-15px", whiteSpace:"nowrap", overflow:"hidden"}}>
                            <div className="row no-gutters hover-div" style={{textTransform:"capitalize", marginRight:"-2px"}}>
                              <Col style={{maxWidth:"36px"}}>
                                <div className="border-right" style={{width:"27px", minWidth:"27px"}}>
                                  <FontAwesomeIcon icon={faStethoscope} className="ml-1 exam-icon" size="lg" inverse />
                                </div>
                              </Col>
                              <Col style={{fontSize:"17px"}}>
                                <div style={{marginTop:"0px", marginLeft:"-5px"}}>Start Veterinary Exam</div>
                              </Col>
                            </div>
                          </Card>
                        </Link>
                      </span>
                    </span>
                    <span className="col-9"><b>Concern:</b> {vet_request.concern || "None"}</span>
                  </div>
                </ListGroup.Item>
              </ListGroup>
            </Collapse>
            ))}
          </Card.Body>
        </Card>
      </div>
    </div>
    :""}
    {data.exams.length > 0 ?
    <div className="row mt-3 mb-2">
      <div className="col-12 d-flex">
        <Card className="mb-2 border rounded" style={{width:"100%", height:"685px"}}>
          <Card.Body style={{marginBottom:""}}>
            <Card.Title style={{marginTop:"-2px", marginBottom:"20px"}}>
              <h4 className="mb-0">
                <ListGroup horizontal style={{marginBottom:"-20px"}}>
                  <ListGroup.Item active={"pending" === activeOrders} className="text-center" style={{textTransform:"capitalize", cursor:'pointer', paddingLeft:"5px", paddingRight:"5px"}} onClick={() => setActiveOrders("pending")}>
                    <div style={{marginTop:"-3px", marginLeft:"-1px", paddingLeft:"10px", paddingRight:"10px"}}>
                      All Pending ({data.treatment_requests.filter(tr => tr.status === 'Pending').length + data.diagnostic_objects.filter(diagnostic => diagnostic.status === 'Pending').length + data.procedure_objects.filter(procedure => procedure.status === 'Pending').length})
                    </div>
                  </ListGroup.Item>
                  <ListGroup.Item active={"treatments" === activeOrders} className="text-center" style={{textTransform:"capitalize", cursor:'pointer', paddingLeft:"5px", paddingRight:"5px"}} onClick={() => setActiveOrders("treatments")}>
                    <div style={{marginTop:"-3px", marginLeft:"-1px", paddingLeft:"10px", paddingRight:"10px"}}>
                      Treatments ({data.treatment_requests.length})
                      {activeOrders === 'treatments' ? <OverlayTrigger
                        key={"add-treatment"}
                        placement="top"
                        overlay={
                          <Tooltip id={`tooltip-add-treatment`}>
                            Add a treatment for this patient
                          </Tooltip>
                        }
                      >
                        <Link href={"/" + organization + "/" + incident + "/vet/medrecord/" + data.id + "/treatment/new"}><FontAwesomeIcon icon={faPlusSquare} className="ml-1" inverse /></Link>
                      </OverlayTrigger> : ""}
                    </div>
                  </ListGroup.Item>
                  <ListGroup.Item active={"diagnostics" === activeOrders} className="text-center" style={{textTransform:"capitalize", cursor:'pointer', paddingLeft:"5px", paddingRight:"5px"}} onClick={() => setActiveOrders("diagnostics")}>
                    <div style={{marginTop:"-3px", marginLeft:"-1px", paddingLeft:"10px", paddingRight:"10px"}}>
                      Diagnostics ({data.diagnostic_objects.length})
                      {activeOrders === 'diagnostics' ? <OverlayTrigger
                        key={"order-diagnostic"}
                        placement="top"
                        overlay={
                          <Tooltip id={`tooltip-order-diagnostic`}>
                            Order diagnostics for this patient
                          </Tooltip>
                        }
                      >
                        <Link href={"/" + organization + "/" + incident + "/vet/medrecord/" + data.id + "/diagnostics"}><FontAwesomeIcon icon={faPlusSquare} className="ml-1" inverse /></Link>
                      </OverlayTrigger> : ""}
                    </div>
                  </ListGroup.Item>
                  <ListGroup.Item active={"procedures" === activeOrders} className="text-center" style={{textTransform:"capitalize", cursor:'pointer', paddingLeft:"5px", paddingRight:"5px"}} onClick={() => setActiveOrders("procedures")}>
                    <div style={{marginTop:"-3px", marginLeft:"-1px", paddingLeft:"10px", paddingRight:"10px"}}>
                      Procedures ({data.procedure_objects.length})
                      {activeOrders === 'procedures' ? <OverlayTrigger
                        key={"order-procedure"}
                        placement="top"
                        overlay={
                          <Tooltip id={`tooltip-order-procedure`}>
                            Order procedures for this patient
                          </Tooltip>
                        }
                      >
                        <Link href={"/" + organization + "/" + incident + "/vet/medrecord/" + data.id + "/procedures"}><FontAwesomeIcon icon={faPlusSquare} className="ml-1" inverse /></Link>
                      </OverlayTrigger> : ""}
                    </div>
                  </ListGroup.Item>
                </ListGroup>
              </h4>
            </Card.Title>
            <hr className="mb-3" />
            <Scrollbar no_shadow="true" style={{height:"564px", minHeight:"564px"}} renderView={props => <div {...props} style={{...props.style, overflowX:"hidden", marginBottom:"-10px"}}/>}  renderThumbHorizontal={props => <div {...props} style={{...props.style, display: 'none'}} />}>
            {activeOrders === 'pending' && data.treatment_requests.filter(tr => tr.status === 'Pending').map(treatment_request => (
              <TreatmentCard key={treatment_request.id} incident={incident} organization={organization} treatment_request={treatment_request} />
            ))}
            {activeOrders === 'pending' && data.diagnostic_objects.filter(diagnostic => diagnostic.status === 'Pending').map(diagnostic => (
              <DiagnosticCard key={diagnostic.id} incident={incident} organization={organization} diagnostic={diagnostic} />
            ))}
            {activeOrders === 'pending' && data.procedure_objects.filter(procedure => procedure.status === 'Pending').map(procedure => (
              <ProcedureCard key={procedure.id} incident={incident} organization={organization} procedure={procedure} />
            ))}
            
            {activeOrders === 'treatments' && data.treatment_requests.map(treatment_request => (
              <TreatmentCard key={treatment_request.id} incident={incident} organization={organization} treatment_request={treatment_request} />
            ))}
            {activeOrders === 'treatments' && data.treatment_requests.length < 1 ? <p>No treatments have been created for this patient.</p> : ""}
            {activeOrders === 'diagnostics' && data.diagnostic_objects.map(diagnostic => (
              <DiagnosticCard key={diagnostic.id} incident={incident} organization={organization} diagnostic={diagnostic} />
            ))}
            {activeOrders === 'diagnostics' && data.diagnostic_objects.length < 1 ? <p>No diagnostics have been ordered for this patient.</p> : ""}
            {activeOrders === 'procedures' && data.procedure_objects.map(procedure => (
              <ProcedureCard key={procedure.id} incident={incident} organization={organization} procedure={procedure} />
            ))}
            {activeOrders === 'procedures' && data.procedure_objects.length < 1 ? <p>No procedures have been ordered for this patient.</p> : ""}
            </Scrollbar>
          </Card.Body>
        </Card>
      </div>
    </div> : ""}
    {/* <History action_history={data.action_history} /> */}
    </>
  );
};

export default MedicalRecordDetails;
