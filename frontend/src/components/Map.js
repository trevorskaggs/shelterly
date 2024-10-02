import React, { useEffect, useRef, useState } from "react";
import axios from 'axios';
import ReactDOMServer from 'react-dom/server';
import { Button, Col, Row } from 'react-bootstrap';
import Autocomplete from 'react-google-autocomplete';
import L from "leaflet";
import { Map as LeafletMap, TileLayer, useLeaflet } from "react-leaflet";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCircle, faTimesCircle, faExclamationCircle, faHome, faMapMarkerAlt, faStar,
} from '@fortawesome/free-solid-svg-icons';
import { faCheckCircle, faQuestionCircle as faQuestionCircleDuo } from '@fortawesome/pro-duotone-svg-icons';
import { faHomeAlt as faHomeAltReg } from '@fortawesome/pro-regular-svg-icons';
import { faCircleBolt, faHomeAlt, faDoNotEnter, faHouseMedical, faLocationCheck, faLocationExclamation, faHouseMedicalCircleCheck, faHouseMedicalCircleExclamation } from '@fortawesome/pro-solid-svg-icons';

export const Legend = (props) => {
  const { map } = useLeaflet();

  useEffect(() => {
    const legend = L.control.scale(props);
    legend.addTo(map);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);
  return null;
};

const pinIconHTML = ReactDOMServer.renderToString(<FontAwesomeIcon color="red" size="lg" className="icon-border" icon={faMapMarkerAlt} />);
export const pinMarkerIcon = new L.DivIcon({
  html: pinIconHTML,
  iconSize: [0, 0],
  iconAnchor: [9, 10],
  className: "pin-icon",
  popupAnchor: null,
  shadowUrl: null,
  shadowSize: null,
  shadowAnchor: null
});

const starIconHTML = ReactDOMServer.renderToString(<FontAwesomeIcon color="gold" size="lg" className="icon-border" icon={faStar} />);
export const starMarkerIcon = new L.DivIcon({
  html: starIconHTML,
  iconSize: [0, 0],
  iconAnchor: [9, 10],
  className: "star-icon",
  popupAnchor: null,
  shadowUrl: null,
  shadowSize: null,
  shadowAnchor: null
});

const reportedIconHTML = ReactDOMServer.renderToString(
  <span className="fa-layers">
    <FontAwesomeIcon icon={faCircle} color="white" size="lg" />
    <FontAwesomeIcon icon={faExclamationCircle} className="icon-border" color="#ff4c4c" size="lg" />
  </span>
);
export const reportedMarkerIcon = new L.DivIcon({
  html: reportedIconHTML,
  iconSize: [0, 0],
  iconAnchor: [8, 9],
  className: "reported-icon",
  popupAnchor: null,
  shadowUrl: null,
  shadowSize: null,
  shadowAnchor: null
});

const reportedEvacIconHTML = ReactDOMServer.renderToString(
  <span className="fa-layers">
    <FontAwesomeIcon icon={faCircle} color="white" size="lg" />
    <FontAwesomeIcon icon={faCircleBolt} className="icon-border" size="lg" color="#ff4c4c" />
  </span>
);
export const reportedEvacMarkerIcon = new L.DivIcon({
  html: reportedEvacIconHTML,
  iconSize: [0, 0],
  iconAnchor: [8, 9],
  className: "reported-evacuation-icon",
  popupAnchor: null,
  shadowUrl: null,
  shadowSize: null,
  shadowAnchor: null
});

const reportedSIPIconHTML = ReactDOMServer.renderToString(
  <span className="fa-layers">
    <FontAwesomeIcon icon={faCircle} className="icon-border" color="#ff4c4c" size="lg" transform={'grow-2'} />
    <FontAwesomeIcon icon={faHomeAlt} style={{color:"white"}} transform={'shrink-3 left-1'} size="lg" inverse />
    <FontAwesomeIcon icon={faHomeAltReg} style={{color:"#444"}} transform={'shrink-3 left-1'} size="lg" inverse />
  </span>
);
export const reportedSIPMarkerIcon = new L.DivIcon({
  html: reportedSIPIconHTML,
  iconSize: [0, 0],
  iconAnchor: [8, 9],
  className: "reported-SIP-icon",
  popupAnchor: null,
  shadowUrl: null,
  shadowSize: null,
  shadowAnchor: null
});

const SIPIconHTML = ReactDOMServer.renderToString(
  <span className="fa-layers">
    <FontAwesomeIcon icon={faCircle} className="icon-border" color="#f5ee0f" size="lg" transform={'grow-2'} />
    <FontAwesomeIcon icon={faHomeAlt} style={{color:"white"}} transform={'shrink-3 left-1'} size="lg" inverse />
    <FontAwesomeIcon icon={faHomeAltReg} style={{color:"#444"}} transform={'shrink-3 left-1'} size="lg" inverse />
  </span>
);
export const SIPMarkerIcon = new L.DivIcon({
  html: SIPIconHTML,
  iconSize: [0, 0],
  iconAnchor: [8, 9],
  className: "SIP-icon",
  popupAnchor: null,
  shadowUrl: null,
  shadowSize: null,
  shadowAnchor: null
});

const UTLIconHTML = ReactDOMServer.renderToString(
  <span className="fa-layers">
    <FontAwesomeIcon icon={faCircle} color="white" size="lg" />
    <FontAwesomeIcon icon={faQuestionCircleDuo} className="icon-border" size="lg" style={{"--fa-primary-color":'white', "--fa-secondary-color":'#5f5fff', "--fa-secondary-opacity": 1}}  />
  </span>
);
export const UTLMarkerIcon = new L.DivIcon({
  html: UTLIconHTML,
  iconSize: [0, 0],
  iconAnchor: [8, 9],
  className: "UTL-icon",
  popupAnchor: null,
  shadowUrl: null,
  shadowSize: null,
  shadowAnchor: null
});

const checkIconHTML = ReactDOMServer.renderToString(<FontAwesomeIcon icon={faCheckCircle} className="icon-border" size="lg" style={{"--fa-primary-color":'white', "--fa-secondary-color":'green', "--fa-secondary-opacity": 1}} />);
export const checkMarkerIcon = new L.DivIcon({
  html: checkIconHTML,
  iconSize: [0, 0],
  iconAnchor: [8, 9],
  className: "check-icon",
  popupAnchor: null,
  shadowUrl: null,
  shadowSize: null,
  shadowAnchor: null
});

const shelterIconHTML = ReactDOMServer.renderToString(<FontAwesomeIcon icon={faHome} className="icon-border" size="lg" color="#b18662" />);
export const shelterMarkerIcon = new L.DivIcon({
  html: shelterIconHTML,
  iconSize: [0, 0],
  iconAnchor: [8, 9],
  className: "shelter-icon",
  popupAnchor: null,
  shadowUrl: null,
  shadowSize: null,
  shadowAnchor: null
});

const vetShelterIconHTML = ReactDOMServer.renderToString(<FontAwesomeIcon icon={faHouseMedical} className="icon-border" size="lg" color="#b18662" />);
export const vetShelterMarkerIcon = new L.DivIcon({
  html: vetShelterIconHTML,
  iconSize: [0, 0],
  iconAnchor: [8, 9],
  className: "vet-shelter-icon",
  popupAnchor: null,
  shadowUrl: null,
  shadowSize: null,
  shadowAnchor: null
});

const vetCompleteShelterIconHTML = ReactDOMServer.renderToString(<FontAwesomeIcon icon={faHouseMedicalCircleCheck} className="icon-border" size="lg" color="#b18662" />);
export const vetCompleteShelterMarkerIcon = new L.DivIcon({
  html: vetCompleteShelterIconHTML,
  iconSize: [0, 0],
  iconAnchor: [8, 9],
  className: "vet-complete-shelter-icon",
  popupAnchor: null,
  shadowUrl: null,
  shadowSize: null,
  shadowAnchor: null
});

const vetPendingShelterIconHTML = ReactDOMServer.renderToString(<FontAwesomeIcon icon={faHouseMedicalCircleExclamation} className="icon-border" size="lg" color="#b18662" />);
export const vetPendingShelterMarkerIcon = new L.DivIcon({
  html: vetPendingShelterIconHTML,
  iconSize: [0, 0],
  iconAnchor: [8, 9],
  className: "vet-pending-shelter-icon",
  popupAnchor: null,
  shadowUrl: null,
  shadowSize: null,
  shadowAnchor: null
});

const vetPendingAnimalLocationIconHTML = ReactDOMServer.renderToString(<FontAwesomeIcon icon={faLocationExclamation} className="icon-border" size="lg" color="#b18662" />);
export const vetPendingAnimalLocationMarkerIcon = new L.DivIcon({
  html: vetPendingAnimalLocationIconHTML,
  iconSize: [0, 0],
  iconAnchor: [8, 9],
  className: "vet-pending-animal-icon",
  popupAnchor: null,
  shadowUrl: null,
  shadowSize: null,
  shadowAnchor: null
});

const vetCompleteAnimalLocationIconHTML = ReactDOMServer.renderToString(<FontAwesomeIcon icon={faLocationCheck} className="icon-border" size="lg" color="#b18662" />);
export const vetCompleteAnimalLocationMarkerIcon = new L.DivIcon({
  html: vetCompleteAnimalLocationIconHTML,
  iconSize: [0, 0],
  iconAnchor: [8, 9],
  className: "vet-complete-animal-icon",
  popupAnchor: null,
  shadowUrl: null,
  shadowSize: null,
  shadowAnchor: null
});

const closedIconHTML = ReactDOMServer.renderToString(
  <span className="fa-layers">
    <FontAwesomeIcon icon={faCircle} color="white" size="lg" />
    <FontAwesomeIcon icon={faDoNotEnter} className="icon-border" size="lg" color="#af7051" />
  </span>
);
export const closedMarkerIcon = new L.DivIcon({
  html: closedIconHTML,
  iconSize: [0, 0],
  iconAnchor: [8, 9],
  className: "closed-icon",
  popupAnchor: null,
  shadowUrl: null,
  shadowSize: null,
  shadowAnchor: null
});

const finishedIconHTML = ReactDOMServer.renderToString(
  <span className="fa-layers">
    <FontAwesomeIcon icon={faCircle} color="white" size="lg" />
    <FontAwesomeIcon icon={faTimesCircle} className="icon-border" size="lg" color="#af7051" />
  </span>
);
export const finishedMarkerIcon = new L.DivIcon({
  html: finishedIconHTML,
  iconSize: [0, 0],
  iconAnchor: [8, 9],
  className: "finished-icon",
  popupAnchor: null,
  shadowUrl: null,
  shadowSize: null,
  shadowAnchor: null
});

// Counts the number of size/species matches for a service request by status.
export const countMatches = (service_request) => {
  var matches = {};
  var status_matches = {'REPORTED':{}, 'REPORTED (EVAC REQUESTED)':{}, 'REPORTED (SIP REQUESTED)':{}, 'SHELTERED IN PLACE':{}, 'UNABLE TO LOCATE':{}};

  service_request.animals.forEach((animal) => {
    if (['REPORTED', 'REPORTED (EVAC REQUESTED)', 'REPORTED (SIP REQUESTED)', 'SHELTERED IN PLACE', 'UNABLE TO LOCATE'].indexOf(animal.status) > -1) {
      if (!matches[[animal.species_string]]) {
        matches[[animal.species_string]] = 1;
      }
      else {
        matches[[animal.species_string]] += 1;
      }
      if (!status_matches[animal.status][[animal.species_string]]) {
        status_matches[animal.status][[animal.species_string]] = 1;
      }
      else {
        status_matches[animal.status][[animal.species_string]] += 1;
      }
    }
  });
  return [matches, status_matches]
}

// Counts the number of species matches for a assigned request.
export const countDictMatches = (animals) => {
  var matches = {};

  Object.keys(animals).forEach((animal) => {
    if (!matches[[animals[animal].species]]) {
      matches[[animals[animal].species]] = 1;
    }
    else {
      matches[[animals[animal].species]] += 1;
    }
  });
  return matches
}

// Takes in animal size, species, and count and returns a pretty string combination.
export const prettyText = (species, count) => {
  if (count <= 0) {
    return "";
  }
  let plural = ""
  if (count > 1 && !["sheep", "cattle"].includes(species)) {
    plural = "s"
  }

  let text = count + " " + species + plural;

  return text;
}

const Map = (props) => {

  return (
    <>
    <LeafletMap className={props.className || "d-block"} bounds={props.bounds} boundsOptions={props.boundsOptions} zoomControl={props.zoomControl === false ? false : true} onMoveEnd={props.onMoveEnd}>
      <Legend position={props.legend_position || "bottomleft"} metric={false} />
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      />
      {props.children}
    </LeafletMap>
    </>
  );
};

export const AddressLookup = ({setData, initialBounds, handleClose, ...props}) => {

  const childRef = useRef(null);
  const [incidentLatLon, setIncidentLatLon] = useState({lat:0, lng:0});

  const clearAddress = () => {
    childRef.current.value = "";
    setData(prevState => ({ ...prevState, bounds:initialBounds }));
    handleClose();
  };

  useEffect(() => {
    let unmounted = false;
    let source = axios.CancelToken.source();

    axios.get('/incident/api/incident/?incident=' + props.incident, {
      cancelToken: source.token,
    })
    .then(response => {
      if (!unmounted) {
        setIncidentLatLon({lat:Number(response.data[0].latitude), lng:Number(response.data[0].longitude)});
      }
    })
    .catch(error => {
    });
  }, [props.incident]);

  const updateAddr = suggestion => {

    if (suggestion && suggestion.address_components) {
      // Extract location information from the return. Use short_name for the state.
      let components={};
      suggestion.address_components.forEach(function(k,v1) {k.types.forEach(function(v2, k2){v2 !== "administrative_area_level_1" ? components[v2]=k.long_name : components[v2]=k.short_name});});

      // Build formatted street number + name string.
      let address = "";
      if (components.street_number) {
        address = components.street_number + " " + components.route;
      }
      else if (components.route) {
        address = components.route;
      }
      else {
        address = components.intersection;
      }

      setData(prevState => ({ ...prevState, bounds:L.latLngBounds([[suggestion.geometry.location.lat(), suggestion.geometry.location.lng()]]) }));
    }
  }

  return (
    <>
      <Row className="mr-0 d-flex" style={{maxHeight:"37px"}}>
        <Col className="flex-grow-1 pr-1">
          <Autocomplete
            {...props}
            onPlaceSelected={(place) => {
              updateAddr(place);
              handleClose()
            }}
            onFocus={(event) => { event.target.setAttribute('autocomplete', 'off'); }}
            id="search"
            name="search"
            options={{
              bounds:{north:incidentLatLon.lat+.1, south:incidentLatLon.lat-.1, east:incidentLatLon.lng+.1, west:incidentLatLon.lng-.1},
              types: ["geocode"],
              componentRestrictions: { country: ["us", "ca"] },
            }}
            ref={childRef}
            key={String(incidentLatLon.lat)}
            apiKey={process.env.REACT_APP_GOOGLE_API_KEY}
          />
        </Col>
        <Button variant="outline-light" className="float-right" style={{maxHeight:"37px"}} onClick={clearAddress} disabled={props.disabled ? true : false}>Reset</Button>
      </Row>
    </>
  );
}

export default Map;
