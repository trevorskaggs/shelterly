import React from 'react';
import { Link } from 'raviger';
import { Card, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMinusCircle, faUserAlt, faUserAltSlash, faCircle, faExclamationCircle, faQuestionCircle, faHome, faHeart, faSkullCrossbones
} from '@fortawesome/free-solid-svg-icons';
import { faBadgeSheriff, faClawMarks, faHomeAlt } from '@fortawesome/pro-solid-svg-icons';
import AnimalCoverImage from './AnimalCoverImage';

function AnimalCards(props) {

  return (
    <>
    <span className="d-flex flex-wrap align-items-end" style={{marginLeft:"-15px"}}>
    {props.animals.map(animal => (
      <span key={animal.id} className="ml-3 mb-3">
        <Link href={props.incident + "/animals/" + animal.id} className="animal-link" style={{textDecoration:"none", color:"white"}}>
          <Card className="border rounded animal-hover-div" style={{width:"153px", whiteSpace:"nowrap", overflow:"hidden"}}>
            <AnimalCoverImage
              animalSpecies={animal.species}
              height="153px"
              width="153px"
            />
            <Card.ImgOverlay className="text-border" style={{height:"20px"}}>#{animal.id}</Card.ImgOverlay>
            <Card.Text className="mb-0 border-top animal-hover-div" style={{textTransform:"capitalize", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>
              <span title={animal.name} className="ml-1">{animal.name||"Unknown"}</span>
              <span className="ml-1" style={{display:"block"}}>
                {animal.species}&nbsp;
                {props.show_owner ? <span>
                {animal.owner_names.length === 0 ?
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
                      {animal.owner_names.map(owner_name => (
                        <div key={owner_name}>{owner_name}</div>
                      ))}
                    </Tooltip>
                  }
                >
                  <FontAwesomeIcon icon={faUserAlt} size="sm" />
                </OverlayTrigger>}
                </span> : ""}
                {props.show_status ?
                <span>
                {animal.status === "SHELTERED IN PLACE" ?
                  <OverlayTrigger key={"sip"} placement="top"
                                  overlay={<Tooltip id={`tooltip-sip`}>SHELTERED IN PLACE</Tooltip>}>
                      <span className="fa-layers fa-fw">
                        <FontAwesomeIcon icon={faCircle} transform={'grow-1'} />
                        <FontAwesomeIcon icon={faHomeAlt} style={{color:"#444"}} transform={'shrink-3'} size="sm" inverse />
                      </span>
                  </OverlayTrigger> : ""}
                {animal.status === "REPORTED" ?
                  <OverlayTrigger key={"reported"} placement="top"
                                  overlay={<Tooltip id={`tooltip-reported`}>REPORTED</Tooltip>}>
                      <FontAwesomeIcon className="animal-icon" icon={faExclamationCircle} inverse/>
                  </OverlayTrigger> : ""}
                {animal.status === "REPORTED (SHELTERED IN PLACE)" ?
                  <OverlayTrigger key={"reported-sip"} placement="top"
                                  overlay={<Tooltip id={`tooltip-reported-sip`}>REPORTED (SHELTERED IN PLACE)</Tooltip>}>
                      <FontAwesomeIcon className="animal-icon" icon={faExclamationCircle} inverse/>
                  </OverlayTrigger> : ""}
                {animal.status === "UNABLE TO LOCATE" ?
                  <OverlayTrigger key={"unable-to-locate"} placement="top"
                                  overlay={<Tooltip id={`tooltip-unable-to-locate`}>UNABLE TO LOCATE</Tooltip>}>
                      <FontAwesomeIcon className="animal-icon" icon={faQuestionCircle} inverse/>
                  </OverlayTrigger> : ""}
                {animal.status === "NO FURTHER ACTION" ?
                  <OverlayTrigger key={"unable-to-locate-nfa"} placement="top"
                                  overlay={<Tooltip id={`tooltip-unable-to-locate-nfa`}>NO FURTHER ACTION</Tooltip>}>
                      <FontAwesomeIcon className="animal-icon" icon={faMinusCircle} inverse/>
                  </OverlayTrigger> : ""}
                {animal.status === "REUNITED" ?
                  <OverlayTrigger key={"reunited"} placement="top"
                                  overlay={<Tooltip id={`tooltip-reunited`}>REUNITED</Tooltip>}>
                      <FontAwesomeIcon className="animal-icon" icon={faHeart} inverse/>
                  </OverlayTrigger> : ""}
                {animal.status === "SHELTERED" ?
                  <OverlayTrigger key={"sheltered"} placement="top"
                                  overlay={<Tooltip id={`tooltip-sheltered`}>SHELTERED</Tooltip>}>
                      <FontAwesomeIcon className="animal-icon" icon={faHome} inverse/>
                  </OverlayTrigger> : ""}
                {animal.status === "DECEASED" ?
                  <OverlayTrigger key={"deceased"} placement="top"
                                  overlay={<Tooltip id={`tooltip-deceased`}>DECEASED</Tooltip>}>
                      <FontAwesomeIcon className="animal-icon" icon={faSkullCrossbones} inverse/>
                  </OverlayTrigger> : ""}
                </span> : ""}
                {animal.aggressive === "yes" ?
                  <OverlayTrigger key={"aggressive"} placement="top"
                                  overlay={<Tooltip id={`tooltip-aggressive`}>Animal is aggressive</Tooltip>}>
                      <FontAwesomeIcon className="animal-icon ml-1" icon={faClawMarks} />
                  </OverlayTrigger>
                : ""}
                {animal.aco_required === "yes" ?
                  <OverlayTrigger key={"aco-required"} placement="top"
                                  overlay={<Tooltip id={`tooltip-aco-required`}>ACO required</Tooltip>}>
                      <FontAwesomeIcon className="animal-icon ml-1" icon={faBadgeSheriff} />
                  </OverlayTrigger>
                : ""}
              </span>
            </Card.Text>
          </Card>
        </Link>
      </span>
    ))}
    </span>
    </>
  );
};

export default AnimalCards;
