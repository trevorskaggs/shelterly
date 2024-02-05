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
    <Row key={props.procedure.id} className="ml-0 mb-3">
      <Link href={"/" + props.organization + "/" + props.incident + "/vet/procedureresult/edit/" + props.procedure.id} className="treatment-link" style={{textDecoration:"none", color:"white"}}>
        <Card className="border rounded treatment-hover-div" style={{height:"100px", width:"745px", whiteSpace:"nowrap", overflow:"hidden"}}>
          <div className="row no-gutters hover-div treatment-hover-div" style={{height:"100px", marginRight:"-2px"}}>
            <Row className="ml-0 mr-0 w-100" style={{flexWrap:"nowrap"}}>
              <div className="border-right" style={{width:"100px"}}>
                {props.procedure.name.toLowerCase().includes('bandage') || props.procedure.other_name.toLowerCase().includes('bandage') || props.procedure.name.toLowerCase().includes('splint') || props.procedure.other_name.toLowerCase().includes('splint') ?
                  <FontAwesomeIcon icon={faBandage} size="5x" className="treatment-icon" style={{marginTop:"11px", marginLeft:"3px"}} transform={'shrink-1'} inverse />
                : props.procedure.name.toLowerCase().includes('hydro') || props.procedure.other_name.toLowerCase().includes('hydro') || props.procedure.name.toLowerCase().includes('water') || props.procedure.other_name.toLowerCase().includes('water') ?
                  <FontAwesomeIcon icon={faWater} size="6x" className="treatment-icon" style={{marginTop:"5px", marginLeft:"-1px"}} transform={'shrink-2'} inverse />
                : props.procedure.name.toLowerCase().includes('eye') || props.procedure.other_name.toLowerCase().includes('eye') ?
                  <FontAwesomeIcon icon={faEye} size="5x" className="treatment-icon" style={{marginTop:"11px", marginLeft:"8px"}} transform={'grow-1'} inverse />
                : props.procedure.name.toLowerCase().includes('clean') || props.procedure.other_name.toLowerCase().includes('clean') ?
                  <FontAwesomeIcon icon={faSoap} size="6x" className="treatment-icon" style={{marginTop:"5px", marginLeft:"5px"}} transform={'shrink-1'} inverse />
                :
                  <FontAwesomeIcon icon={faScalpelLineDashed} size="6x" className="treatment-icon" style={{marginTop:"5px", marginLeft:"-1px"}} transform={'shrink-2'} inverse />
                }
                </div>
              <Col style={{marginLeft:"-5px", marginRight:"-25px"}} className="hover-div">
                <div className="border treatment-hover-div" style={{paddingTop:"5px", paddingBottom:"7px", paddingLeft:"10px", marginLeft:"-11px", marginTop: "-1px", fontSize:"18px", width:"100%", backgroundColor:"rgb(158 153 153)"}}>
                  {props.procedure.other_name ? props.procedure.other_name : props.procedure.name}
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
                <Row style={{marginTop:"6px"}}>
                  <Col xs={3}>
                    Status: {props.procedure.complete ? 'Complete' : 'Pending'}
                  </Col>
                  {props.procedure.complete ?
                  <Col xs={4}>
                    Completed: <Moment format="lll">{props.procedure.complete}</Moment>
                  </Col>
                  :
                  <Col xs={4}>
                    Ordered: <Moment format="lll">{props.procedure.open}</Moment>
                  </Col>
                  }
                </Row>
                <Row>
                  <Col>
                    Notes: {props.procedure.notes || "N/A"}
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
