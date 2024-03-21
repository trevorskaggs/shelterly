import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { Link, navigate, useQueryParams } from 'raviger';
import { Button, Card, Col, ListGroup, OverlayTrigger, Row, Tooltip } from 'react-bootstrap';
import L from "leaflet";
import { Marker, Tooltip as MapTooltip } from "react-leaflet";
import DataTable from 'react-data-table-component';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle as faQuestionCircleDuo, faChevronCircleDown, faChevronCircleUp } from '@fortawesome/pro-duotone-svg-icons';
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
    tab = 'pending',
  } = queryParams;

  const [data, setData] = useState({vet_requests:[], treatments:[], diagnostics:[], procedures:[], isFetching: true});
  const [reportData, setReportData] = useState([]);
  const [shelterData, setShelterData] = useState({shelters:[], bounds:L.latLngBounds([[0,0]])});
  const [selectedShelter, setSelectedShelter] = useState('all');
  const [selectedAnimal, setSelectedAnimal] = useState({id:null, shelter:'null'});
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
          const bounds = [];
          for (const shelter of shelterResponse.data) {
            bounds.push([shelter.latitude, shelter.longitude]);
          }

          let track_ids = [];
          let shelter_animals = {'Field':[]};
          const [vetResponse, treatmentResponse, diagnosticResponse, procedureResponse] = await Promise.all([
            axios.get('/vet/api/vetrequest/?incident=' + incident + '&today=true'),
            axios.get('/vet/api/treatmentrequest/?incident=' + incident + '&today=true'),
            axios.get('/vet/api/diagnosticresults/?incident=' + incident + '&today=true'),
            axios.get('/vet/api/procedureresults/?incident=' + incident + '&today=true')
          ]);

          let vet_request_count = {'avian':0, 'cat':0, 'dog':0, 'camelid':0, 'small_mammal':0, 'reptile/amphibian':0, 'equine':0, 'ruminant':0, 'swine':0, 'other':0};
          vetResponse.data.forEach(vet_request => {
            vet_request_count[vet_request.animal_object.category] += 1;
          })
          let treatment_count = {'avian':0, 'cat':0, 'dog':0, 'camelid':0, 'small_mammal':0, 'reptile/amphibian':0, 'equine':0, 'ruminant':0, 'swine':0, 'other':0};
          treatmentResponse.data.forEach(treatment => {
            treatment_count[treatment.animal_object.category] += 1;
            if (!track_ids.includes(treatment.animal_object.id) && (treatment.animal_object.shelter === null || shelterResponse.data.map(shelter => shelter.id).includes(treatment.animal_object.shelter))) {
              track_ids.push(treatment.animal_object.id);
              let loc = treatment.animal_object.shelter
              if (!loc) {
                loc = 'Field';
                bounds.push([treatment.animal_object.latitude, treatment.animal_object.longitude]);
              }
              if (Object.keys(shelter_animals).includes(loc)) {
                shelter_animals[loc].push(treatment.animal_object);
              }
              else {
                shelter_animals[loc] = [treatment.animal_object];
              }
            }
          });
          let diagnostic_count = {'avian':0, 'cat':0, 'dog':0, 'camelid':0, 'small_mammal':0, 'reptile/amphibian':0, 'equine':0, 'ruminant':0, 'swine':0, 'other':0};
          diagnosticResponse.data.forEach(diagnostic => {
            diagnostic_count[diagnostic.animal_object.category] += 1;
            if (!track_ids.includes(diagnostic.animal_object.id) && (diagnostic.animal_object.shelter === null || shelterResponse.data.map(shelter => shelter.id).includes(diagnostic.animal_object.shelter))) {
              track_ids.push(diagnostic.animal_object.id);
              let loc = diagnostic.animal_object.shelter
              if (!loc) {
                loc = 'Field';
                bounds.push([diagnostic.animal_object.latitude, diagnostic.animal_object.longitude]);
              }
              if (Object.keys(shelter_animals).includes(loc)) {
                shelter_animals[loc].push(diagnostic.animal_object);
              }
              else {
                shelter_animals[loc] = [diagnostic.animal_object];
              }
            }
          });
          let procedure_count = {'avian':0, 'cat':0, 'dog':0, 'camelid':0, 'small_mammal':0, 'reptile/amphibian':0, 'equine':0, 'ruminant':0, 'swine':0, 'other':0};
          procedureResponse.data.forEach(procedure => {
            procedure_count[procedure.animal_object.category] += 1;
            if (!track_ids.includes(procedure.animal_object.id) && (procedure.animal_object.shelter === null || shelterResponse.data.map(shelter => shelter.id).includes(procedure.animal_object.shelter))) {
              track_ids.push(procedure.animal_object.id);
              let loc = procedure.animal_object.shelter
              if (!loc) {
                loc = 'Field';
                bounds.push([procedure.animal_object.latitude, procedure.animal_object.longitude]);
              }
              if (Object.keys(shelter_animals).includes(loc)) {
                shelter_animals[loc].push(procedure.animal_object);
              }
              else {
                shelter_animals[loc] = [procedure.animal_object];
              }
            }
          });

          let report_data = Object.keys(vet_request_count).filter(key => vet_request_count[key] + treatment_count[key] + diagnostic_count[key] + procedure_count[key] > 0).map(key => ({'species':key, 'vet_requests':vet_request_count[key], 'treatments':treatment_count[key], 'diagnostics':diagnostic_count[key], 'procedures':procedure_count[key], 'total':vet_request_count[key] + treatment_count[key] + diagnostic_count[key] + procedure_count[key]}));
          let total = {'species':'total', 'vet_requests':report_data.reduce((a,v) => a = a + v.vet_requests, 0), 'treatments':report_data.reduce((a,v) => a = a + v.treatments, 0), 'diagnostics':report_data.reduce((a,v) => a = a + v.diagnostics, 0), 'procedures':report_data.reduce((a,v) => a = a + v.procedures, 0), 'total':report_data.reduce((a,v) => a = a + v.vet_requests, 0) + report_data.reduce((a,v) => a = a + v.treatments, 0) + report_data.reduce((a,v) => a = a + v.diagnostics, 0) + report_data.reduce((a,v) => a = a + v.procedures, 0)}
          report_data.push(total)
          setReportData(report_data);

          setData({vet_requests:vetResponse.data, treatments:treatmentResponse.data, diagnostics:diagnosticResponse.data, procedures:procedureResponse.data, isFetching: false});
          setShelterAnimals(shelter_animals);
          setShelterData({shelters: shelterResponse.data, bounds:bounds.length > 0 ? bounds : L.latLngBounds([[0,0]])});
        }
      })
      .catch(error => {
        if (!unmounted) {
          setShelterData({shelters: [], bounds:L.latLngBounds([[0,0]])});
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
    {
      name: 'Total',
      selector: row => row.total,
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
    <Row className="ml-0 mr-0 pl-0 pr-0 mt-3" style={{marginBottom:"-1px"}}>
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
                position={[animal.latitude, animal.longitude]}
                icon={vetPendingAnimalLocationMarkerIcon}
                // onClick={() => navigate('/' + organization + "/" + incident + "/shelter/" + shelter.id)}
              >
                <MapTooltip key={`${index}-${selectedShelter}`} keepInView={false} autoPan={false} permanent={selectedAnimal.id === animal.id || selectedShelter === null ? true : false}>
                  <span>
                    <div>{animal.name || 'Unknown'} - {animal.species}</div>
                    <div>Address: {animal.request_address || animal.found_location}</div>
                    {/* {animal.phone ? <div>Phone: {animal.display_phone}</div> : ""} */}
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
              A#{animal.id}
            </Button>
          ))}
          <Button variant={selectedShelter === null ? "primary" : "info"} className="border" onClick={() => {setSelectedShelter(null);setSelectedAnimal({id:null, shelter:'null'});}} style={{maxHeight:"36px", width:"100%", marginTop:"-1px"}}>Field {null === selectedShelter || (selectedAnimal.id && selectedAnimal.shelter === null) ? <FontAwesomeIcon icon={faChevronCircleDown} size="sm" /> : <FontAwesomeIcon icon={faChevronCircleUp} size="sm" />}</Button>
          {(selectedShelter === null || (selectedAnimal.id && selectedAnimal.shelter === null)) && shelterAnimals['Field'] && shelterAnimals['Field'].map((animal) => (
            <Button key={animal.id} title={animal.name} variant={animal.id === selectedAnimal.id ? "primary" : "secondary"} className="border" onClick={() => {setSelectedAnimal({id:animal.id, shelter:animal.shelter}); setSelectedShelter('test');}} style={{maxHeight:"36px", width:"100%", marginTop:"-1px"}}>
              A#{animal.id}
            </Button>
          ))}
        </Scrollbar>
      </Col>
    </Row>
    <Row className="ml-0 mr-0 border rounded" style={{maxHeight:"38px"}}>
      <h5 className="card-header" style={{paddingTop:"7px", paddingLeft:"10px", paddingRight:"10px", height:"36px", width:"100%", backgroundColor:"#808080"}}>Veterinary Locations</h5>
    </Row>
    <hr/>
    <div className="row mb-2">
      <div className="col-12 d-flex">
        <Card className="mb-2 border rounded" style={{width:"100%"}}>
          <Card.Body style={{marginBottom:""}}>
            <Card.Title style={{marginTop:"-2px", marginBottom:"-10px"}}>
            <h4><b>Selected:</b>&nbsp;
              {selectedShelter === 'all' ? 'All' : ''}
              {selectedShelter === null ? 'Field' : ''}
              {shelterData.shelters.filter(shelter => (shelter.id === selectedShelter)).map(shelter => (<span className="mb-0">{shelter.name} - {shelter.address}</span>))}
              {selectedAnimal.id && selectedAnimal.shelter !== null && shelterAnimals[selectedAnimal.shelter].filter(animal => (animal.id === selectedAnimal.id)).map(animal => (<span className="mb-0">A#{animal.id} - {animal.request_address || animal.found_location}</span>))}
              {shelterAnimals['Field'].filter(animal => (selectedAnimal.id && selectedAnimal.shelter === null)).map(animal => (<span className="mb-0">A#{animal.id} - {animal.request_address || animal.found_location}</span>))}
            </h4>
            </Card.Title>
          </Card.Body>
        </Card>
      </div>
    </div>
    <div className="row mb-2">
      <div className="col-12 d-flex">
        <Card className="mb-2 border rounded" style={{width:"100%", height:"685px"}}>
          <Card.Body style={{marginBottom:""}}>
            <Card.Title style={{marginTop:"-2px", marginBottom:"20px"}}>
              <h4 className="mb-0">
                <ListGroup horizontal style={{marginBottom:"-20px"}}>
                  <ListGroup.Item active={"pending" === activeOrders} className="text-center" style={{textTransform:"capitalize", cursor:'pointer', paddingLeft:"5px", paddingRight:"5px"}} onClick={() => setActiveOrders("pending")}>
                    <div style={{marginTop:"-3px", marginLeft:"-1px", paddingLeft:"10px", paddingRight:"10px"}}>
                      All Pending ({data.treatments.filter(tr => tr.animal_object.id === selectedAnimal.id || tr.animal_object.shelter === selectedShelter || (selectedShelter === 'all' && (!tr.animal_object.shelter || Object.keys(shelterAnimals).includes(String(tr.animal_object.shelter))))).length + data.diagnostics.filter(diagnostic => diagnostic.animal_object.id === selectedAnimal.id || diagnostic.animal_object.shelter === selectedShelter || (selectedShelter === 'all'  && (!diagnostic.animal_object.shelter || Object.keys(shelterAnimals).includes(String(diagnostic.animal_object.shelter))))).length + data.procedures.filter(procedure => procedure.animal_object.id === selectedAnimal.id || procedure.animal_object.shelter === selectedShelter || (selectedShelter === 'all'  && (!procedure.animal_object.shelter || Object.keys(shelterAnimals).includes(String(procedure.animal_object.shelter))))).length})
                    </div>
                  </ListGroup.Item>
                  <ListGroup.Item active={"treatments" === activeOrders} className="text-center" style={{textTransform:"capitalize", cursor:'pointer', paddingLeft:"5px", paddingRight:"5px"}} onClick={() => setActiveOrders("treatments")}>
                    <div style={{marginTop:"-3px", marginLeft:"-1px", paddingLeft:"10px", paddingRight:"10px"}}>
                      Treatments ({data.treatments.filter(treatment => treatment.animal_object.id === selectedAnimal.id || treatment.animal_object.shelter === selectedShelter || (selectedShelter === 'all' && (!treatment.animal_object.shelter || Object.keys(shelterAnimals).includes(String(treatment.animal_object.shelter))))).length})
                    </div>
                  </ListGroup.Item>
                  <ListGroup.Item active={"diagnostics" === activeOrders} className="text-center" style={{textTransform:"capitalize", cursor:'pointer', paddingLeft:"5px", paddingRight:"5px"}} onClick={() => setActiveOrders("diagnostics")}>
                    <div style={{marginTop:"-3px", marginLeft:"-1px", paddingLeft:"10px", paddingRight:"10px"}}>
                      Diagnostics ({data.diagnostics.filter(diagnostic => diagnostic.animal_object.id === selectedAnimal.id || diagnostic.animal_object.shelter === selectedShelter  || (selectedShelter === 'all' && (!diagnostic.animal_object.shelter || Object.keys(shelterAnimals).includes(String(diagnostic.animal_object.shelter))))).length})
                    </div>
                  </ListGroup.Item>
                  <ListGroup.Item active={"procedures" === activeOrders} className="text-center" style={{textTransform:"capitalize", cursor:'pointer', paddingLeft:"5px", paddingRight:"5px"}} onClick={() => setActiveOrders("procedures")}>
                    <div style={{marginTop:"-3px", marginLeft:"-1px", paddingLeft:"10px", paddingRight:"10px"}}>
                      Procedures ({data.procedures.filter(procedure => procedure.animal_object.id === selectedAnimal.id || procedure.animal_object.shelter === selectedShelter || (selectedShelter === 'all' && (!procedure.animal_object.shelter || Object.keys(shelterAnimals).includes(String(procedure.animal_object.shelter))))).length})
                    </div>
                  </ListGroup.Item>
                </ListGroup>
              </h4>
            </Card.Title>
            <hr />
            <Scrollbar no_shadow="true" style={{height:"564px", minHeight:"564px"}} renderView={props => <div {...props} style={{...props.style, overflowX:"hidden", marginBottom:"-10px"}}/>}  renderThumbHorizontal={props => <div {...props} style={{...props.style, display: 'none'}} />}>
            {activeOrders === 'pending' && data.treatments.filter(treatment => treatment.animal_object.id === selectedAnimal.id || treatment.animal_object.shelter === selectedShelter || (selectedShelter === 'all' && (!treatment.animal_object.shelter || Object.keys(shelterAnimals).includes(String(treatment.animal_object.shelter))))).map(treatment_request => (
              <TreatmentCard key={treatment_request.id} incident={incident} organization={organization} treatment_request={treatment_request} animal_object={treatment_request.animal_object} />
            ))}
            {activeOrders === 'pending' && data.diagnostics.filter(diagnostic => diagnostic.animal_object.id === selectedAnimal.id || diagnostic.animal_object.shelter === selectedShelter || (selectedShelter === 'all' && (!diagnostic.animal_object.shelter || Object.keys(shelterAnimals).includes(String(diagnostic.animal_object.shelter))))).map(diagnostic => (
              <DiagnosticCard key={diagnostic.id} incident={incident} organization={organization} diagnostic={diagnostic} animal_object={diagnostic.animal_object} />
            ))}
            {activeOrders === 'pending' && data.procedures.filter(procedure => procedure.animal_object.id === selectedAnimal.id || procedure.animal_object.shelter === selectedShelter || (selectedShelter === 'all' && (!procedure.animal_object.shelter || Object.keys(shelterAnimals).includes(String(procedure.animal_object.shelter))))).map(procedure => (
              <ProcedureCard key={procedure.id} incident={incident} organization={organization} procedure={procedure} animal_object={procedure.animal_object} />
            ))}
            {activeOrders === 'treatments' && data.treatments.filter(treatment => treatment.animal_object.id === selectedAnimal.id || treatment.animal_object.shelter === selectedShelter || (selectedShelter === 'all' && (!treatment.animal_object.shelter || Object.keys(shelterAnimals).includes(String(treatment.animal_object.shelter))))).map(treatment_request => (
              <TreatmentCard key={treatment_request.id} incident={incident} organization={organization} treatment_request={treatment_request} animal_object={treatment_request.animal_object} />
            ))}
            {activeOrders === 'treatments' && data.treatments.filter(treatment => treatment.animal_object.id === selectedAnimal.id || treatment.animal_object.shelter === selectedShelter || (selectedShelter === 'all' && (!treatment.animal_object.shelter || Object.keys(shelterAnimals).includes(String(treatment.animal_object.shelter))))).length < 1 ? <p>No treatments have been created for this patient.</p> : ""}
            {activeOrders === 'diagnostics' && data.diagnostics.filter(diagnostic => diagnostic.animal_object.id === selectedAnimal.id || diagnostic.animal_object.shelter === selectedShelter || (selectedShelter === 'all' && (!diagnostic.animal_object.shelter || Object.keys(shelterAnimals).includes(String(diagnostic.animal_object.shelter))))).map(diagnostic => (
              <DiagnosticCard key={diagnostic.id} incident={incident} organization={organization} diagnostic={diagnostic} animal_object={diagnostic.animal_object} />
            ))}
            {activeOrders === 'diagnostics' && data.diagnostics.filter(diagnostic => diagnostic.animal_object.id === selectedAnimal.id || diagnostic.animal_object.shelter === selectedShelter || (selectedShelter === 'all' && (!diagnostic.animal_object.shelter || Object.keys(shelterAnimals).includes(String(diagnostic.animal_object.shelter))))).length < 1 ? <p>No diagnostics have been ordered for this patient.</p> : ""}
            {activeOrders === 'procedures' && data.procedures.filter(procedure => procedure.animal_object.id === selectedAnimal.id || procedure.animal_object.shelter === selectedShelter || (selectedShelter === 'all' && (!procedure.animal_object.shelter || Object.keys(shelterAnimals).includes(String(procedure.animal_object.shelter))))).map(procedure => (
              <ProcedureCard key={procedure.id} incident={incident} organization={organization} procedure={procedure} animal_object={procedure.animal_object} />
            ))}
            {activeOrders === 'procedures' && data.procedures.filter(procedure => procedure.animal_object.id === selectedAnimal.id || procedure.animal_object.shelter === selectedShelter || (selectedShelter === 'all' && (!procedure.animal_object.shelter || Object.keys(shelterAnimals).includes(String(procedure.animal_object.shelter))))).length < 1 ? <p>No procedures have been ordered for this patient.</p> : ""}
            
            {/* {activeOrders === 'treatments' && data.treatments.filter(treatment => treatment.animal_object.id === selectedAnimal.id).map(treatment_request => (
              <TreatmentCard key={treatment_request.id} incident={incident} organization={organization} treatment_request={treatment_request} />
            ))}
            {activeOrders === 'treatments' && data.treatments.filter(treatment => treatment.animal_object.id === selectedAnimal.id).length < 1 ? <p>No treatments have been created for this patient.</p> : ""}
            {activeOrders === 'diagnostics' && data.diagnostics.filter(diagnostic => diagnostic.animal_object.id === String(selectedAnimal.id) || (selectedShelter === 'all' && (!diagnostic.animal_object.shelter || Object.keys(shelterAnimals).includes(String(diagnostic.animal_object.shelter))))).map(diagnostic => (
              <DiagnosticCard key={diagnostic.id} incident={incident} organization={organization} diagnostic={diagnostic} />
            ))}
            {activeOrders === 'diagnostics' && data.diagnostics.filter(diagnostic => diagnostic.animal_object.id === String(selectedAnimal.id) || (selectedShelter === 'all' && (!diagnostic.animal_object.shelter || Object.keys(shelterAnimals).includes(String(diagnostic.animal_object.shelter))))).length < 1 ? <p>No diagnostics have been ordered for this patient.</p> : ""}
            {activeOrders === 'procedures' && data.procedures.filter(procedure => procedure.animal_object.id === String(selectedAnimal.id) || (selectedShelter === 'all' && (!procedure.animal_object.shelter || Object.keys(shelterAnimals).includes(String(procedure.animal_object.shelter))))).map(procedure => (
              <ProcedureCard key={procedure.id} incident={incident} organization={organization} procedure={procedure} />
            ))}
            {activeOrders === 'procedures' && data.procedures.filter(procedure => procedure.animal_object.id === String(selectedAnimal.id) || (selectedShelter === 'all' && (!procedure.animal_object.shelter || Object.keys(shelterAnimals).includes(String(procedure.animal_object.shelter))))).length < 1 ? <p>No procedures have been ordered for this patient.</p> : ""} */}
            </Scrollbar>
          </Card.Body>
        </Card>
      </div>
    </div>
    </>
  )
}

export default Vet
