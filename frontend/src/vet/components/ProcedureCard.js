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

function ProcedureCard(props) {

  return (
    <>
    <Row className="ml-0 mb-3">
      <Link href={"/" + props.organization + "/" + props.incident + "/vet/procedureresult/edit/" + props.procedure.id} className="treatment-link" style={{textDecoration:"none", color:"white"}}>
        <Card className="border rounded treatment-hover-div" style={{height:props.animal_object ? "120px" : "100px", width:"845px", whiteSpace:"nowrap", overflow:"hidden"}}>
          <div className="row no-gutters hover-div treatment-hover-div" style={{height:"100px", marginRight:"-2px"}}>
            <Row className="ml-0 mr-0 w-100" style={{flexWrap:"nowrap"}}>
              {props.animal_object ?
              <div className="border-right" style={{height:props.animal_object ? "120px" : "100px", minWidth:"120px"}}>
                {props.procedure.name.toLowerCase().includes('bandage') || props.procedure.other_name.toLowerCase().includes('bandage') || props.procedure.name.toLowerCase().includes('splint') || props.procedure.other_name.toLowerCase().includes('splint') ?
                  <FontAwesomeIcon icon={faBandage} size="6x" className="treatment-icon" style={{marginTop:"13px", marginLeft:"3px"}} transform={'shrink-1'} inverse />
                : props.procedure.name.toLowerCase().includes('hydro') || props.procedure.other_name.toLowerCase().includes('hydro') || props.procedure.name.toLowerCase().includes('water') || props.procedure.other_name.toLowerCase().includes('water') ?
                  <FontAwesomeIcon icon={faWater} size="6x" className="treatment-icon" style={{marginTop:"5px", marginLeft:"-1px"}} transform={'shrink-2'} inverse />
                : props.procedure.name.toLowerCase().includes('eye') || props.procedure.other_name.toLowerCase().includes('eye') ?
                  <FontAwesomeIcon icon={faEye} size="6x" className="treatment-icon" style={{marginTop:"14px", marginLeft:"8px"}} transform={'grow-1'} inverse />
                : props.procedure.name.toLowerCase().includes('clean') || props.procedure.other_name.toLowerCase().includes('clean') ?
                  <FontAwesomeIcon icon={faSoap} size="6x" className="treatment-icon" style={{marginTop:"14px", marginLeft:"14px"}} transform={'grow-1'} inverse />
                :
                  <FontAwesomeIcon icon={faScalpelLineDashed} size="6x" className="treatment-icon" style={{marginTop:"12px", marginLeft:"7px"}} transform={'grow-1'} inverse />
                }
              </div>
              :
              <div className="border-right" style={{minWidth:"100px"}}>
                {props.procedure.name.toLowerCase().includes('bandage') || props.procedure.other_name.toLowerCase().includes('bandage') || props.procedure.name.toLowerCase().includes('splint') || props.procedure.other_name.toLowerCase().includes('splint') ?
                  <FontAwesomeIcon icon={faBandage} size="5x" className="treatment-icon" style={{marginTop:"12px", marginLeft:"3px"}} transform={'shrink-1'} inverse />
                : props.procedure.name.toLowerCase().includes('hydro') || props.procedure.other_name.toLowerCase().includes('hydro') || props.procedure.name.toLowerCase().includes('water') || props.procedure.other_name.toLowerCase().includes('water') ?
                  <FontAwesomeIcon icon={faWater} size="5x" className="treatment-icon" style={{marginTop:"13px", marginLeft:"8px"}} transform={'grow-1'} inverse />
                : props.procedure.name.toLowerCase().includes('eye') || props.procedure.other_name.toLowerCase().includes('eye') ?
                  <FontAwesomeIcon icon={faEye} size="5x" className="treatment-icon" style={{marginTop:"13px", marginLeft:"8px"}} transform={'grow-1'} inverse />
                : props.procedure.name.toLowerCase().includes('clean') || props.procedure.other_name.toLowerCase().includes('clean') ?
                  <FontAwesomeIcon icon={faSoap} size="5x" className="treatment-icon" style={{marginTop:"13px", marginLeft:"12px"}} transform={'grow-2'} inverse />
                :
                  <FontAwesomeIcon icon={faScalpelLineDashed} size="5x" className="treatment-icon" style={{marginTop:"13px", marginLeft:"8px"}} transform={'grow-1'} inverse />
                }
              </div>
              }
              <Col className="hover-div pl-0 pr-0">
                <div className="border treatment-hover-div" style={{paddingTop:"5px", paddingBottom:"7px", paddingLeft:"5px", marginLeft:"-1px", marginTop: "-1px", fontSize:"18px", width:"100%", backgroundColor:"rgb(158 153 153)"}}>
                  <span style={{marginLeft:"9px"}}>{props.procedure.other_name ? props.procedure.other_name : props.procedure.name}</span>
                  <span className="float-right">
                  {props.procedure.complete ?
                    <OverlayTrigger
                      key={"complete-procedures"}
                      placement="top"
                      overlay={
                        <Tooltip id={`tooltip-complete-procedures`}>
                          Procedure order is complete.
                        </Tooltip>
                      }
                    >
                      <FontAwesomeIcon icon={faCheckSquare} size="3x" className="ml-1 treatment-icon" style={{marginTop:"-13px", marginRight:"-3px"}} transform={'shrink-2'} inverse />
                    </OverlayTrigger>
                    :
                    <OverlayTrigger
                      key={"scheduled-procedures"}
                      placement="top"
                      overlay={
                        <Tooltip id={`tooltip-scheduled-procedures`}>
                          Procedure order is pending.
                        </Tooltip>
                      }
                    >
                      <FontAwesomeIcon icon={faSquareExclamation} size="3x" className="ml-1 treatment-icon" style={{marginTop:"-13px", marginRight:"-3px"}} transform={'shrink-2'} inverse />
                    </OverlayTrigger>
                    }
                  </span>
                </div>
                {props.animal_object ? <Row className="mt-1 pl-0 ml-0">
                  <Col xs={4}>
                    <b>Patient: </b>A#{props.animal_object.id_for_incident}
                  </Col>
                  <Col xs={3}>
                    <b>Species:</b> <span  style={{textTransform:"capitalize"}}>{props.animal_object.species_string}</span>
                  </Col>
                  <Col xs={5}>
                    <b>Name: </b>{props.animal_object.name || "Unknown"}
                  </Col>
                </Row> : ""}
                <Row className="pl-0 ml-0">
                  {props.procedure.complete ?
                  <Col xs={4}>
                    <b>Completed: </b><Moment format="MMM DD, HH:mm">{props.procedure.complete}</Moment>
                  </Col>
                  :
                  <Col xs={3}>
                    <b>Scheduled: </b><Moment format="MMM DD">{props.procedure.open}</Moment>
                  </Col>
                  }
                  <Col xs={3} style={{marginLeft:"-22px"}}>
                    <b>Status: </b>{props.procedure.complete ? 'Complete' : 'Pending'}
                  </Col>
                </Row>
                <Row className="pl-0 ml-0">
                  <Col style={{overflowX:"ellipsis"}}>
                    <b>Notes: </b>{props.procedure.notes || "N/A"}
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

export default ProcedureCard;
