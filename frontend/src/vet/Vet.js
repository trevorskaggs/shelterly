import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { Link, navigate, useQueryParams } from 'raviger';
import { Button, ButtonGroup, Card, Col, ListGroup, OverlayTrigger, Row, Tooltip } from 'react-bootstrap';
import Moment from 'react-moment';
import L from "leaflet";
import { Marker, Tooltip as MapTooltip } from "react-leaflet";
import DataTable from 'react-data-table-component';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckSquare,
} from '@fortawesome/free-solid-svg-icons';
import { faQuestionCircle as faQuestionCircleDuo, faChevronCircleDown, faChevronCircleUp } from '@fortawesome/pro-duotone-svg-icons';
import { faSquareExclamation, faSquareX, faUserDoctorMessage } from '@fortawesome/pro-solid-svg-icons';
import Header from '../components/Header';
import Map, { vetPendingAnimalLocationMarkerIcon, vetShelterMarkerIcon } from "../components/Map";
import Scrollbar from '../components/Scrollbars';
import { AuthContext } from "../accounts/AccountsReducer";
import { SystemErrorContext } from '../components/SystemError';
import TreatmentCard from "./components/TreatmentCard";
import DiagnosticCard from './components/DiagnosticCard';
import ProcedureCard from './components/ProcedureCard';

function Vet({ incident, organization }) {

  const { dispatch, state } = useContext(AuthContext);
  const { setShowSystemError } = useContext(SystemErrorContext);

  // Identify any query param data.
  const [queryParams] = useQueryParams();
  const {
    tab = 'all',
  } = queryParams;

  const [data, setData] = useState({vet_requests:[], treatments:[], diagnostics:[], procedures:[], isFetching: true});
  const [reportData, setReportData] = useState([]);
  const [shelterData, setShelterData] = useState({shelters:[]});
  const [selectedShelter, setSelectedShelter] = useState('all');
  const [animalData, setAnimalData] = useState({});
  const [shelterAnimals, setShelterAnimals] = useState({'Field':[]});
  const [activeOrders, setActiveOrders] = useState(tab);

  // Hook for initializing data.
  useEffect(() => {
    let unmounted = false;
    let source = axios.CancelToken.source();

    const fetchData = async () => {
      // Fetch Shelter data.
      await axios.get('/shelter/api/shelter/?incident=' + incident + '&organization=' + organization + '&training=' + state.incident.training + '&medical=true', {
        cancelToken: source.token,
      })
      .then(async (shelterResponse) => {
        if (!unmounted) {

          let animal_data = {}
          const [vetResponse, treatmentResponse, diagnosticResponse, procedureResponse] = await Promise.all([
            axios.get('/vet/api/vetrequest/?incident=' + incident + '&today=true'),
            axios.get('/vet/api/treatmentrequest/?incident=' + incident + '&today=true'),
            axios.get('/vet/api/diagnosticresults/?incident=' + incident + '&today=true'),
            axios.get('/vet/api/procedureresults/?incident=' + incident + '&today=true')
          ]);

          let vet_request_count = {'avian':0, 'cat':0, 'dog':0, 'camelid':0, 'small mammal':0, 'reptile/amphibian':0, 'equine':0, 'ruminant':0, 'swine':0, 'other':0};
          vetResponse.data.forEach(vet_request => {
            if (Object.keys(animal_data).includes(String(vet_request.animal_object.id))) {
              animal_data[vet_request.animal_object.id]['vet_request'] = animal_data[vet_request.animal_object.id]['vet_request'] + 1;
            }
            else {
              animal_data[vet_request.animal_object.id] = vet_request.animal_object;
              animal_data[vet_request.animal_object.id]['vet_request'] = 1;
            }
            vet_request_count[vet_request.animal_object.category] += 1;
            // if (!track_ids.includes(vet_request.animal_object.id) && (vet_request.animal_object.shelter === null || shelterResponse.data.map(shelter => shelter.id).includes(vet_request.animal_object.shelter))) {
            //   track_ids.push(vet_request.animal_object.id);
            //   let loc = vet_request.animal_object.shelter;
            //   if (!loc) {
            //     loc = 'Field';
            //     if (vet_request.animal_object.request_lat_lon) {
            //       bounds.push([vet_request.animal_object.request_lat_lon[0], vet_request.animal_object.request_lat_lon[1]]);
            //     }
            //     else if (vet_request.animal_object.latitude) {
            //       bounds.push([vet_request.animal_object.latitude, vet_request.animal_object.longitude]);
            //     }
            //   }
            // }
          })
          let treatment_count = {'avian':0, 'cat':0, 'dog':0, 'camelid':0, 'small mammal':0, 'reptile/amphibian':0, 'equine':0, 'ruminant':0, 'swine':0, 'other':0};
          let track_plans = [];
          treatmentResponse.data.forEach(treatment => {
            if (!track_plans.includes(treatment.treatment_plan)) {
              if (Object.keys(animal_data).includes(String(treatment.animal_object.id))){
                animal_data[treatment.animal_object.id]['treatment'] = (animal_data[treatment.animal_object.id]['treatment'] ? animal_data[treatment.animal_object.id]['treatment'] : 0) + 1;
              }
              else {
                animal_data[treatment.animal_object.id] = treatment.animal_object;
                animal_data[treatment.animal_object.id]['treatment'] = 1;
              }
              treatment_count[treatment.animal_object.category] += 1;
              track_plans.push(treatment.treatment_plan)
              // if (!track_ids.includes(treatment.animal_object.id) && (treatment.animal_object.shelter === null || shelterResponse.data.map(shelter => shelter.id).includes(treatment.animal_object.shelter))) {
              //   track_ids.push(treatment.animal_object.id);
              //   let loc = treatment.animal_object.shelter
              //   if (!loc) {
              //     loc = 'Field';
              //     if (treatment.animal_object.latitude) {
              //       bounds.push([treatment.animal_object.latitude, treatment.animal_object.longitude]);
              //     }
              //   }
              // }
            }
          });
          let diagnostic_count = {'avian':0, 'cat':0, 'dog':0, 'camelid':0, 'small mammal':0, 'reptile/amphibian':0, 'equine':0, 'ruminant':0, 'swine':0, 'other':0};
          diagnosticResponse.data.forEach(diagnostic => {
            if (Object.keys(animal_data).includes(String(diagnostic.animal_object.id))){
              animal_data[diagnostic.animal_object.id]['diagnostic'] = (animal_data[diagnostic.animal_object.id]['diagnostic'] ? animal_data[diagnostic.animal_object.id]['diagnostic'] : 0) + 1;
            }
            else {
              animal_data[diagnostic.animal_object.id] = diagnostic.animal_object;
              animal_data[diagnostic.animal_object.id]['diagnostic'] = 1;
            }
            diagnostic_count[diagnostic.animal_object.category] += 1;
            // if (!track_ids.includes(diagnostic.animal_object.id) && (diagnostic.animal_object.shelter === null || shelterResponse.data.map(shelter => shelter.id).includes(diagnostic.animal_object.shelter))) {
            //   track_ids.push(diagnostic.animal_object.id);
            //   let loc = diagnostic.animal_object.shelter
            //   if (!loc) {
            //     loc = 'Field';
            //     if (diagnostic.animal_object.latitude) {
            //       bounds.push([diagnostic.animal_object.latitude, diagnostic.animal_object.longitude]);
            //     }
            //   }
            // }
          });
          let procedure_count = {'avian':0, 'cat':0, 'dog':0, 'camelid':0, 'small mammal':0, 'reptile/amphibian':0, 'equine':0, 'ruminant':0, 'swine':0, 'other':0};
          procedureResponse.data.forEach(procedure => {
            if (Object.keys(animal_data).includes(String(procedure.animal_object.id))){
              animal_data[procedure.animal_object.id]['procedure'] = (animal_data[procedure.animal_object.id]['procedure'] ? animal_data[procedure.animal_object.id]['procedure'] : 0) + 1;
            }
            else {
              animal_data[procedure.animal_object.id] = procedure.animal_object;
              animal_data[procedure.animal_object.id]['procedure'] = 1;
            }
            procedure_count[procedure.animal_object.category] += 1;
            // if (!track_ids.includes(procedure.animal_object.id) && (procedure.animal_object.shelter === null || shelterResponse.data.map(shelter => shelter.id).includes(procedure.animal_object.shelter))) {
            //   track_ids.push(procedure.animal_object.id);
            //   let loc = procedure.animal_object.shelter
            //   if (!loc) {
            //     loc = 'Field';
            //     if (procedure.animal_object.latitude) {
            //       bounds.push([procedure.animal_object.latitude, procedure.animal_object.longitude]);
            //     }
            //   }
            // }
          });

          let report_data = Object.keys(vet_request_count).filter(key => vet_request_count[key] + treatment_count[key] + diagnostic_count[key] + procedure_count[key] > 0).map(key => ({'species':key, 'vet_requests':vet_request_count[key], 'treatments':treatment_count[key], 'diagnostics':diagnostic_count[key], 'procedures':procedure_count[key], 'total':vet_request_count[key] + treatment_count[key] + diagnostic_count[key] + procedure_count[key]}));
          let total = {'species':'total', 'vet_requests':report_data.reduce((a,v) => a = a + v.vet_requests, 0), 'treatments':report_data.reduce((a,v) => a = a + v.treatments, 0), 'diagnostics':report_data.reduce((a,v) => a = a + v.diagnostics, 0), 'procedures':report_data.reduce((a,v) => a = a + v.procedures, 0), 'total':report_data.reduce((a,v) => a = a + v.vet_requests, 0) + report_data.reduce((a,v) => a = a + v.treatments, 0) + report_data.reduce((a,v) => a = a + v.diagnostics, 0) + report_data.reduce((a,v) => a = a + v.procedures, 0)}
          report_data.push(total)
          setReportData(report_data);

          setData({vet_requests:vetResponse.data, treatments:treatmentResponse.data, diagnostics:diagnosticResponse.data, procedures:procedureResponse.data, isFetching: false});
          setAnimalData(animal_data);
          setShelterData({shelters: shelterResponse.data});
        }
      })
      .catch(error => {
        if (!unmounted) {
          setShelterData({shelters: []});
          setShowSystemError(true);
        }
      });
    };

    fetchData();

    // Cleanup.
    return () => {
      unmounted = true;
      source.cancel();
    };
  }, [incident, organization]);

  const vet_columns = [
    {
      name: 'Species',
      selector: row => row.species ? row.species[0].toUpperCase() + row.species.slice(1) :  row.species,
    },
    {
      name: 'Vet Requests',
      selector: row => row.vet_requests,
    },
    {
      name: 'Treatments',
      selector: row => row.treatments,
    },
    {
      name: 'Diagnostics',
      selector: row => row.diagnostics,
    },
    {
      name: 'Procedures',
      selector: row => row.procedures,
    },
  ];

  return (
    <>
    <Header>Veterinary</Header>
    <hr/>
    <DataTable
      columns={vet_columns}
      data={reportData}
      title={'Daily Veterinary Tasks'}
      striped
      className="vetTable"
      noDataComponent={!data.isFetching ? <div style={{padding:"24px"}}>There are currently no tasks for today</div> : <div style={{padding:"24px"}}>Fetching daily veterinary task data...</div>}
    />
    {/* <Row className="ml-0 mr-0 pl-0 pr-0 mt-3" style={{marginBottom:"-1px"}}>
      <Col xs={10} className="border rounded pl-0 pr-0">
        {shelterData.shelters.length ?
          <Map bounds={shelterData.bounds} className="landing-leaflet-container">
            {shelterData.shelters.filter(shelter => (selectedAnimal.shelter === shelter.id) || (shelter.id === selectedShelter || selectedShelter === 'all' ? shelter : null)).map((shelter, index) => (
              <Marker
                key={shelter.id}
                position={[shelter.latitude, shelter.longitude]}
                icon={vetShelterMarkerIcon}
                // onClick={() => navigate('/' + organization + "/" + incident + "/shelter/" + shelter.id)}
              >
                <MapTooltip key={`${index}-${selectedShelter}`} keepInView={false} autoPan={false} permanent={selectedShelter === shelter.id || selectedAnimal.shelter === shelter.id ? true : false}>
                  <span>
                    <div>{shelter.name} - {shelter.animal_count} Animal{shelter.animal_count === 1 ? "" :"s"}</div>
                    <div>Address: {shelter.full_address}</div>
                    {shelter.phone ? <div>Phone: {shelter.display_phone}</div> : ""}
                  </span>
                </MapTooltip>
              </Marker>
            ))}
            {shelterAnimals['Field'].filter(animal => (selectedAnimal.id && selectedAnimal.shelter === null) || (selectedShelter === 'all' || selectedShelter === null)).map((animal, index) => (
              <Marker
                key={animal.id}
                position={animal.request_lat_lon ? animal.request_lat_lon : animal.latitude ?  [animal.latitude, animal.longitude] : [0,0]}
                icon={vetPendingAnimalLocationMarkerIcon}
                // onClick={() => navigate('/' + organization + "/" + incident + "/shelter/" + shelter.id)}
              >
                <MapTooltip key={`${index}-${selectedShelter}`} keepInView={false} autoPan={false} permanent={selectedAnimal.id === animal.id || selectedShelter === null ? true : false}>
                  <span>
                    <div>{animal.name || 'Unknown'} - {animal.species}</div>
                    <div>Address: {animal.request_address || animal.found_location}</div>
                  </span>
                </MapTooltip>
              </Marker>
            ))}
          </Map>
        :
          <Card className="text-center" style={{height:"450px", marginRight:"-1px", paddingTop:"225px", fontSize:"30px"}}>{data.isFetching ? "Fetching" : "No"} Veterinary Locations.</Card>
        }
      </Col>
      <Col xs={2} className="ml-0 mr-0 pl-0 pr-0 border rounded">
        <Scrollbar no_shadow="true" style={{height:"450px"}} renderThumbHorizontal={props => <div {...props} style={{...props.style, display: 'none'}} />}>
          <Button variant={selectedShelter === 'all' ? "primary" : "secondary"} className="border" onClick={() => {setSelectedShelter('all');setSelectedAnimal({id:null, shelter:'null'});}} style={{maxHeight:"36px", width:"100%", marginTop:"-1px"}}>All</Button>
          {shelterData.shelters.map(shelter => (
            <Button key={shelter.id} title={shelter.name} variant={shelter.id === selectedShelter ? "primary" : "info"} className="border" onClick={() => {setSelectedShelter(shelter.id); setSelectedAnimal({id:null, shelter:'null'});}} style={{maxHeight:"36px", width:"100%", marginTop:"-1px"}}>
              {shelter.name} {shelter.id === selectedShelter || shelter.id === selectedAnimal.shelter ? <FontAwesomeIcon icon={faChevronCircleDown} size="sm" /> : <FontAwesomeIcon icon={faChevronCircleUp} size="sm" />}
            </Button>
          ))}
          {(selectedShelter || selectedAnimal.id) && shelterAnimals[selectedAnimal.id ? selectedAnimal.shelter : selectedShelter] && shelterAnimals[selectedAnimal.id ? selectedAnimal.shelter : selectedShelter].map((animal) => (
            <Button key={animal.id} title={animal.name} variant={animal.id === selectedAnimal.id ? "primary" : "secondary"} className="border" onClick={() => {setSelectedAnimal({id:animal.id, shelter:animal.shelter}); setSelectedShelter('test');}} style={{maxHeight:"36px", width:"100%", marginTop:"-1px"}}>
              A#{animal.id_for_incident}
            </Button>
          ))}
          <Button variant={selectedShelter === null ? "primary" : "info"} className="border" onClick={() => {setSelectedShelter(null);setSelectedAnimal({id:null, shelter:'null'});}} style={{maxHeight:"36px", width:"100%", marginTop:"-1px"}}>Field {null === selectedShelter || (selectedAnimal.id && selectedAnimal.shelter === null) ? <FontAwesomeIcon icon={faChevronCircleDown} size="sm" /> : <FontAwesomeIcon icon={faChevronCircleUp} size="sm" />}</Button>
          {(selectedShelter === null || (selectedAnimal.id && selectedAnimal.shelter === null)) && shelterAnimals['Field'] && shelterAnimals['Field'].map((animal) => (
            <Button key={animal.id} title={animal.name} variant={animal.id === selectedAnimal.id ? "primary" : "secondary"} className="border" onClick={() => {setSelectedAnimal({id:animal.id, shelter:animal.shelter}); setSelectedShelter('test');}} style={{maxHeight:"36px", width:"100%", marginTop:"-1px"}}>
              A#{animal.id_for_incident}
            </Button>
          ))}
        </Scrollbar>
      </Col>
    </Row>
    <Row className="ml-0 mr-0 border rounded" style={{maxHeight:"38px"}}>
      <h5 className="card-header" style={{paddingTop:"7px", paddingLeft:"10px", paddingRight:"10px", height:"36px", width:"100%", backgroundColor:"#808080"}}>Veterinary Locations</h5>
    </Row> */}
    <hr/>
    <div className="row mb-2">
      <div className="col-12 d-flex">
        <Card className="mb-2 border rounded" style={{width:"100%"}}>
          <Card.Body style={{marginBottom:""}}>
            <Card.Title style={{marginTop:"-2px", marginBottom:"-10px"}}>
            <h4>
              <Row className="d-flex ml-0 mr-0 mt-1 mb-3 border rounded">
                <ButtonGroup className="hide-scrollbars" style={{whiteSpace:"nowrap", overflow:"auto"}}>
                  <Button variant={selectedShelter === 'all' ? "primary" : "secondary"} className="border" onClick={() => {setSelectedShelter('all');}} style={{maxHeight:"36px", width:"100%", marginTop:"-1px", marginBottom:"-1px", marginLeft:"-1px"}}>All</Button>
                  {shelterData.shelters.map(shelter => (
                    <Button key={shelter.id} title={shelter.name} variant={shelter.id === selectedShelter ? "primary" : "secondary"} className="border" onClick={() => {setSelectedShelter(shelter.id);}} style={{maxHeight:"36px", width:"100%", marginTop:"-1px", marginBottom:"-1px"}}>
                      {shelter.name}
                    </Button>
                  ))}
                  <Button variant={selectedShelter === 'Field' ? "primary" : "secondary"} className="border" onClick={() => {setSelectedShelter('Field');}} style={{maxHeight:"36px", width:"100%", marginTop:"-1px", marginBottom:"-1px"}}>Field</Button>
                </ButtonGroup>
              </Row>
            </h4>
            </Card.Title>
          </Card.Body>
        </Card>
      </div>
    </div>
    <div className="row mb-2">
      <div className="col-12 d-flex">
        <Card className="mb-2 border rounded" style={{width:"100%", height:"385px"}}>
          <Card.Body style={{marginBottom:""}}>
            <Card.Title style={{marginTop:"-2px", marginBottom:"20px"}}>
              <h4 className="mb-0">
                Animals Requiring Treatment
              </h4>
            </Card.Title>
            <hr />
            <Scrollbar no_shadow="true" style={{height:"264px", minHeight:"264px"}} renderView={props => <div {...props} style={{...props.style, overflowX:"hidden", marginBottom:"-10px"}}/>}  renderThumbHorizontal={props => <div {...props} style={{...props.style, display: 'none'}} />}>
            {Object.keys(animalData).filter(animal_id => selectedShelter === 'Field' ? animalData[animal_id].shelter === null : selectedShelter !== 'all' ? animalData[animal_id].shelter === selectedShelter : animal_id).map((animal_id) => (
              <Link href={"/" + organization + "/" + incident + "/vet/medrecord/" + animalData[animal_id].medical_record} style={{color:"white"}}>
                <div className="mt-1 mb-1" style={{}}>
                  <div className="card-header rounded">
                    {/* {service_request.injured ?
                    <OverlayTrigger
                      key={"injured"}
                      placement="top"
                      overlay={
                        <Tooltip id={`tooltip-injured`}>
                          Injured animal
                        </Tooltip>
                      }
                    >
                      <FontAwesomeIcon icon={faBandAid} className="ml-1"/>
                    </OverlayTrigger>
                    : ""} */}
                    A#{animalData[animal_id].id_for_incident} - {animalData[animal_id].animal_count === 1 ? <span>{animalData[animal_id].name || 'Unknown'} | <span style={{textTransform:'capitalize'}}>{animalData[animal_id].species_string}</span></span> : <span>{animalData[animal_id].animal_count} <span style={{textTransform:"capitalize"}}>{animalData[animal_id].species_string}</span>{animalData[animal_id].animal_count > 1 && !["sheep", "cattle"].includes(animalData[animal_id].species_string) ? "s" : ""}</span>} |&nbsp;
                    {animalData[animal_id].shelter_object ? animalData[animal_id].shelter_object['name'] : 'Field'} |&nbsp;
                    {animalData[animal_id].vet_request ? <span>{animalData[animal_id].vet_request} Vet Request{animalData[animal_id].vet_request > 1 ? "s" : ""}</span> : ""}
                    {animalData[animal_id].treatment ? <span>{animalData[animal_id].vet_request ? ", " : ""}{animalData[animal_id].treatment} Treatment{animalData[animal_id].treatment > 1 ? "s" : ""}</span> : ""}
                    {animalData[animal_id].diagnostic ? <span>{(animalData[animal_id].vet_request || animalData[animal_id].treatment) ? ", " : ""}{animalData[animal_id].diagnostic} Diagnostic{animalData[animal_id].diagnostic > 1 ? "s" : ""}</span> : ""}
                    {animalData[animal_id].procedure ? <span>{(animalData[animal_id].vet_request || animalData[animal_id].treatment || animalData[animal_id].diagnostic) ? ", " : ""}{animalData[animal_id].procedure} Procedure{animalData[animal_id].procedure > 1 ? "s" : ""}</span> : ""}
                  </div>
                </div>
                </Link>
            ))}
            </Scrollbar>
          </Card.Body>
        </Card>
      </div>
    </div>
    </>
  )
}

export default Vet
