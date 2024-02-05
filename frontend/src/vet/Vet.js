import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { Link, navigate } from 'raviger';
import { Button, Card, Col, ListGroup, OverlayTrigger, Row, Tooltip } from 'react-bootstrap';
import L from "leaflet";
import { Marker, Tooltip as MapTooltip } from "react-leaflet";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faPlusSquare } from '@fortawesome/free-solid-svg-icons';
import Header from '../components/Header';
import Map, { vetShelterMarkerIcon } from "../components/Map";
import Scrollbar from '../components/Scrollbars';
import { AuthContext } from "../accounts/AccountsReducer";
import { SystemErrorContext } from '../components/SystemError';
import TreatmentCard from "./components/TreatmentCard";
import DiagnosticCard from './components/DiagnosticCard';
import ProcedureCard from './components/ProcedureCard';

function Vet({ incident, organization }) {

  const { dispatch, state } = useContext(AuthContext);
  const { setShowSystemError } = useContext(SystemErrorContext);

  const [data, setData] = useState({vet_requests:[], treatments:[], diagnostics:[], procedures:[], isFetching: true});
  const [shelterData, setShelterData] = useState({shelters:[], bounds:L.latLngBounds([[0,0]])});
  const [selectedShelter, setSelectedShelter] = useState('all');
  const [shelterAnimals, setShelterAnimals] = useState({});
  const [activeOrders, setActiveOrders] = useState("pending");

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
          setShelterData({shelters: shelterResponse.data, bounds:bounds.length > 0 ? bounds : L.latLngBounds([[0,0]])});
          let track_ids = [];
          let shelter_animals = {};
          const [vetResponse, treatmentResponse, diagnosticResponse, procedureResponse] = await Promise.all([
            axios.get('/vet/api/vetrequest/?incident=' + incident + '&today=true'),
            axios.get('/vet/api/treatmentrequest/?incident=' + incident + '&today=true'),
            axios.get('/vet/api/diagnosticresults/?incident=' + incident + '&today=true'),
            axios.get('/vet/api/procedureresults/?incident=' + incident + '&today=true')
          ]);
          treatmentResponse.data.forEach(treatment => {
            if (!track_ids.includes(treatment.animal_object.id) && (treatment.animal_object.shelter === null || shelterResponse.data.map(shelter => shelter.id).includes(treatment.animal_object.shelter))) {
              track_ids.push(treatment.animal_object.id);
              if (Object.keys(shelter_animals).includes(treatment.animal_object.shelter)) {
                shelter_animals[treatment.animal_object.shelter].push(treatment.animal_object);
              }
              else {
                shelter_animals[treatment.animal_object.shelter] = [treatment.animal_object];
              }
            }
          });
          
          diagnosticResponse.data.forEach(diagnostic => {
            if (!track_ids.includes(diagnostic.animal_object.id) && (diagnostic.animal_object.shelter === null || shelterResponse.data.map(shelter => shelter.id).includes(diagnostic.animal_object.shelter))) {
              track_ids.push(diagnostic.animal_object.id);
              if (Object.keys(shelter_animals).includes(diagnostic.animal_object.shelter)) {
                shelter_animals[diagnostic.animal_object.shelter].push(diagnostic.animal_object);
              }
              else {
                shelter_animals[diagnostic.animal_object.shelter] = [diagnostic.animal_object];
              }
            }
          });

          procedureResponse.data.forEach(procedure => {
            if (!track_ids.includes(procedure.animal_object.id) &&  (procedure.animal_object.shelter === null || shelterResponse.data.map(shelter => shelter.id).includes(procedure.animal_object.shelter))) {
              track_ids.push(procedure.animal_object.id);
              if (Object.keys(shelter_animals).includes(procedure.animal_object.shelter)) {
                shelter_animals[procedure.animal_object.shelter].push(procedure.animal_object);
              }
              else {
                shelter_animals[procedure.animal_object.shelter] = [procedure.animal_object];
              }
            }
          });

          setData({vet_requests:vetResponse.data, treatments:treatmentResponse.data, diagnostics:diagnosticResponse.data, procedures:procedureResponse.data, isFetching: false});
          setShelterAnimals(shelter_animals);
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

  return (
    <>
    <Header>Veterinary</Header>
    <hr/>
    <Row className="ml-0 mr-0 pl-0 pr-0" style={{marginBottom:"-1px"}}>
      <Col xs={10} className="border rounded pl-0 pr-0">
        {shelterData.shelters.length ?
          <Map bounds={shelterData.bounds} className="landing-leaflet-container">
            {shelterData.shelters.filter(shelter => shelter.id === selectedShelter || selectedShelter === 'all' ? shelter : null).map((shelter, index) => (
              <Marker
                key={shelter.id}
                position={[shelter.latitude, shelter.longitude]}
                icon={vetShelterMarkerIcon}
                onClick={() => navigate('/' + organization + "/" + incident + "/shelter/" + shelter.id)}
              >
                <MapTooltip key={`${index}-${selectedShelter}`} keepInView={false} autoPan={false} permanent={selectedShelter === shelter.id ? true : false}>
                  <span>
                    <div>{shelter.name} - {shelter.animal_count} Animal{shelter.animal_count === 1 ? "" :"s"}</div>
                    <div>Address: {shelter.full_address}</div>
                    {shelter.phone ? <div>Phone: {shelter.display_phone}</div> : ""}
                  </span>
                </MapTooltip>
              </Marker>
            ))}
          </Map>
        :
          <Card className="text-center" style={{height:"450px", marginRight:"-1px", paddingTop:"225px", fontSize:"30px"}}>{data.isFetching ? "Fetching" : "No"} Shelters.</Card>
        }
      </Col>
      <Col xs={2} className="ml-0 mr-0 pl-0 pr-0 border rounded">
        <Scrollbar no_shadow="true" style={{height:"450px"}} renderThumbHorizontal={props => <div {...props} style={{...props.style, display: 'none'}} />}>
          <Button variant={selectedShelter === 'all' ? "primary" : "secondary"} className="border" onClick={() => setSelectedShelter('all')} style={{maxHeight:"36px", width:"100%", marginTop:"-1px"}}>All</Button>
          {shelterData.shelters.map(shelter => (
            <Button key={shelter.id} title={shelter.name} variant={shelter.id === selectedShelter ? "primary" : "secondary"} className="border" onClick={() => setSelectedShelter(selectedShelter === shelter.id ? null : shelter.id)} style={{maxHeight:"36px", width:"100%", marginTop:"-1px"}}>
              {shelter.name}
            </Button>
          ))}
          <Button variant={selectedShelter === null ? "primary" : "secondary"} className="border" onClick={() => setSelectedShelter(null)} style={{maxHeight:"36px", width:"100%", marginTop:"-1px"}}>Field</Button>
        </Scrollbar>
      </Col>
    </Row>
    <Row className="ml-0 mr-0 border rounded" style={{maxHeight:"38px"}}>
      <h5 className="card-header" style={{paddingTop:"7px", paddingLeft:"10px", paddingRight:"10px", height:"36px", width:"100%", backgroundColor:"#808080"}}>Shelters</h5>
    </Row>
    <hr/>
    <div className="row mb-2">
      <div className="col-12 d-flex">
        <Card className="mb-2 border rounded" style={{width:"100%", height:"685px"}}>
          <Card.Body style={{marginBottom:""}}>
            <Card.Title style={{marginTop:"-2px", marginBottom:"20px"}}>
              <h4 className="mb-0">
                <ListGroup horizontal style={{marginBottom:"-20px"}}>
                  <ListGroup.Item active={"pending" === activeOrders} className="text-center" style={{textTransform:"capitalize", cursor:'pointer', paddingLeft:"5px", paddingRight:"5px"}} onClick={() => setActiveOrders("pending")}>
                    <div style={{marginTop:"-3px", marginLeft:"-1px", paddingLeft:"10px", paddingRight:"10px"}}>
                      All Pending ({data.treatments.filter(tr => tr.animal_object.shelter === selectedShelter || (selectedShelter === 'all'  && Object.keys(shelterAnimals).includes(String(tr.animal_object.shelter)))).length + data.diagnostics.filter(diagnostic => diagnostic.animal_object.shelter === selectedShelter || (selectedShelter === 'all'  && Object.keys(shelterAnimals).includes(String(diagnostic.animal_object.shelter)))).length + data.procedures.filter(procedure => procedure.animal_object.shelter === selectedShelter || (selectedShelter === 'all'  && Object.keys(shelterAnimals).includes(String(procedure.animal_object.shelter)))).length})
                    </div>
                  </ListGroup.Item>
                  <ListGroup.Item active={"treatments" === activeOrders} className="text-center" style={{textTransform:"capitalize", cursor:'pointer', paddingLeft:"5px", paddingRight:"5px"}} onClick={() => setActiveOrders("treatments")}>
                    <div style={{marginTop:"-3px", marginLeft:"-1px", paddingLeft:"10px", paddingRight:"10px"}}>
                      Treatments ({data.treatments.filter(treatment => treatment.animal_object.shelter === selectedShelter || (selectedShelter === 'all' && Object.keys(shelterAnimals).includes(String(treatment.animal_object.shelter)))).length})
                      {activeOrders === 'treatments' ? <OverlayTrigger
                        key={"add-treatment"}
                        placement="top"
                        overlay={
                          <Tooltip id={`tooltip-add-treatment`}>
                            Add a treatment for this patient
                          </Tooltip>
                        }
                      >
                        <Link href={"/" + organization + "/" + incident + "/vet/medrecord/" + data.id + "/treatment/new"}><FontAwesomeIcon icon={faPlusSquare} className="ml-1" inverse /></Link>
                      </OverlayTrigger> : ""}
                    </div>
                  </ListGroup.Item>
                  <ListGroup.Item active={"diagnostics" === activeOrders} className="text-center" style={{textTransform:"capitalize", cursor:'pointer', paddingLeft:"5px", paddingRight:"5px"}} onClick={() => setActiveOrders("diagnostics")}>
                    <div style={{marginTop:"-3px", marginLeft:"-1px", paddingLeft:"10px", paddingRight:"10px"}}>
                      Diagnostics ({data.diagnostics.filter(diagnostic => diagnostic.animal_object.shelter === selectedShelter  || (selectedShelter === 'all' && Object.keys(shelterAnimals).includes(String(diagnostic.animal_object.shelter)))).length})
                      {activeOrders === 'diagnostics' ? <OverlayTrigger
                        key={"order-diagnostic"}
                        placement="top"
                        overlay={
                          <Tooltip id={`tooltip-order-diagnostic`}>
                            Order diagnostics for this patient
                          </Tooltip>
                        }
                      >
                        <Link href={"/" + organization + "/" + incident + "/vet/medrecord/" + data.id + "/diagnostics"}><FontAwesomeIcon icon={faPlusSquare} className="ml-1" inverse /></Link>
                      </OverlayTrigger> : ""}
                    </div>
                  </ListGroup.Item>
                  <ListGroup.Item active={"procedures" === activeOrders} className="text-center" style={{textTransform:"capitalize", cursor:'pointer', paddingLeft:"5px", paddingRight:"5px"}} onClick={() => setActiveOrders("procedures")}>
                    <div style={{marginTop:"-3px", marginLeft:"-1px", paddingLeft:"10px", paddingRight:"10px"}}>
                      Procedures ({data.procedures.filter(procedure => procedure.animal_object.shelter === selectedShelter || (selectedShelter === 'all' && Object.keys(shelterAnimals).includes(String(procedure.animal_object.shelter)))).length})
                      {activeOrders === 'procedures' ? <OverlayTrigger
                        key={"order-procedure"}
                        placement="top"
                        overlay={
                          <Tooltip id={`tooltip-order-procedure`}>
                            Order procedures for this patient
                          </Tooltip>
                        }
                      >
                        <Link href={"/" + organization + "/" + incident + "/vet/medrecord/" + data.id + "/procedures"}><FontAwesomeIcon icon={faPlusSquare} className="ml-1" inverse /></Link>
                      </OverlayTrigger> : ""}
                    </div>
                  </ListGroup.Item>
                </ListGroup>
              </h4>
            </Card.Title>
            <hr />
            <Scrollbar no_shadow="true" style={{height:"564px", minHeight:"564px"}} renderView={props => <div {...props} style={{...props.style, overflowX:"hidden", marginBottom:"-10px"}}/>}  renderThumbHorizontal={props => <div {...props} style={{...props.style, display: 'none'}} />}>
            {activeOrders === 'pending' && data.treatments.filter(treatment => treatment.animal_object.shelter === selectedShelter || (selectedShelter === 'all' && Object.keys(shelterAnimals).includes(String(treatment.animal_object.shelter)))).map(treatment_request => (
              <TreatmentCard incident={incident} organization={organization} treatment_request={treatment_request} />
            ))}
            {activeOrders === 'pending' && data.diagnostics.filter(diagnostic => diagnostic.animal_object.shelter === selectedShelter || (selectedShelter === 'all'  && Object.keys(shelterAnimals).includes(String(diagnostic.animal_object.shelter)))).map(diagnostic => (
              <DiagnosticCard incident={incident} organization={organization} diagnostic={diagnostic} />
            ))}
            {activeOrders === 'pending' && data.procedures.filter(procedure => procedure.animal_object.shelter === selectedShelter || (selectedShelter === 'all'  && Object.keys(shelterAnimals).includes(String(procedure.animal_object.shelter)))).map(procedure => (
              <ProcedureCard incident={incident} organization={organization} procedure={procedure} />
            ))}
            {activeOrders === 'treatments' && data.treatments.filter(treatment => treatment.animal_object.shelter === selectedShelter || (selectedShelter === 'all'  && Object.keys(shelterAnimals).includes(String(treatment.animal_object.shelter)))).map(treatment_request => (
              <TreatmentCard incident={incident} organization={organization} treatment_request={treatment_request} />
            ))}
            {activeOrders === 'treatments' && data.treatments.filter(treatment => treatment.animal_object.shelter === selectedShelter || (selectedShelter === 'all'  && Object.keys(shelterAnimals).includes(String(treatment.animal_object.shelter)))).length < 1 ? <p>No treatments have been created for this patient.</p> : ""}
            {activeOrders === 'diagnostics' && data.diagnostics.filter(diagnostic => diagnostic.animal_object.shelter === selectedShelter || (selectedShelter === 'all'  && Object.keys(shelterAnimals).includes(String(diagnostic.animal_object.shelter)))).map(diagnostic => (
              <DiagnosticCard incident={incident} organization={organization} diagnostic={diagnostic} />
            ))}
            {activeOrders === 'diagnostics' && data.diagnostics.filter(diagnostic => diagnostic.animal_object.shelter === selectedShelter || (selectedShelter === 'all'  && Object.keys(shelterAnimals).includes(String(diagnostic.animal_object.shelter)))).length < 1 ? <p>No diagnostics have been ordered for this patient.</p> : ""}
            {activeOrders === 'procedures' && data.procedures.filter(procedure => procedure.animal_object.shelter === selectedShelter || (selectedShelter === 'all'  && Object.keys(shelterAnimals).includes(String(procedure.animal_object.shelter)))).map(procedure => (
              <ProcedureCard incident={incident} organization={organization} procedure={procedure} />
            ))}
            {activeOrders === 'procedures' && data.procedures.filter(procedure => procedure.animal_object.shelter === selectedShelter || (selectedShelter === 'all'  && Object.keys(shelterAnimals).includes(String(procedure.animal_object.shelter)))).length < 1 ? <p>No procedures have been ordered for this patient.</p> : ""}
            </Scrollbar>
          </Card.Body>
        </Card>
      </div>
    </div>
    </>
  )
}

export default Vet
