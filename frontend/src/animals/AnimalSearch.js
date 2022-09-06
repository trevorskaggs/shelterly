import React, { useEffect, useState, useRef } from 'react';
import ReactDOMServer from 'react-dom/server';
import axios from "axios";
import { Link, useQueryParams } from 'raviger';
import { Button, Card, CardGroup, Col, Collapse, Form, FormControl, InputGroup, ListGroup, OverlayTrigger, Pagination, Row, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBan, faCalendarDay, faClipboardList, faCut, faEnvelope, faLink, faMapMarkerAlt, faMedkit, faPrint, faUserAltSlash
} from '@fortawesome/free-solid-svg-icons';
import {
  faDotCircle
} from '@fortawesome/free-regular-svg-icons';
import { faBadgeSheriff, faChevronDoubleDown, faChevronDoubleUp, faClawMarks, faPhoneRotary } from '@fortawesome/pro-solid-svg-icons';
import Moment from 'react-moment';
import Select, { components } from 'react-select';
import L from "leaflet";
import { Circle, Map, Marker, Tooltip as MapTooltip, TileLayer } from "react-leaflet";
import { useMark } from '../hooks';
import Header from '../components/Header';
import Scrollbar from '../components/Scrollbars';
import { titleCase } from '../components/Utils';
import { ITEMS_PER_PAGE } from '../constants';
import { Legend } from "../components/Map";
import { catColorChoices, dogColorChoices, horseColorChoices, otherColorChoices, speciesChoices, statusChoices } from './constants';
import AnimalCoverImage from '../components/AnimalCoverImage';
import { printAnimalCareSchedule, printAllAnimalCareSchedules } from './Utils';

const NoOptionsMessage = props => {
  return (
    <components.NoOptionsMessage {...props}>
      <span>Select a species</span>
    </components.NoOptionsMessage>
  );
};

function AnimalSearch({ incident }) {

  // Identify any query param data.
  const [queryParams] = useQueryParams();
  const {
    search = '',
  } = queryParams;

  const ownedChoices = [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' },
  ];

  const sexChoices = [
    { value: 'M', label: 'Male' },
    { value: 'F', label: 'Female' },
  ];

  const radiusChoices = [
    { value: 1.60934, label: '1 Mile' },
    { value: 3.21869, label: '2 Miles' },
    { value: 8.04672, label: '5 Miles' },
  ];

  const [data, setData] = useState({animals: [], isFetching: false});
  const [shelters, setShelters] = useState({options: [], isFetching: false});
  const [animals, setAnimals] = useState([]);
  const [options, setOptions] = useState({species: null, status: null, sex: null, owned: null, pcolor: '', fixed: null, latlng: null, radius: 1.60934, shelter: ''});
  const [searchTerm, setSearchTerm] = useState(search);
  const [showFilters, setShowFilters] = useState(false);
  const [isDisabled, setIsDisabled] = useState(true);
  const tempSearchTerm = useRef(null);
  const speciesRef = useRef(null);
  const statusRef = useRef(null);
  const sexRef = useRef(null);
  const ownedRef = useRef(null);
  const fixedRef = useRef(null);
  const pcolorRef = useRef(null);
  const shelterRef = useRef(null);
  const markerRef = useRef(null);
  const mapRef = useRef(null);
  const [bounds, setBounds] = useState(L.latLngBounds([[0,0]]));
  const [page, setPage] = useState(1);
  const [numPages, setNumPages] = useState(1);
  const { markInstances } = useMark();

  const colorChoices = {'':[], 'dog':dogColorChoices, 'cat':catColorChoices, 'horse':horseColorChoices, 'other':otherColorChoices}

  // Update searchTerm when field input changes.
  const handleChange = event => {
    tempSearchTerm.current.value = event.target.value;
  };

  // Use searchTerm to filter service_requests.
  const handleSubmit = async event => {
    event.preventDefault();
    setSearchTerm(tempSearchTerm.current.value);
    setPage(1);
  };

  const handleShowFilters = () => {
    setShowFilters(!showFilters);
    setTimeout(() => {
      mapRef.current.leafletElement.invalidateSize();
    }, 1000);
  };

  const handleApplyFilters = () => {
    setAnimals(data.animals.filter(animal => options.species ? animal.species === options.species : animal)
                           .filter(animal => options.status ? animal.status === options.status : animal)
                           .filter(animal => options.owned === 'yes' ? animal.owners.length > 0 : animal)
                           .filter(animal => options.owned === 'no' ? animal.owners.length === 0 : animal)
                           .filter(animal => options.fixed ? animal.fixed === options.fixed : animal)
                           .filter(animal => options.sex === 'unknown' ? animal.sex === '' : options.sex ? animal.sex === options.sex : animal)
                           .filter(animal => options.pcolor ? animal.pcolor === options.pcolor || animal.scolor === options.pcolor : animal)
                           .filter(animal => options.latlng ? arePointsNear({lat:animal.latitude, lng: animal.longitude}, options.latlng) : animal)
                           .filter(animal => options.shelter ? animal.shelter === options.shelter : animal)
    )

  }

  const handleClear = () => {
    speciesRef.current.select.clearValue();
    statusRef.current.select.clearValue();
    sexRef.current.select.clearValue();
    ownedRef.current.select.clearValue();
    fixedRef.current.select.clearValue();
    pcolorRef.current.select.clearValue();
    shelterRef.current.select.clearValue();
    setOptions({species: null, status: null, sex: null, owned: null, pcolor: '', fixed: null, latlng: null, radius: 1.60934});
    setAnimals(data.animals);
  };

  const handleDownloadPdfClick = (e, animalId) => {
    e.preventDefault();

    const animal = animals.find((animal) => animal.id === animalId);
    printAnimalCareSchedule(animal, [animal.front_image]);
  }

  const handlePrintAllClick = (e) => {
    e.preventDefault();

    printAllAnimalCareSchedules(animals);
  }

  function setFocus(pageNum) {
    if (pageNum !== page) {
      tempSearchTerm.current.focus();
    }
  };

  const updatePosition = (e) => {
    setOptions({...options, latlng: e.latlng})
  };

  const clearMarker = () => {
    setOptions({...options, latlng: null})
  };

  function arePointsNear(checkPoint, centerPoint) {
    var ky = 40000 / 360;
    var kx = Math.cos(Math.PI * centerPoint.lat / 180.0) * ky;
    var dx = Math.abs(centerPoint.lng - checkPoint.lng) * kx;
    var dy = Math.abs(centerPoint.lat - checkPoint.lat) * ky;
    return Math.sqrt(dx * dx + dy * dy) <= options.radius;
  };

  const customStyles = {
    // For the select it self, not the options of the select
    control: (styles, { isDisabled}) => {
      return {
        ...styles,
        color: '#FFF',
        cursor: isDisabled ? 'not-allowed' : 'default',
        backgroundColor: isDisabled ? '#DFDDDD' : 'white',
        height: 35,
        minHeight: 35,
        marginBottom: "15px"
      }
    },
    option: provided => ({
      ...provided,
      color: 'black'
    }),
  };

  const pinIconHTML = ReactDOMServer.renderToString(<FontAwesomeIcon color="red" size="lg" className="icon-border" icon={faMapMarkerAlt} />);
  const pinMarkerIcon = new L.DivIcon({
    html: pinIconHTML,
    iconSize: [0, 0],
    iconAnchor: [5, 10],
    className: "pin-icon",
    popupAnchor: null,
    shadowUrl: null,
    shadowSize: null,
    shadowAnchor: null
  });

  // Hook for initializing data.
  useEffect(() => {
    let unmounted = false;
    let source = axios.CancelToken.source();

    const fetchAnimals = async () => {
      setData({animals: [], isFetching: true});
      // Fetch ServiceRequest data.
      await axios.get('/animals/api/animal/?search=' + searchTerm +'&incident=' + incident, {
        cancelToken: source.token,
      })
      .then(response => {
        if (!unmounted) {
          setNumPages(Math.ceil(response.data.length / ITEMS_PER_PAGE));
          setData({animals: response.data, isFetching: false});
          setAnimals(response.data);
          let bounds_array = [];
          for (const animal of response.data) {
            if (animal.latitude && animal.longitude) {
              bounds_array.push([animal.latitude, animal.longitude]);
            }
          }
          setBounds(bounds_array.length > 0 ? L.latLngBounds(bounds_array) : L.latLngBounds([[0,0]]));

          // highlight search terms
          markInstances(searchTerm);
        }
      })
      .catch(error => {
        if (!unmounted) {
          setData({animals: [], isFetching: false});
        }
      });
    };
    fetchAnimals();

    const fetchShelters = () => {
      setShelters({options: [], isFetching: true});
      // Fetch Shelter data.
      axios.get('/shelter/api/shelter/?incident=' + incident, {
        cancelToken: source.token,
      })
      .then(response => {
        if (!unmounted) {
          let shelter_options = [];
          response.data.forEach(shelter => {
            // Build shelter option list.
            shelter_options.push({value: shelter.id, label: shelter.name});
          });
          setShelters({options: shelter_options, isFetching:false});
        }
      })
      .catch(error => {
        if (!unmounted) {
          setShelters({options: [], isFetching: false});
        }
      });
    };
    fetchShelters();
    // Cleanup.
    return () => {
      unmounted = true;
      source.cancel();
    };
  }, [searchTerm, incident]);

  // Hook handling option changes.
  useEffect(() => {
    const handleDisabled = () => {
      setIsDisabled(!(options.species || options.status || options.sex || options.owned || options.pcolor || options.fixed || options.latlng || options.shelter));
    };

    setNumPages(Math.ceil(animals.length / ITEMS_PER_PAGE));
    setPage(1);
    handleDisabled();
  }, [options, animals.length]);

  return (
    <div className="ml-2 mr-2">
      <Header>Search Animals</Header>
      <hr/>
      <Form onSubmit={handleSubmit}>
        <InputGroup className="mb-3">
          <FormControl
            type="text"
            placeholder="Search"
            name="searchTerm"
            onChange={handleChange}
            ref={tempSearchTerm}
          />
          <InputGroup.Append>
            <Button variant="outline-light" type="submit" style={{borderRadius:"0 5px 5px 0"}}>Search</Button>
          </InputGroup.Append>
          <Button variant="outline-light" className="ml-1" onClick={handleShowFilters}>Advanced {showFilters ? <FontAwesomeIcon icon={faChevronDoubleUp} size="sm" /> : <FontAwesomeIcon icon={faChevronDoubleDown} size="sm" />}</Button>
          <Button variant="outline-light" className="ml-1" onClick={handlePrintAllClick}>
            Print All ({`${animals.length}`})
            <FontAwesomeIcon icon={faPrint} className="ml-2 text-light" inverse />
          </Button>
        </InputGroup>
        <Collapse in={showFilters}>
          <div>
          <Card className="border rounded d-flex" style={{width:"100%"}}>
            <Card.Body style={{marginBottom:"-16px"}}>
              <Row>
                <Col xs={"4"}>
                  <Select
                    label="Species"
                    id="speciesDropdown"
                    name="species"
                    type="text"
                    placeholder="Select Species"
                    options={speciesChoices}
                    styles={customStyles}
                    isClearable={true}
                    ref={speciesRef}
                    onChange={(instance) => {
                      pcolorRef.current.select.clearValue();
                      setOptions({...options, species: instance ? instance.value : null, pcolor: ''});
                    }}
                  />
                  <Select
                    label="status"
                    id="statusDropdown"
                    name="Status"
                    type="text"
                    placeholder="Select Status"
                    options={statusChoices}
                    styles={customStyles}
                    isClearable={true}
                    ref={statusRef}
                    onChange={(instance) => {
                      pcolorRef.current.select.clearValue();
                      setOptions({...options, status: instance ? instance.value : null});
                    }}
                  />
                  <Select
                    label="Sex"
                    id="sexDropdown"
                    name="sex"
                    type="text"
                    placeholder="Select Sex"
                    options={sexChoices}
                    styles={customStyles}
                    isClearable={true}
                    ref={sexRef}
                    onChange={(instance) => {
                      setOptions({...options, sex: instance ? instance.value : null})
                    }}
                  />
                  <Select
                    label="Owned"
                    id="ownedDropdown"
                    name="owned"
                    type="text"
                    placeholder="Select Owned"
                    options={ownedChoices}
                    styles={customStyles}
                    isClearable={true}
                    ref={ownedRef}
                    onChange={(instance) => {
                      setOptions({...options, owned: instance ? instance.value : null})
                    }}
                  />
                  <Select
                    label="Fixed"
                    id="fixedDropdown"
                    name="fixed"
                    type="text"
                    placeholder="Select Fixed"
                    options={ownedChoices}
                    styles={customStyles}
                    isClearable={true}
                    ref={fixedRef}
                    onChange={(instance) => {
                      setOptions({...options, fixed: instance ? instance.value : null})
                    }}
                  />
                  <Select
                    label="Primary Color"
                    id="pcolorDropdown"
                    name="pcolor"
                    type="text"
                    placeholder="Select Color"
                    components={{ NoOptionsMessage }}
                    ref={pcolorRef}
                    options={Object.keys(colorChoices).includes(options.species) ? colorChoices[options.species] : colorChoices['other']}
                    styles={customStyles}
                    isClearable={true}
                    onChange={(instance) => {
                      setOptions({...options, pcolor: instance ? instance.value : ''})
                    }}
                  />
                  <Select
                    label="Shelter"
                    id="shelterDropdown"
                    name="shelter"
                    type="text"
                    placeholder="Select Shelter"
                    options={shelters.options}
                    styles={customStyles}
                    isClearable={true}
                    ref={shelterRef}
                    onChange={(instance) => {
                      setOptions({...options, shelter: instance ? instance.value : ''})
                    }}
                  />
                </Col>
                <Col xs="5">
                  <Row style={{marginBottom:"-16px"}}>
                    <Col className="border rounded pl-0 pr-0 mb-3 mr-3">
                      <Map ref={mapRef} bounds={bounds} boundsOptions={{padding:[10,10]}} onClick={updatePosition} dragging={false} keyboard={false} className="animal-search-leaflet-container" >
                        <Legend position="bottomleft" metric={false} />
                        <TileLayer
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                        />
                        {options.latlng ?
                        <span>
                        <Marker
                          position={options.latlng}
                          icon={pinMarkerIcon}
                          ref={markerRef}
                        >
                          <MapTooltip autoPan={false} direction="top">
                            <div>
                              Lat: {+(Math.round(options.latlng.lat + "e+4") + "e-4")}, Lon: {+(Math.round(options.latlng.lng + "e+4") + "e-4")}
                            </div>
                          </MapTooltip>
                        </Marker>
                        <Circle center={options.latlng} color={'#ff4c4c'} radius={options.radius * 1000} interactive={false} />
                        </span>
                        : ""}
                      </Map>
                    </Col>
                  </Row>
                  <Row className="mr-0 d-flex" style={{maxHeight:"37px"}}>
                    <Col className="flex-grow-1" style={{marginLeft:"-15px", paddingRight:"0px"}}>
                      <Select
                        label="Radius"
                        id="radiusDropdown"
                        name="radius"
                        type="text"
                        placeholder="Select radius"
                        options={radiusChoices}
                        styles={customStyles}
                        defaultValue={radiusChoices[0]}
                        isClearable={false}
                        onChange={(instance) => {
                          setOptions({...options, radius: instance ? instance.value : null});
                        }}
                      />
                    </Col>
                    <Button variant="outline-light" className="float-right" style={{maxHeight:"35px"}} onClick={clearMarker}>Clear</Button>
                  </Row>
                </Col>
                <Col className="flex-grow-1 pl-0" xs="3">
                  <Button className="btn btn-primary" style={{maxHeight:"35px", width:"100%"}} onClick={handleApplyFilters} disabled={isDisabled}>Apply</Button>
                  <Button variant="outline-light" style={{maxHeight:"35px", width:"100%", marginTop:"15px"}} onClick={handleClear}>Clear</Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
          </div>
        </Collapse>
      </Form>
      {animals.map((animal, index) => (
        <div key={animal.id} className="mt-3" hidden={page !== Math.ceil((index+1)/ITEMS_PER_PAGE)}>
          <div className="card-header">
            <h4 style={{marginBottom:"-2px",  marginLeft:"-12px"}}>
              <OverlayTrigger
                key={"animal-details"}
                placement="top"
                overlay={
                  <Tooltip id={`tooltip-animal-details`}>
                    Animal details
                  </Tooltip>
                }
              >
                <Link href={"/" + incident + "/animals/" + animal.id}><FontAwesomeIcon icon={faDotCircle} className="mr-2" inverse /></Link>
              </OverlayTrigger>
              A#{animal.id} - {animal.name ? titleCase(animal.name) : "Unknown"}&nbsp;| {titleCase(animal.status)}

              <OverlayTrigger
                key={"print"}
                placement="bottom"
                overlay={
                  <Tooltip id={`tooltip-print`}>
                    Animal care schedule
                  </Tooltip>
                }
              >
                {({ ref, ...triggerHandler }) => (
                  <Link onClick={(e) => handleDownloadPdfClick(e, animal.id)} {...triggerHandler} href="#">
                    <span ref={ref}><FontAwesomeIcon icon={faPrint} className="ml-2" inverse /></span>
                  </Link>
                )}
              </OverlayTrigger>
            </h4>
          </div>
          <CardGroup>
            <Card style={{maxWidth:"206px", maxHeight:"206px"}}>
              <Card.Body className="p-0 m-0">
                <AnimalCoverImage
                  animalSpecies={animal.species}
                  animalImageSrc={animal.front_image}
                />
              </Card.Body>
            </Card>
            <Card style={{marginBottom:"6px", maxWidth:"335px"}}>
              <Card.Body>
                <Card.Title style={{marginTop:"-9px", marginBottom:"8px"}}>Information
                  {animal.color_notes ?
                    <OverlayTrigger
                      key={"animal-color-notes"}
                      placement="top"
                      overlay={
                        <Tooltip id={`tooltip-animal-color-notes`}>
                          {animal.color_notes}
                        </Tooltip>
                      }
                    >
                      <FontAwesomeIcon icon={faClipboardList} className="ml-1" size="sm" inverse />
                    </OverlayTrigger>
                  : ""}
                  {animal.owners.length < 1 ?
                    <OverlayTrigger
                      key={"stray"}
                      placement="top"
                      overlay={
                        <Tooltip id={`tooltip-stray`}>
                          Animal is stray
                        </Tooltip>
                      }
                    >
                      <FontAwesomeIcon icon={faUserAltSlash} size="sm" className="ml-1" />
                    </OverlayTrigger> :
                  ""}
                  {animal.confined === 'yes' ?
                    <OverlayTrigger
                      key={"confined"}
                      placement="top"
                      overlay={
                        <Tooltip id={`tooltip-confined`}>
                          Animal is confined
                        </Tooltip>
                      }
                    >
                      <FontAwesomeIcon icon={faLink} size="sm" className="ml-1" />
                    </OverlayTrigger> :
                  ""}
                  {animal.aggressive === 'yes' ?
                    <OverlayTrigger
                      key={"aggressive"}
                      placement="top"
                      overlay={
                        <Tooltip id={`tooltip-aggressive`}>
                          Animal is aggressive
                        </Tooltip>
                      }
                    >
                      <FontAwesomeIcon icon={faClawMarks} size="sm" className="ml-1" />
                    </OverlayTrigger> :
                  animal.aggressive === 'no' ?
                    <OverlayTrigger
                      key={"not-aggressive"}
                      placement="top"
                      overlay={
                        <Tooltip id={`tooltip-aggressive`}>
                          Animal is not aggressive
                        </Tooltip>
                      }
                    >
                      <span className="fa-layers" style={{marginLeft:"2px"}}>
                        <FontAwesomeIcon icon={faClawMarks} size="sm" />
                        <FontAwesomeIcon icon={faBan} color="#ef5151" size="sm" transform={'shrink-2'} />
                      </span>
                    </OverlayTrigger> :
                  ""}
                  {animal.aco_required === 'yes' ?
                    <OverlayTrigger
                      key={"aco-required"}
                      placement="top"
                      overlay={
                        <Tooltip id={`tooltip-aco-required`}>
                          ACO required
                        </Tooltip>
                      }
                    >
                      <FontAwesomeIcon icon={faBadgeSheriff} size="sm" className="ml-1" />
                    </OverlayTrigger>
                  : ""}
                  {animal.injured === 'yes' ?
                    <OverlayTrigger
                      key={"injured"}
                      placement="top"
                      overlay={
                        <Tooltip id={`tooltip-injured`}>
                          Animal is injured
                        </Tooltip>
                      }
                    >
                      <FontAwesomeIcon icon={faMedkit} size="sm" className="ml-1 fa-move-up" />
                    </OverlayTrigger> :
                  animal.injured === 'no' ?
                    <OverlayTrigger
                      key={"not-injured"}
                      placement="top"
                      overlay={
                        <Tooltip id={`tooltip-injured`}>
                          Animal is not injured
                        </Tooltip>
                      }
                    >
                      <span className="fa-layers" style={{marginLeft:"2px"}}>
                        <FontAwesomeIcon icon={faMedkit} size="sm" className="fa-move-up" />
                        <FontAwesomeIcon icon={faBan} color="#ef5151" size="sm" transform={'shrink-2'} />
                      </span>
                    </OverlayTrigger> :
                  ""}
                  {animal.fixed === 'yes' ?
                    <OverlayTrigger
                      key={"fixed"}
                      placement="top"
                      overlay={
                        <Tooltip id={`tooltip-fixed`}>
                          Animal is fixed or neutered
                        </Tooltip>
                      }
                    >
                      <FontAwesomeIcon icon={faCut} size="sm" className="ml-1" />
                    </OverlayTrigger> :
                  animal.fixed === 'no' ?
                  <OverlayTrigger
                    key={"not-fixed"}
                    placement="top"
                    overlay={
                      <Tooltip id={`tooltip-fixed`}>
                        Animal is not fixed or neutered
                      </Tooltip>
                    }
                  >
                    <span className="fa-layers" style={{marginLeft:"2px"}}>
                      <FontAwesomeIcon icon={faCut} size="sm" />
                      <FontAwesomeIcon icon={faBan} color="#ef5151" size="sm" transform={'shrink-2'} />
                    </span>
                  </OverlayTrigger> :
                  ""}
                </Card.Title>
                <Scrollbar style={{height:"144px"}} renderThumbHorizontal={props => <div {...props} style={{...props.style, display: 'none'}} />}>
                  <ListGroup>
                    <ListGroup.Item>{titleCase(animal.species)}{animal.size ? <span>,&nbsp;{titleCase(animal.size)}</span> : ""}{animal.sex ? <span>,&nbsp;{titleCase(animal.sex)}</span> : ""}{animal.age ? <span>,&nbsp;{titleCase(animal.age)}</span> : ""}</ListGroup.Item>
                    <ListGroup.Item style={{textTransform:"capitalize"}}><b>Color: </b>{animal.pcolor ? <span>{animal.pcolor}{animal.scolor ? <span> / {animal.scolor}</span> : ""}</span> : "Unknown"}</ListGroup.Item>
                    {animal.owners.map(owner => (
                      <ListGroup.Item key={owner.id}>
                        <b>Owner:</b> <Link href={"/" + incident + "/people/owner/" + owner.id} className="text-link" style={{textDecoration:"none", color:"white"}}>{owner.first_name} {owner.last_name}</Link>
                        {owner.display_phone ?
                        <OverlayTrigger
                          key={"owner-phone"}
                          placement="top"
                          overlay={
                            <Tooltip id={`tooltip-owner-phone`}>
                              Phone: {owner.display_phone}
                            </Tooltip>
                          }
                        >
                          <FontAwesomeIcon icon={faPhoneRotary} className="ml-1" inverse />
                        </OverlayTrigger>
                        : ""}
                        {owner.email ?
                        <OverlayTrigger
                          key={"owner-email"}
                          placement="top"
                          overlay={
                            <Tooltip id={`tooltip-owner-email`}>
                              Email: {owner.email}
                            </Tooltip>
                          }
                        >
                          <FontAwesomeIcon icon={faEnvelope} className="ml-1" inverse />
                        </OverlayTrigger>
                        : ""}
                      </ListGroup.Item>
                    ))}
                    {animal.owners < 1 ? <ListGroup.Item><b>Owner: </b>No Owner</ListGroup.Item> : ""}
                    {animal.reporter ? <ListGroup.Item><b>Reporter: </b><Link href={"/" + incident + "/people/reporter/" + animal.reporter} className="text-link" style={{textDecoration:"none", color:"white"}}>{animal.reporter_object.first_name} {animal.reporter_object.last_name}</Link></ListGroup.Item> : ""}
                  </ListGroup>
                </Scrollbar>
              </Card.Body>
            </Card>
            <Card style={{marginBottom:"6px"}}>
              <Card.Body>
              <Card.Title style={{marginTop:"-9px", marginBottom:"8px"}}>Location</Card.Title>
                <ListGroup>
                  <ListGroup.Item className='request'><b>Service Request: </b>{animal.request ? <Link href={"/" + incident + "/hotline/servicerequest/" + animal.request} className="text-link" style={{textDecoration:"none", color:"white"}}>{animal.request_address}</Link> : "None"}</ListGroup.Item>
                  <ListGroup.Item><b>Shelter: </b>{animal.shelter ? <Link href={"/" + incident + "/shelter/" + animal.shelter} className="text-link" style={{textDecoration:"none", color:"white"}}>{animal.shelter_object.name}</Link> : "None"}
                    {animal.shelter ?
                    <span>
                      <OverlayTrigger
                        key={"animal-intake-date"}
                        placement="top"
                        overlay={
                          <Tooltip id={`tooltip-animal-intake-date`}>
                            Intake Date: <Moment format="MMMM Do YYYY HH:mm">{animal.intake_date}</Moment>
                          </Tooltip>
                        }
                      >
                        <FontAwesomeIcon icon={faCalendarDay} className="ml-1" inverse />
                      </OverlayTrigger>
                      {animal.shelter_object.phone ?
                      <OverlayTrigger
                        key={"animal-shelter-phone"}
                        placement="top"
                        overlay={
                          <Tooltip id={`tooltip-animal-shelter-phone`}>
                            Phone: {animal.shelter_object.display_phone}
                          </Tooltip>
                        }
                      >
                        <FontAwesomeIcon icon={faPhoneRotary} className="ml-1" inverse />
                      </OverlayTrigger>
                      : ""}
                      <OverlayTrigger
                        key={"animal-shelter-address"}
                        placement="top"
                        overlay={
                          <Tooltip id={`tooltip-animal-shelter-address`}>
                            Address: {animal.shelter_object.full_address}
                          </Tooltip>
                        }
                      >
                        <FontAwesomeIcon icon={faClipboardList} className="ml-1" inverse />
                      </OverlayTrigger>
                    </span>
                    : ""}
                  </ListGroup.Item>
                  {animal.room ? <ListGroup.Item><b>Room: </b><Link href={"/" + incident + "/shelter/room/" + animal.room} className="text-link" style={{textDecoration:"none", color:"white"}}>{animal.room_name}</Link></ListGroup.Item> : ""}
                </ListGroup>
              </Card.Body>
            </Card>
          </CardGroup>
          </div>
      ))}
      <p style={{marginTop:"15px"}}>{data.isFetching ? 'Fetching Animals...' : <span>{animals.length === 0 ? 'No animals found.' : ''}</span>}</p>
      <Pagination className="custom-page-links" size="lg" onClick={(e) => {setFocus(parseInt(e.target.innerText));setPage(parseInt(e.target.innerText))}}>
        {[...Array(numPages).keys()].map(x =>
        <Pagination.Item key={x+1} active={x+1 === page}>
          {x+1}
        </Pagination.Item>)
        }
      </Pagination>
    </div>
  )
}

export default AnimalSearch;
