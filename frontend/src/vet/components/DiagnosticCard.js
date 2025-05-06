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

function DiagnosticCard(props) {

  return (
    <>
    <Row className="ml-0 mb-3">
      <Link href={"/" + props.organization + "/" + props.incident + "/vet/diagnosticresult/edit/" + props.diagnostic.id} className="treatment-link" style={{textDecoration:"none", color:"white"}}>
        <Card className="border rounded treatment-hover-div" style={{height:props.animal_object ? "120px" : "100px", width:"845px", whiteSpace:"nowrap", overflow:"hidden"}}>
          <div className="row no-gutters hover-div treatment-hover-div" style={{height:"100px", marginRight:"-2px"}}>
            <Row className="ml-0 mr-0 w-100" style={{flexWrap:"nowrap"}}>
              {props.animal_object ?
              <div className="border-right" style={{height:props.animal_object ? "120px" : "100px", width:"120px"}}>
              {props.diagnostic.name.toLowerCase().includes('needle') || props.diagnostic.other_name.toLowerCase().includes('needle') ?
                <FontAwesomeIcon icon={faSyringe} size="6x" className="treatment-icon" style={{marginTop:"13px", marginLeft:"14px"}} transform={'grow-1'} inverse />
              : props.diagnostic.name.toLowerCase().includes('istat') || props.diagnostic.other_name.toLowerCase().includes('istat') ?
              <span className="fa-layers" style={{marginLeft:"16px"}}>
                <FontAwesomeIcon icon={faRectangleVertical} size="4x" className="treatment-icon" style={{marginTop:"1px", marginLeft:"5px"}} transform={'shrink-4 down-15 right-4'} inverse />
                <FontAwesomeIcon icon={faMobileScreenButton} size="5x" className="treatment-icon" style={{marginLeft:""}} transform={'shrink-2 down-6 right-3'} inverse />
              </span>
              : props.diagnostic.name.toLowerCase().includes('culture') || props.diagnostic.other_name.toLowerCase().includes('culture') ?
                <FontAwesomeIcon icon={faRing} size="6x" className="treatment-icon" style={{marginTop:"14px", marginLeft:"9px"}} transform={'grow-1 right-1'} inverse />
              : props.diagnostic.name.toLowerCase().includes('schirmer') || props.diagnostic.other_name.toLowerCase().includes('schirmer') ?
                <FontAwesomeIcon icon={faEye} size="6x" className="treatment-icon" style={{marginTop:"13px", marginLeft:"9px"}} transform={'grow-1'} inverse />
              : props.diagnostic.name.toLowerCase().includes('eye') || props.diagnostic.other_name.toLowerCase().includes('eye') ?
                <FontAwesomeIcon icon={faEyeDropper} size="6x" className="treatment-icon" style={{marginTop:"14px", marginLeft:"13px"}} transform={'grow-1'} inverse />
              : props.diagnostic.name.toLowerCase().includes('ultrasound') || props.diagnostic.other_name.toLowerCase().includes('ultrasound') ?
                <span className="fa-layers" style={{marginLeft:"16px"}}>
                  <FontAwesomeIcon icon={faWifi} size="4x" className="treatment-icon" style={{marginTop:"7px", marginLeft:"3px"}} transform={'shrink-1 up-2 right-8 rotate-45'} inverse />
                  <FontAwesomeIcon icon={faPeriod} size="4x" className="fa-move-up" style={{marginLeft:"1px", color:"#303030"}} transform={'down-14 right-15 rotate-145'} inverse />
                  <FontAwesomeIcon icon={faFlashlight} size="5x" className="treatment-icon" transform={'shrink-2 down-14 left-5 rotate-315'} inverse />
                </span>
              :
                <FontAwesomeIcon icon={faVial} size="6x" className="treatment-icon" style={{marginTop:"14px", marginLeft:"16px"}} transform={'grow-2'} inverse />
              }
              </div>
              :
              <div className="border-right" style={{width:"100px"}}>
                {props.diagnostic.name.toLowerCase().includes('needle') || props.diagnostic.other_name.toLowerCase().includes('needle') ?
                  <FontAwesomeIcon icon={faSyringe} size="6x" className="treatment-icon" style={{marginTop:"5px", marginLeft:"4px"}} transform={'shrink-2'} inverse />
                : props.diagnostic.name.toLowerCase().includes('istat') || props.diagnostic.other_name.toLowerCase().includes('istat') ?
                <span className="fa-layers" style={{marginLeft:"16px"}}>
                  <FontAwesomeIcon icon={faRectangleVertical} size="3x" className="treatment-icon" style={{marginTop:"7px", marginLeft:"5.5px"}} transform={'shrink-3 down-15 right-4'} inverse />
                  <FontAwesomeIcon icon={faMobileScreenButton} size="4x" className="treatment-icon" style={{marginLeft:""}} transform={'shrink-2 down-6 right-3'} inverse />
                </span>
                : props.diagnostic.name.toLowerCase().includes('culture') || props.diagnostic.other_name.toLowerCase().includes('culture') ?
                  <FontAwesomeIcon icon={faRing} size="6x" className="treatment-icon" style={{marginTop:"5px", marginLeft:"-1px"}} transform={'shrink-2 right-1'} inverse />
                : props.diagnostic.name.toLowerCase().includes('schirmer') || props.diagnostic.other_name.toLowerCase().includes('schirmer') ?
                  <FontAwesomeIcon icon={faEye} size="5x" className="treatment-icon" style={{marginTop:"11px", marginLeft:"8px"}} transform={'grow-1'} inverse />
                : props.diagnostic.name.toLowerCase().includes('eye') || props.diagnostic.other_name.toLowerCase().includes('eye') ?
                  <FontAwesomeIcon icon={faEyeDropper} size="5x" className="treatment-icon" style={{marginTop:"11px", marginLeft:"11px"}} transform={'grow-1'} inverse />
                : props.diagnostic.name.toLowerCase().includes('ultrasound') || props.diagnostic.other_name.toLowerCase().includes('ultrasound') ?
                  <span className="fa-layers" style={{marginLeft:"16px"}}>
                    <FontAwesomeIcon icon={faWifi} size="3x" className="treatment-icon" style={{marginTop:"7px", marginLeft:"5px"}} transform={'shrink-1 up-2 right-8 rotate-45'} inverse />
                    <FontAwesomeIcon icon={faPeriod} size="3x" className="fa-move-up" style={{marginLeft:"1px", color:"#303030"}} transform={'down-14 right-16 rotate-145'} inverse />
                    <FontAwesomeIcon icon={faFlashlight} size="4x" className="treatment-icon" transform={'shrink-2 down-14 left-5 rotate-315'} inverse />
                  </span>
                :
                  <FontAwesomeIcon icon={faVial} size="6x" className="treatment-icon" style={{marginTop:"5px", marginLeft:"7px"}} inverse />
                }
              </div>
              }
              <Col className="hover-div pl-0 pr-0">
                <div className="border treatment-hover-div" style={{paddingTop:"5px", paddingBottom:"7px", paddingLeft:"5px", marginLeft:"-1px", marginTop: "-1px", fontSize:"18px", width:"100%", backgroundColor:"rgb(158 153 153)"}}>
                  <span style={{marginLeft:"9px"}}>{props.diagnostic.other_name ? props.diagnostic.other_name : props.diagnostic.name}</span>
                  <span className="float-right">
                  {props.diagnostic.result ?
                    <OverlayTrigger
                      key={"complete-diagnostics"}
                      placement="top"
                      overlay={
                        <Tooltip id={`tooltip-complete-diagnostics`}>
                          Diagnostic order is complete.
                        </Tooltip>
                      }
                    >
                      <FontAwesomeIcon icon={faCheckSquare} size="3x" className="ml-1 treatment-icon" style={{marginTop:"-13px", marginRight:"-3px"}} transform={'shrink-2'} inverse />
                    </OverlayTrigger>
                    :
                    <OverlayTrigger
                      key={"scheduled-diagnostics"}
                      placement="top"
                      overlay={
                        <Tooltip id={`tooltip-scheduled-diagnostics`}>
                          Diagnostic order is pending.
                        </Tooltip>
                      }
                    >
                      <FontAwesomeIcon icon={faSquareExclamation} size="3x" className="ml-1 treatment-icon" style={{marginTop:"-13px", marginRight:"-3px"}} transform={'shrink-2'} inverse />
                    </OverlayTrigger>
                    }
                  </span>
                </div>
                {props.animal_object ? <Row className="mt-1 pl-0 pr-0 ml-0 mr-0">
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
                <Row className="pl-0 pr-0 ml-0 mr-0">
                  {props.diagnostic.complete ?
                  <Col xs={3}>
                    <b>Completed: </b><Moment format="MMM DD, HH:mm">{props.diagnostic.complete}</Moment>
                  </Col>
                  :
                  <Col xs={3}>
                    <b>Scheduled: </b><Moment format="MMM DD">{props.diagnostic.open}</Moment>
                  </Col>
                  }
                  <Col xs={3}>
                    <b>Result: </b>{props.diagnostic.result || 'Pending'}
                  </Col>
                </Row>
                <Row className="pl-0 pr-0 ml-0 mr-0">
                  <Col>
                    <b>Notes: </b>{props.diagnostic.notes || "N/A"}
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

export default DiagnosticCard;
