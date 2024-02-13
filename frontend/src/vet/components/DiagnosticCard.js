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
        <Card className="border rounded treatment-hover-div" style={{height:"100px", width:"745px", whiteSpace:"nowrap", overflow:"hidden"}}>
          <div className="row no-gutters hover-div treatment-hover-div" style={{height:"100px", marginRight:"-2px"}}>
            <Row className="ml-0 mr-0 w-100" style={{flexWrap:"nowrap"}}>
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
              <Col style={{marginLeft:"-5px", marginRight:"-25px"}} className="hover-div">
                <div className="border treatment-hover-div" style={{paddingTop:"5px", paddingBottom:"7px", paddingLeft:"10px", marginLeft:"-11px", marginTop: "-1px", fontSize:"18px", width:"100%", backgroundColor:"rgb(158 153 153)"}}>
                  {props.diagnostic.other_name ? props.diagnostic.other_name : props.diagnostic.name}
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
                <Row style={{marginTop:"6px"}}>
                  <Col xs={3}>
                    Result: {props.diagnostic.result || 'Pending'}
                  </Col>
                  {props.diagnostic.complete ?
                  <Col xs={4}>
                    Completed: <Moment format="lll">{props.diagnostic.complete}</Moment>
                  </Col>
                  :
                  <Col xs={4}>
                    Ordered: <Moment format="lll">{props.diagnostic.open}</Moment>
                  </Col>
                  }
                </Row>
                <Row>
                  <Col>
                    Notes: {props.diagnostic.notes || "N/A"}
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
