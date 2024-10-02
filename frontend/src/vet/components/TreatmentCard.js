import React from 'react';
import { Link } from 'raviger';
import { Card, Col, OverlayTrigger, Row, Tooltip } from 'react-bootstrap';
import Moment from 'react-moment';
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

function TreatmentCard(props) {

  return (
    <>
    <Row className="ml-0 mb-3">
      <Link href={"/" + props.organization + "/" + props.incident + "/vet/treatment/" + props.treatment_request.treatment_plan} className="treatment-link" style={{textDecoration:"none", color:"white"}}>
        <Card className="border rounded treatment-hover-div" style={{height:props.animal_object ? "120px" : "100px", width:"845px", whiteSpace:"nowrap", overflow:"hidden"}}>
          <div className="row no-gutters hover-div treatment-hover-div" style={{height:"100px", marginRight:"-2px"}}>
            <Row className="ml-0 mr-0  pl-0 pr-0 w-100">
              {props.animal_object ?
              <div className="border-right ml-0 mr-0" style={{height:props.animal_object ? "120px" : "100px", width:"120px"}}>
              {props.treatment_request.treatment_object['Eye Medication','Ear Medication'].includes(props.treatment_request.treatment_object ? props.treatment_request.treatment_object.category : '') ?
                <FontAwesomeIcon icon={faEyeDropper} size="6x" className="treatment-icon" style={{marginTop:"14px", marginLeft:"14px"}} transform={'grow-1'} inverse />
                : props.treatment_request.treatment_object && props.treatment_request.treatment_object.category === 'Patient Care' ?
                <FontAwesomeIcon icon={faHeart} size="6x" className="treatment-icon" style={{marginTop:"14px", marginLeft:"14px"}} transform={'grow-1'} inverse />
                : props.treatment_request.treatment_object && props.treatment_request.treatment_object.unit === 'ml' ?
                <FontAwesomeIcon icon={faSyringe} size="6x" className="treatment-icon" style={{marginTop:"14px", marginLeft:"13px"}} transform={'grow-1'} inverse />
              :
                <FontAwesomeIcon icon={faPrescriptionBottlePill} size="6x" className="treatment-icon" style={{marginTop:"14px", marginLeft:"9px"}} transform={'grow-1'} inverse />
              }
              </div>
              :
              <div className="border-right" style={{width:"100px"}}>
              {props.treatment_request.treatment_object && ['Eye Medication','Ear Medication'].includes(props.treatment_request.treatment_object.category) ?
                <FontAwesomeIcon icon={faEyeDropper} size="6x" className="treatment-icon" style={{marginTop:"5px", marginLeft:"4px"}} transform={'shrink-2'} inverse />
                : props.treatment_request.treatment_object && props.treatment_request.treatment_object.category === 'Patient Care' ?
                <FontAwesomeIcon icon={faHeart} size="6x" className="treatment-icon" style={{marginTop:"5px", marginLeft:"4px"}} transform={'shrink-2'} inverse />
                : props.treatment_request.treatment_object && props.treatment_request.treatment_object.treatment_object && props.treatment_request.treatment_object.unit === 'ml' ?
                <FontAwesomeIcon icon={faSyringe} size="6x" className="treatment-icon" style={{marginTop:"5px", marginLeft:"4px"}} transform={'shrink-2'} inverse />
              :
                <FontAwesomeIcon icon={faPrescriptionBottlePill} size="6x" className="treatment-icon" style={{marginTop:"5px", marginLeft:"-1px"}} transform={'shrink-2'} inverse />
              }
              </div>
              }
              <Col className="hover-div pl-0 pr-0">
                <div className="border treatment-hover-div" style={{paddingTop:"5px", paddingBottom:"7px", paddingLeft:"5px", marginLeft:"-1px", marginTop: "-1px", fontSize:"18px", width:"100%", backgroundColor:"rgb(158 153 153)"}}>
                  <span style={{marginLeft:"5px"}}>{props.treatment_request.treatment_object ? props.treatment_request.treatment_object.description : ""}</span>
                  <span className="float-right">
                  {props.treatment_request.actual_admin_time ?
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
                    : props.treatment_request.not_administered ?
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
                    : new Date(props.treatment_request.suggested_admin_time) <= new Date() ?
                    <OverlayTrigger
                      key={"awaiting-action-treatment-request"}
                      placement="top"
                      overlay={
                        <Tooltip id={`tooltip-awaiting-action-treatment-request`}>
                          Treatment request is pending action.
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
                {props.animal_object ? <Row style={{marginTop:"6px", paddingLeft:"10px"}}>
                  <Col xs={3}>
                    <b>Patient: </b>A#{props.animal_object.id_for_incident}
                  </Col>
                  <Col xs={3}>
                    <b>Species:</b> <span  style={{textTransform:"capitalize"}}>{props.animal_object.species_string}</span>
                  </Col>
                  <Col xs={6}>
                    <b>Name: </b>{props.animal_object.name || "Unknown"}
                  </Col>
                </Row> : ""}
                <Row style={{marginTop:props.animal_object ? "" : "6px", paddingLeft:"10px"}}>
                  {props.treatment_request.actual_admin_time ?
                  <Col xs={6}>
                    <b>Administered: </b><Moment format="MMM DD, HH:mm">{props.treatment_request.actual_admin_time}</Moment>
                  </Col>
                  :
                  <Col xs={6}>
                    <b>Scheduled: </b><Moment format="MMM DD, HH:mm">{props.treatment_request.suggested_admin_time}</Moment>
                  </Col>
                  }
                  {props.treatment_request.assignee_object ?
                  <Col xs={4}>
                    <b>Administrator: </b>{props.treatment_request.assignee_object.first_name} {props.treatment_request.assignee_object.last_name}
                  </Col>
                  :
                  props.treatment_request.not_administered ?
                  <Col xs={6}>
                    <b>Administrator: </b>Not Administered
                  </Col> : ""}
                </Row>
                <Row style={{paddingLeft:"10px"}}>
                  <Col xs={3}>
                    <b>Quantity: </b>{props.treatment_request.quantity}
                  </Col>
                  <Col xs={3}>
                    <b>Unit: </b>{props.treatment_request.unit || '-'}
                  </Col>
                  <Col xs={3}>
                    <b>Route: </b>{props.treatment_request.route || '-'}
                  </Col>
                  <Col>
                    <b>Num: </b>{props.treatment_request.num || '-'}
                  </Col>
                </Row>
              </Col>
            </Row>
          </div>
        </Card>
      </Link>
    </Row>
  </>
  )
}

export default TreatmentCard;
