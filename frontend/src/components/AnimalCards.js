import React from 'react';
import { Link } from 'raviger';
import { Card, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUserAlt, faUserAltSlash, faClipboardList, faCircle, faExclamationCircle, faQuestionCircle, faHome, faHelicopter, faHeart, faSkullCrossbones
} from '@fortawesome/free-solid-svg-icons';
import { faHomeAlt } from '@fortawesome/pro-solid-svg-icons';
import ReactImageFallback from 'react-image-fallback';
import noImageFound from '../static/images/image-not-found.png';

function AnimalCards(props) {

  return (
    <>
    <span className="d-flex flex-wrap align-items-end" style={{marginLeft:"-15px"}}>
    {props.animals.map(animal => (
      <Card key={animal.id} className="border rounded ml-3 mb-3" style={{width:"153px", whiteSpace:"nowrap", overflow:"hidden"}}>
        <ReactImageFallback style={{width:"153px", height:"153px", objectFit: "cover", overflow: "hidden"}} src={animal.front_image} fallbackImage={[animal.side_image, noImageFound]} />
        <Card.Text className="mb-0" style={{textTransform:"capitalize"}}>
        <span title={animal.name} className="ml-1">#{animal.id}&nbsp;{animal.name||"Unknown"}</span>
        <div className="ml-1">
          {animal.species === 'horse' && animal.size !== 'unknown' ? animal.size : animal.species}
          <OverlayTrigger
            key={"animal-details"}
            placement="top"
            overlay={
              <Tooltip id={`tooltip-animal-details`}>
                Animal details
              </Tooltip>
            }
          >
            <Link href={"/animals/" + animal.id}><FontAwesomeIcon icon={faClipboardList} className="ml-1 mr-1" inverse /></Link>
          </OverlayTrigger>
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
            key={"stray"}
            placement="top"
            overlay={
              <Tooltip id={`tooltip-stray`}>
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
                <FontAwesomeIcon icon={faExclamationCircle} inverse/>
            </OverlayTrigger> : ""}
          {animal.status === "UNABLE TO LOCATE" ?
            <OverlayTrigger key={"unable-to-locate"} placement="top"
                            overlay={<Tooltip id={`tooltip-unable-to-locate`}>UNABLE TO LOCATE</Tooltip>}>
                <FontAwesomeIcon icon={faQuestionCircle} inverse/>
            </OverlayTrigger> : ""}
          {animal.status === "EVACUATED" ?
            <OverlayTrigger key={"evacuated"} placement="top"
                            overlay={<Tooltip id={`tooltip-evacuated`}>EVACUATED</Tooltip>}>
                <FontAwesomeIcon icon={faHelicopter} inverse/>
            </OverlayTrigger> : ""}
          {animal.status === "REUNITED" ?
            <OverlayTrigger key={"reunited"} placement="top"
                            overlay={<Tooltip id={`tooltip-reunited`}>REUNITED</Tooltip>}>
                <FontAwesomeIcon icon={faHeart} inverse/>
            </OverlayTrigger> : ""}
          {animal.status === "SHELTERED" ?
            <OverlayTrigger key={"sheltered"} placement="top"
                            overlay={<Tooltip id={`tooltip-sheltered`}>SHELTERED</Tooltip>}>
                <FontAwesomeIcon icon={faHome} inverse/>
            </OverlayTrigger> : ""}
          {animal.status === "DECEASED" ?
            <OverlayTrigger key={"deceased"} placement="top"
                            overlay={<Tooltip id={`tooltip-deceased`}>DECEASED</Tooltip>}>
                <FontAwesomeIcon icon={faSkullCrossbones} inverse/>
            </OverlayTrigger> : ""}
          </span> : ""}
        </div>
        </Card.Text>
      </Card>
    ))}
    </span>
    </>
  );
};

export default AnimalCards;