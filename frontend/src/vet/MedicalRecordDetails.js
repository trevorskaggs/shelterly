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
  faClipboardListCheck,
  faPrescriptionBottlePill,
  faSquareExclamation,
  faSquareEllipsis,
  faSquareX,
  faScalpelLineDashed,
  faFlashlight,
  faPeriod,
  faMobileScreenButton,
  faUserDoctorMessage
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
import ActionsDropdown from '../components/ActionsDropdown';
import LoadingLink from '../components/LoadingLink';

function MedicalRecordDetails({ id, incident, organization }) {

  const { setShowSystemError } = useContext(SystemErrorContext);
  const { dispatch, state } = useContext(AuthContext);

  // Identify any query param data.
  const [queryParams] = useQueryParams();
  const {
    tab = 'pending',
  } = queryParams;

  const priorityText = {urgent:'Urgent (Red)', when_available:'When Available (Yellow)'};

  const [data, setData] = useState({id:'', exams:[], diagnostic_objects:[], procedure_objects:[], patient:null, vet_requests:[], pending:[], open: '', diagnosis: '', other_diagnosis:'', treatment_requests:[], animal_object: {id:'', name:'', species:'', category:'', sex:'', age:'', fixed:'', pcolor:'', scolor:'', medical_notes:'', shelter_object:{}, room_name:''}});
  const [showExam, setShowExam] = useState(false);
  const [activeVR, setActiveVR] = useState(null);
  const [activeExam, setActiveExam] = useState(null);
  const [activeOrders, setActiveOrders] = useState(tab);
  const [isLoading, setIsLoading] = useState(true);
  const [hideCompleted, setHideCompleted] = useState(true);

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
          let pending_data = [];
          let treatment_requests = [];
          response.data.treatment_plans.forEach(plan => {
              pending_data = plan.treatment_requests.filter(tr => tr.status === 'Pending').length ? pending_data.concat([plan.treatment_requests.filter(tr => tr.status === 'Pending').map(tr => ({...tr, type:'treatment'}))[0]]) : pending_data;
              treatment_requests = plan.treatment_requests.filter(tr => tr.status !== 'Completed').length > 0 ? treatment_requests.concat([plan.treatment_requests.filter(tr => tr.status !== 'Completed')[plan.treatment_requests.filter(tr => tr.status !== 'Completed').length -1]]) : [plan.treatment_requests[0]]
          });
          pending_data = pending_data.concat(response.data.diagnostic_objects.map(diagnostic => ({...diagnostic, type:'diagnostic'})));
          pending_data = pending_data.concat(response.data.procedure_objects.map(procedure => ({...procedure, type:'procedure'})));
          response.data['pending'] = pending_data;
          response.data['treatment_requests'] = treatment_requests;
          setData(response.data);
          setActiveVR(response.data.vet_requests.filter(vr => vr.status === 'Open').length > 0 ? response.data.vet_requests.filter(vr => vr.status === 'Open')[0].id : null);
          setShowExam(response.data.vet_requests.filter(vr => vr.status === 'Open').length > 0 ? true : false);
        }
      })
      .catch(error => {
        setShowSystemError(true);
      })
      .finally(() => setIsLoading(false));
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
          <Card.Body style={{marginTop:"-10px"}}>
            <div className="d-flex justify-content-between" style={{marginBottom:"-3px"}}>
              <h4 className="h4 mb-0 pb-0 pt-2">
                  Patient: {data.animal_object.name||"Unknown"}
              </h4>
              <ActionsDropdown alignRight={true} className="pt-1" variant="dark" title="Actions">
                  <LoadingLink
                    href={"/" + organization + "/" + incident + "/animals/" + data.animal_object.id_for_incident + "/vetrequest/new"}
                    isLoading={isLoading}
                    className="text-white d-block py-1"
                    style={{marginLeft:"12px"}}
                  >
                    <FontAwesomeIcon icon={faUserDoctorMessage} className="mr-1" inverse />
                    Create Veterinary Request
                  </LoadingLink>
                  {data.exams.length ? <LoadingLink
                    href={"/" + organization + "/" + incident + "/vet/medrecord/" + data.id + "/treatment/new"}
                    isLoading={isLoading}
                    className="text-white d-block py-1 px-3"
                  >
                    <FontAwesomeIcon icon={faPrescriptionBottlePill} className="mr-1" inverse />
                    Add Treatment
                  </LoadingLink> : ""}
                  {data.exams.length ? <LoadingLink
                    href={"/" + organization + "/" + incident + "/vet/medrecord/" + data.id + "/diagnostics"}
                    isLoading={isLoading}
                    className="text-white d-block py-1"
                    style={{paddingLeft:"13px"}}
                  >
                    <FontAwesomeIcon icon={faVial} className="mr-2" style={{cursor:'pointer'}} transform='grow-3' inverse />
                    Order Diagnostics
                  </LoadingLink> : ""}
                  {data.exams.length ? <LoadingLink
                    href={"/" + organization + "/" + incident + "/vet/medrecord/" + data.id + "/procedures"}
                    isLoading={isLoading}
                    className="text-white d-block py-1"
                    style={{paddingLeft:"11px"}}
                  >
                    <FontAwesomeIcon icon={faScalpelLineDashed} className="mr-2" style={{cursor:'pointer'}} transform='grow-3' inverse />
                    Order Procedures
                  </LoadingLink> : ""}
                  {data.exams.length ? <LoadingLink
                    href={"/" + organization + "/" + incident + "/vet/medrecord/" + data.id + "/diagnosis/new"}
                    isLoading={isLoading}
                    className="text-white d-block py-1 px-3"
                  >
                    <FontAwesomeIcon icon={faClipboardListCheck} className="mr-2" inverse />
                    Modify Diagnosis
                  </LoadingLink> : ""}
                </ActionsDropdown>
            </div>
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
                  <span className="col-12"><b>Location:</b> {data.animal_object.shelter_object ? <Link href={"/" + organization + "/" + incident + "/shelter/" + data.animal_object.shelter_object.id} className="text-link" style={{textDecoration:"none", color:"white"}}>{data.animal_object.shelter_object.name}</Link>:"Unknown"}{data.animal_object.room_name ? <span> - {data.animal_object.room_name}</span> : ""}</span>
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
                  {/* <OverlayTrigger
                    key={"add-diagnosis"}
                    placement="top"
                    overlay={
                      <Tooltip id={`tooltip-add-diagnosis`}>
                        Add a diagnosis for this patient
                      </Tooltip>
                    }
                  >
                    <Link href={"/" + organization + "/" + incident + "/vet/medrecord/" + data.id + "/diagnosis/new"}><FontAwesomeIcon icon={faPlusSquare} className="ml-1" inverse /></Link>
                  </OverlayTrigger> */}
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
    </div>
    <div className="row mt-3">
      <div className="col-12 d-flex">
        <Card className="border rounded" style={{width:"100%"}}>
          <Card.Body style={{marginBottom:showExam ? "-7px" : "-15px"}}>
            <Card.Title style={{marginTop:"-2px", marginBottom:"-16px"}}>
              <h4 className="mb-0" style={{marginRight:"-1px"}}>
                <Scrollbar horizontal="true" autoHide no_shadow="true" style={{height:"45px", marginLeft:"-1px", shadowheight:"45px", width:"100%"}} renderView={props => <div {...props} style={{...props.style, marginBottom:"-18px", marginRight:"0px", overflowX:"auto", overflowY: "hidden"}}/>} renderThumbVertical={props => <div {...props} style={{...props.style, display: 'none'}} />}>
                  <ListGroup horizontal>
                    {data.vet_requests.filter(vr => vr.status === 'Open').length ? <ListGroup.Item className="border rounded" style={{backgroundColor:"rgb(158, 153, 153)", marginRight:"1px"}}>
                      <Row style={{width:"112px"}}>
                        <div style={{marginTop:"-3px", marginLeft:"4px"}}>Open VRs:</div>
                      </Row>
                    </ListGroup.Item> : ""}
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
                    {data.exams.length ? <ListGroup.Item className="border rounded" style={{backgroundColor:"rgb(158, 153, 153)"}}>
                      <Row style={{width:"77px"}}>
                        <div style={{marginTop:"-3px", marginLeft:"4px"}}>Exams:</div>
                        {/* <FontAwesomeIcon icon={faChevronCircleRight} hidden={showExam} onClick={() => {setShowExam(true)}} className="ml-1" size="sm" style={{cursor:'pointer'}} inverse />
                        <FontAwesomeIcon icon={faChevronCircleDown} hidden={!showExam} onClick={() => {setShowExam(false)}} className="ml-1" size="sm" style={{cursor:'pointer'}} inverse /> */}
                      </Row>
                    </ListGroup.Item> : ""}
                    {data.exams.map((exam,i) => (
                    <ListGroup horizontal key={exam.id} className="border rounded">
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
                  <span className="col-3"><b>Pulse:</b> {exam.pulse || "N/A"}</span>
                  <span className="col-4"><b>Respiratory Rate:</b> {exam.respiratory_rate || "N/A"}</span>
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
                <div className="row" style={{whiteSpace:"pre-line"}}>
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
                  <div className="row" style={{textTransform:"capitalize", marginBottom:vet_request.status !== 'Open' ? "0px" : "-10px"}}>
                    <span className="col-2"><b>ID:</b> <Link href={"/" + organization + "/" + incident + "/vet/vetrequest/" + vet_request.id} className="text-link" style={{textDecoration:"none", color:"white"}}>VR#{vet_request.id}</Link></span>
                    <span className="col-3"><b>Priority:</b> {priorityText[vet_request.priority]}</span>
                    {vet_request.status === 'Open' ?
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
                    </span> : ""}
                  </div>
                </ListGroup.Item>
                <ListGroup.Item>
                  <div className="row">
                    <span className="col-5"><b>Opened:</b> {moment(vet_request.open).format('lll')}</span>
                    <span className="col-5"><b>Opened by:</b> {vet_request.requested_by_object ? <span>{vet_request.requested_by_object.first_name + ' ' + vet_request.requested_by_object.last_name}</span> : "Unknown"}</span>
                  </div>
                </ListGroup.Item>
                <ListGroup.Item>
                  <div className="row">
                    <span className="col-5"><b>Complaints:</b> {vet_request.complaints_text}</span>
                    <span className="col-7"><b>Concern:</b> {vet_request.concern || "None"}</span>
                  </div>
                </ListGroup.Item>
              </ListGroup>
            </Collapse>
            ))}
          </Card.Body>
        </Card>
      </div>
    </div>
    {data.exams.length > 0 ?
    <div className="row mt-3 mb-2">
      <div className="col-12 d-flex">
        <Card className="mb-2 border rounded" style={{width:"100%", height:"685px"}}>
          <Card.Body style={{marginBottom:""}}>
            <Card.Title style={{marginTop:"-2px", marginBottom:"20px"}}>
              <h4 className="mb-0">
                <Row className="ml-0">
                <ListGroup horizontal style={{marginBottom:"-20px"}}>
                  <ListGroup.Item active={"pending" === activeOrders} className="text-center" style={{textTransform:"capitalize", cursor:'pointer', paddingLeft:"5px", paddingRight:"5px"}} onClick={() => setActiveOrders("pending")}>
                    <div style={{marginTop:"-3px", marginLeft:"-1px", paddingLeft:"10px", paddingRight:"10px"}}>
                      All Pending ({data.pending.length})
                    </div>
                  </ListGroup.Item>
                  <ListGroup.Item active={"treatments" === activeOrders} className="text-center" style={{textTransform:"capitalize", cursor:'pointer', paddingLeft:"5px", paddingRight:"5px"}} onClick={() => setActiveOrders("treatments")}>
                    <div style={{marginTop:"-3px", marginLeft:"-1px", paddingLeft:"10px", paddingRight:"10px"}}>
                      Treatments ({data.treatment_requests.filter(tr => (!hideCompleted ? tr : tr.status !== 'Completed')).length})
                    </div>
                  </ListGroup.Item>
                  <ListGroup.Item active={"diagnostics" === activeOrders} className="text-center" style={{textTransform:"capitalize", cursor:'pointer', paddingLeft:"5px", paddingRight:"5px"}} onClick={() => setActiveOrders("diagnostics")}>
                    <div style={{marginTop:"-3px", marginLeft:"-1px", paddingLeft:"10px", paddingRight:"10px"}}>
                      Diagnostics ({data.diagnostic_objects.length})
                    </div>
                  </ListGroup.Item>
                  <ListGroup.Item active={"procedures" === activeOrders} className="text-center" style={{textTransform:"capitalize", cursor:'pointer', paddingLeft:"5px", paddingRight:"5px"}} onClick={() => setActiveOrders("procedures")}>
                    <div style={{marginTop:"-3px", marginLeft:"-1px", paddingLeft:"10px", paddingRight:"10px"}}>
                      Procedures ({data.procedure_objects.length})
                    </div>
                  </ListGroup.Item>
                </ListGroup>
                {/* {"pending" !== activeOrders ?
                  <input
                    id="hide_completed"
                    name="hide_completed"
                    type="checkbox"
                    className="ml-3"
                    checked={hideCompleted}
                    onChange={() => {
                      setHideCompleted(!hideCompleted)
                    }}
                    style={{marginTop:"-10px"}}
                  />: ""}
                  {"pending" !== activeOrders ?
                  <span style={{fontSize:"16px"}}>&nbsp;&nbsp;Hide Completed</span> : ""} */}
                </Row>
              </h4>
            </Card.Title>
            <hr className="mb-3" />
            <Scrollbar no_shadow="true" style={{height:"564px", minHeight:"564px"}} renderView={props => <div {...props} style={{...props.style, overflowX:"hidden", marginBottom:"-10px"}}/>}  renderThumbHorizontal={props => <div {...props} style={{...props.style, display: 'none'}} />}>
            {activeOrders === 'pending' && data.pending.sort((a, b) => new Date(a.suggested_admin_time ? a.suggested_admin_time : a.open) - new Date(b.suggested_admin_time ? b.suggested_admin_time : b.open)).map(pending => (
              <span>
              {pending.type === 'treatment' ? <TreatmentCard key={pending.id} incident={incident} organization={organization} treatment_request={pending} />
              :pending.type === 'diagnostic' ? <DiagnosticCard key={pending.id} incident={incident} organization={organization} diagnostic={pending} />
              :pending.type === 'procedure' ? <ProcedureCard key={pending.id} incident={incident} organization={organization} procedure={pending} />
              :""}
              </span>
            ))}
            {activeOrders === 'treatments' && data.treatment_requests.filter(tr => (!hideCompleted ? tr : tr.status !== 'Completed')).sort((a, b) => new Date(a.suggested_admin_time) - new Date(b.suggested_admin_time)).map(treatment_request => (
              <TreatmentCard key={treatment_request.id} incident={incident} organization={organization} treatment_request={treatment_request} />
            ))}
            {activeOrders === 'treatments' && data.treatment_requests.length < 1 ? <p>No treatments have been created for this patient.</p> : ""}
            {activeOrders === 'diagnostics' && data.diagnostic_objects.sort((a, b) => new Date(a.open) - new Date(b.open)).map(diagnostic => (
              <DiagnosticCard key={diagnostic.id} incident={incident} organization={organization} diagnostic={diagnostic} />
            ))}
            {activeOrders === 'diagnostics' && data.diagnostic_objects.length < 1 ? <p>No diagnostics have been ordered for this patient.</p> : ""}
            {activeOrders === 'procedures' && data.procedure_objects.sort((a, b) => new Date(a.open) - new Date(b.open)).map(procedure => (
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
