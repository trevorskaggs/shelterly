import React, { useState, useEffect } from "react";
import ReactDOMServer from 'react-dom/server';
import axios from "axios";
import { Col, Row } from 'react-bootstrap'
import { Circle, CircleMarker, Map, Marker, TileLayer, Tooltip as MapTooltip } from "react-leaflet";
import L from "leaflet";
import Moment from 'react-moment';
import randomColor from "randomcolor";
import { Legend } from "../components/Map";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faStar
} from '@fortawesome/free-solid-svg-icons';
import badge from "../static/images/badge-sheriff.png";
import bandaid from "../static/images/band-aid-solid.png";
import car from "../static/images/car-solid.png";
import trailer from "../static/images/trailer-solid.png";

function Hotline({id}) {

  const [currentRequest, setCurrentRequest] = useState({id:'', latitude:0, longitude:0, followup_date:''})
  const [data, setData] = useState({service_requests: [], isFetching: false, bounds:L.latLngBounds([[0,0]])});
  const [mapState, setMapState] = useState({});

  // Takes in animal size, species, and count and returns a pretty string combination.
  const prettyText = (size, species, count) => {
    if (count <= 0) {
      return "";
    }
    var plural = ""
    if (count > 1) {
      plural = "s"
    }

    var size_and_species = size + " " + species + plural;
    // Exception for horses since they don't need an extra species output.
    if (species === 'horse') {
      // Exception for pluralizing ponies.
      if (size === 'pony' && count > 1) {
        size_and_species = 'ponies'
      }
      else {
        size_and_species = size + plural;
      }
    }

    var text = count + " " + size_and_species;
    return text;
  }

  // Counts the number of size/species matches for a service request by status.
  const countMatches = (service_request) => {
    var matches = {};

    service_request.animals.forEach((animal) => {
      if (!matches[[animal.species,animal.size]]) {
        matches[[animal.species,animal.size]] = 1;
      }
      else {
        matches[[animal.species,animal.size]] += 1;
      }
    });
    return matches
  }

  // Show or hide list of SRs based on current map zoom
  const onMove = event => {
    for (const service_request of data.service_requests) {
      if (mapState[service_request.id]) {
        if (!event.target.getBounds().contains(L.latLng(service_request.latitude, service_request.longitude))) {
          setMapState(prevState => ({ ...prevState, [service_request.id]: {...prevState[service_request.id], hidden:true} }));
        }
        else {
          setMapState(prevState => ({ ...prevState, [service_request.id]: {...prevState[service_request.id], hidden:false} }));
        }
      }
    }
  }

  // Hook for initializing data.
  useEffect(() => {
    let source = axios.CancelToken.source();

    // const fetchCurrentRequest = async () => {
    //   // Fetch ServiceRequest data.
    //   await axios.get('/hotline/api/servicerequests/' + id + '/', {
    //     cancelToken: source.token,
    //   })
    //   .then(response => {
    //     setCurrentRequest(response.data);
    //   })
    //   .catch(error => {
    //     console.log(error.response);
    //     setCurrentRequest({});
    //   });
    // };

    const fetchServiceRequests = async () => {

      // Fetch current ServiceRequest data.
      await axios.get('/hotline/api/servicerequests/' + id + '/', {
        cancelToken: source.token,
      })
      .then(currentResponse => {
        setCurrentRequest(currentResponse.data);

        // Fetch assigned ServiceRequest data.
        axios.get('/hotline/api/servicerequests/', {
          params: {
            status: 'assigned',
            map: true
          },
          cancelToken: source.token,
        })
        .then(response => {
          setData({service_requests: response.data, isFetching: false, bounds:L.latLngBounds([[0,0]])});
          const map_dict = {};
          const bounds = [];
          const unique_values = [...new Set(response.data.map((sr) => sr.assigned_evac))];
          const random_colors = randomColor({count:unique_values.length});
          const colors = unique_values.reduce((map, evac, index) => (map[evac] = random_colors[index], map), {});

          for (const service_request of response.data) {
            const matches = countMatches(service_request);
            map_dict[service_request.id] = {color:colors[service_request.assigned_evac], matches:matches, latitude:service_request.latitude, longitude:service_request.longitude};
            bounds.push([service_request.latitude, service_request.longitude]);
          }
          const current_matches = countMatches(currentResponse.data);
          map_dict[currentResponse.data.id] = {color:'black', matches:current_matches, latitude:currentResponse.data.latitude, longitude:currentResponse.data.longitude};
          bounds.push([currentResponse.data.latitude, currentResponse.data.longitude]);
          setMapState(map_dict);
          setData({service_requests: response.data, isFetching: false, bounds:L.latLngBounds(bounds)});
        })
        .catch(error => {
          console.log(error.response);
          setData({service_requests: [], isFetching: false, bounds:L.latLngBounds([[0,0]])});
        });
      })
    };

    // fetchCurrentRequest();
    fetchServiceRequests();

    // Cleanup.
    return () => {
      source.cancel();
    };
  }, []);

  const iconHTML = ReactDOMServer.renderToString(<FontAwesomeIcon color="gold" size="lg" className="fa-border" icon={faStar} />)
  const customMarkerIcon = new L.DivIcon({
    html: iconHTML,
    iconSize: [0,0],
    iconAnchor: [32, 64],
    popupAnchor: null,
    shadowUrl: null,
    shadowSize: null,
    shadowAnchor: null
  });

  return (
    <>
    <Row className="d-flex flex-wrap mt-3">
      <Col xs={10} className="border rounded pl-0 pr-0 m-auto">
        <Map className="d-block" bounds={data.bounds} onMoveEnd={onMove}>
          <Legend position="bottomleft" metric={false} />
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          />
          <Marker
            position={[currentRequest.latitude, currentRequest.longitude]}
            icon={customMarkerIcon}
            onClick={() => window.open("/hotline/servicerequest/" + currentRequest.id, "_blank")}
          >
            <MapTooltip autoPan={false}>
              <span>
                {mapState[currentRequest.id] ?
                  <span>
                    {Object.keys(mapState[currentRequest.id].matches).map((key,i) => (
                      <span key={key} style={{textTransform:"capitalize"}}>
                        {i > 0 && ", "}{prettyText(key.split(',')[1], key.split(',')[0], mapState[currentRequest.id].matches[key])}
                      </span>
                    ))}
                  </span>
                :""}
                <br />
                {currentRequest.full_address}
                {currentRequest.followup_date ? <div>Followup Date: <Moment format="L">{currentRequest.followup_date}</Moment></div> : ""}
                <div>
                  {currentRequest.aco_required ? <img width={16} height={16} src={badge} alt="" className="mr-1" /> : ""}
                  {currentRequest.injured ? <img width={16} height={16} src={bandaid} alt="" className="mr-1" /> : ""}
                  {currentRequest.accessible ? <img width={16} height={16} src={car} alt="" className="mr-1" /> : ""}
                  {currentRequest.turn_around ? <img width={16} height={16} src={trailer} alt="" /> : ""}
                </div>
              </span>
            </MapTooltip>
          </Marker>
          {data.service_requests.map(service_request => (
            <CircleMarker
              key={service_request.id}
              center={{lat:service_request.latitude, lng: service_request.longitude}}
              color="black"
              weight="1"
              fillColor={mapState[service_request.id] ? mapState[service_request.id].color : ""}
              fill={true}
              fillOpacity="1"
              onClick={() => window.open("/hotline/servicerequest/" + service_request.id, "_blank")}
              radius={5}
            >
              <MapTooltip autoPan={false}>
                <span>
                  {mapState[service_request.id] ?
                    <span>
                      {Object.keys(mapState[service_request.id].matches).map((key,i) => (
                        <span key={key} style={{textTransform:"capitalize"}}>
                          {i > 0 && ", "}{prettyText(key.split(',')[1], key.split(',')[0], mapState[service_request.id].matches[key])}
                        </span>
                      ))}
                    </span>
                  :""}
                  <br />
                  {service_request.full_address}
                  {service_request.followup_date ? <div>Followup Date: <Moment format="L">{service_request.followup_date}</Moment></div> : ""}
                  <div>
                    {service_request.aco_required ? <img width={16} height={16} src={badge} alt="" className="mr-1" /> : ""}
                    {service_request.injured ? <img width={16} height={16} src={bandaid} alt="" className="mr-1" /> : ""}
                    {service_request.accessible ? <img width={16} height={16} src={car} alt="" className="mr-1" /> : ""}
                    {service_request.turn_around ? <img width={16} height={16} src={trailer} alt="" /> : ""}
                  </div>
                </span>
              </MapTooltip>
            </CircleMarker>
          ))}
          {Object.entries(mapState).filter(([key, value]) => value.radius === "enabled").map(([key, value]) => (
            <Circle key={key} center={{lat:value.latitude, lng: value.longitude}} radius={805} interactive={false} />
          ))}
        </Map>
      </Col>
    </Row>
  </>
  )
}

export default Hotline
