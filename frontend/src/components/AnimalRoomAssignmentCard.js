import React from 'react';
import { Card, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUserAlt, faUserAltSlash
} from '@fortawesome/free-solid-svg-icons';
import { S3_BUCKET } from '../constants';

function AnimalRoomAssignmentCard(props) {

  return (
    <>
    <Card className={"border rounded" + (props.snapshot.isDragging ? " border-danger" : "")} float="left" style={{width:"157px", marginLeft:"-5px", whiteSpace:"nowrap", overflow:"hidden"}}>
      <div className="row no-gutters" style={{ textTransform:"capitalize" }}>
        <div style={{whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>
          <img alt="Animal" style={{width:"47px", height:"47px", marginRight:"3px", objectFit:"cover", overflow:"hidden", float:"left"}} src={props.animal.front_image || props.animal.side_image || `${S3_BUCKET}images/image-not-found.png`} />
          <span title={props.animal.name}>
            {props.animal.name||"Unknown"}
            </span>
          <div style={{width:"157px"}}>
            #{props.animal.id}&nbsp;
            {props.animal.species}&nbsp;
            {props.animal.owner_names.length === 0 ?
            <OverlayTrigger
              key={"stray"}
              placement="top"
              overlay={
                <Tooltip id={`tooltip-stray`}>
                  Animal is stray
                </Tooltip>
              }
            >
              <FontAwesomeIcon icon={faUserAltSlash} size="sm" />
            </OverlayTrigger> :
            <OverlayTrigger
              key={"owners"}
              placement="top"
              overlay={
                <Tooltip id={`tooltip-owners`}>
                  Owners:
                  {props.animal.owner_names.map(owner_name => (
                    <div key={owner_name}>{owner_name}</div>
                  ))}
                </Tooltip>
              }
            >
              <FontAwesomeIcon icon={faUserAlt} size="sm" />
            </OverlayTrigger>}
          </div>
        </div>
      </div>
    </Card>
    </>
  );
};

export default AnimalRoomAssignmentCard;
