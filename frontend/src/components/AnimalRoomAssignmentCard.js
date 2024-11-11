import React from 'react';
import { Card, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUserAlt, faUserAltSlash
} from '@fortawesome/free-solid-svg-icons';
import AnimalCoverImage from './AnimalCoverImage';

function AnimalRoomAssignmentCard(props) {

  return (
    <>
    <Card className={"border rounded" + (props.snapshot.isDragging ? " border-danger" : "")} float="left" style={{width:"157px", marginLeft:"-5px", marginTop:props.direction === "horizontal" ? "-5px" : "", whiteSpace:"nowrap", overflow:"hidden"}}>
      <div className="row no-gutters">
        <div style={{whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>
          <AnimalCoverImage
            animalSpecies={props.animal.species_string}
            height="47px"
            width="47px"
            customStyles={{
              marginRight: '3px',
              float: 'left'
            }}
          />
          {props.animal.animal_count > 1 ? <span title={props.animal.animal_count}>{props.animal.animal_count} <span style={{ textTransform:"capitalize" }}>{props.animal.species_string}</span>{props.animal.animal_count > 1 && !["sheep", "cattle"].includes(props.animal.species_string) ? "s" : ""}</span> : <span title={props.animal.name}>
            {props.animal.name||"Unknown"}
            </span>}
          <div style={{width:"157px"}}>
            #{props.animal.id_for_incident}&nbsp;
            {props.animal.animal_count > 1 ? "" : <span style={{ textTransform:"capitalize" }}>{props.animal.species_string}&nbsp;</span>}
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
