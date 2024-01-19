import React from 'react';
import { Link } from 'raviger';
import { Card, ListGroup, Row } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMinusCircle, faUserAlt, faUserAltSlash, faCircle, faExclamationCircle, faQuestionCircle, faHome, faHeart, faSkullCrossbones
} from '@fortawesome/free-solid-svg-icons';
import { faBadgeSheriff, faCircleBolt, faClawMarks, faHomeAlt } from '@fortawesome/pro-solid-svg-icons';

function Patient(props) {

  const priorityText = {urgent:'Urgent', when_available:'When Available'};

  return (
    <>
    <div className="row" style={{fontSize:'0.9375rem', letterSpacing:"0.00728em", fontFamily:'"Lato", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"'}}>
      <div className="col-6 d-flex pr-0">
        <Card className="border rounded d-flex" style={{width:"100%"}}>
          <Card.Body>
            <Card.Title>
              <h4 className="mb-0">
                <Row className="ml-0 pr-0">
                  Patient
                </Row>
              </h4>
            </Card.Title>
            <hr/>
            <ListGroup variant="flush" style={{marginTop:"-13px", marginBottom:"-13px"}}>
              <ListGroup.Item>
                <div className="row" style={{textTransform:"capitalize"}}>
                  <span className="col-4"><b>ID:</b> <Link href={"/" + props.organization + "/" + props.incident + "/animals/" + props.animal.id} className="text-link" style={{textDecoration:"none", color:"white"}}>A#{props.animal.id}</Link></span>
                  <span className="col-4"><b>Name:</b> {props.animal.name||"Unknown"}</span>
                  <span className="col-4"><b>Species:</b> {props.animal.species_string}</span>
                </div>
              </ListGroup.Item>
              <ListGroup.Item>
                <div className="row" style={{textTransform:"capitalize"}}>
                  <span className="col-4"><b>Age:</b> {props.animal.age||"Unknown"}</span>
                  <span className="col-4"><b>Sex:</b> {props.animal.sex||"Unknown"}</span>
                  <span className="col-4"><b>Altered:</b> {props.animal.fixed||"Unknown"}</span>
                </div>
              </ListGroup.Item>
              {/* <ListGroup.Item style={{textTransform:"capitalize"}}>
                <div className="row">
                  <span className="col-12"><b>Location:</b> {props.animal.shelter_object ? props.animal.shelter_object.name:"Unknown"}{props.animal.room_name ? <span> - {props.animal.room_name}</span> : ""}</span>
                </div>
              </ListGroup.Item> */}
              <ListGroup.Item>
                  <span><b>Medical Notes:</b> {props.animal.medical_notes || "N/A"}</span>
              </ListGroup.Item>
            </ListGroup>
          </Card.Body>
        </Card>
      </div>
      {props.vet_request ? <div className="col-6 d-flex pl-0">
        <Card className="border rounded d-flex" style={{width:"100%"}}>
          <Card.Body>
            <Card.Title>
              <h4 className="mb-0">
                Vet Request
              </h4>
            </Card.Title>
            <hr/>
            <ListGroup variant="flush" style={{marginTop:"-13px", marginBottom:"-13px"}}>
              <ListGroup.Item>
                <div className="row">
                  <span className="col-6"><b>ID: </b><Link href={"/" + props.organization + "/" + props.incident + "/vet/vetrequest/" + props.vet_request.id} className="text-link" style={{textDecoration:"none", color:"white"}}>VR#{props.vet_request.id}</Link></span>
                  <span className="col-6"><b>Priority: </b>{priorityText[props.vet_request.priority]}</span>
                </div>
              </ListGroup.Item>
              <ListGroup.Item>
                <b>Presenting Complaints:</b> {props.vet_request.complaints_text || "None"}
              </ListGroup.Item>
              <ListGroup.Item>
                <b>Concern:</b> {props.vet_request.concern || "N/A"}
              </ListGroup.Item>
            </ListGroup>
          </Card.Body>
        </Card>
      </div> : ""}
      {props.vet_request && props.vet_request.caution ? <div className="alert alert-danger text-center w-100" style={{fontSize:"16px", marginLeft:"15px", marginRight:"15px", marginBottom:"-5px"}}>Use caution when interacting with this animal.</div> : ""}
    </div>
    </>
  );
};

export default Patient;