import React from 'react';
import { Link } from 'raviger';
import { Card, ListGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMinusCircle, faUserAlt, faUserAltSlash, faCircle, faExclamationCircle, faQuestionCircle, faHome, faHeart, faSkullCrossbones
} from '@fortawesome/free-solid-svg-icons';
import { faBadgeSheriff, faCircleBolt, faClawMarks, faHomeAlt } from '@fortawesome/pro-solid-svg-icons';

function Patient(props) {

  return (
    <>
    <div className="col-12 mt-3">
      <Card className="border rounded" style={{width:"100%"}}>
        <Card.Body>
          <Card.Title>
            <h4 className="mb-0">Patient</h4>
          </Card.Title>
          <hr/>
          <ListGroup variant="flush" style={{marginTop:"-13px", marginBottom:"-13px"}}>
            <ListGroup.Item>
              <div className="row" style={{textTransform:"capitalize"}}>
                <span className="col-3"><b>ID:</b> <Link href={"/" + props.organization + "/" + props.incident + "/animals/" + props.animal.id} className="text-link" style={{textDecoration:"none", color:"white"}}>A#{props.animal.id}</Link></span>
                <span className="col-3"><b>Name:</b> {props.animal.name||"Unknown"}</span>
                <span className="col-3"><b>Location:</b> {props.animal.shelter_object ? props.animal.shelter_object.name:"Unknown"} {props.animal.room_name ? props.animal.room_name:""}</span>
              </div>
            </ListGroup.Item>
            <ListGroup.Item>
              <div className="row" style={{textTransform:"capitalize"}}>
                <span className="col-3"><b>Species:</b> {props.animal.species_string}</span>
                <span className="col-3"><b>Age:</b> {props.animal.age}</span>
                <span className="col-3"><b>Sex:</b> {props.animal.sex}</span>
                <span className="col-3"><b>Altered:</b> {props.animal.fixed}</span>
              </div>
            </ListGroup.Item>
            <ListGroup.Item>
                <span><b>Medical Notes:</b> {props.animal.medical_notes || "N/A"}</span>
            </ListGroup.Item>
          </ListGroup>
        </Card.Body>
      </Card>
    </div>
    </>
  );
};

export default Patient;