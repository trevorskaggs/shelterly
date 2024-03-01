import React, { useContext, useEffect, useState } from 'react';
import axios from "axios";
import { Link } from 'raviger';
import { Card, Col, ListGroup, Row } from 'react-bootstrap';
import Moment from 'react-moment';
import Header from '../components/Header';
import { SystemErrorContext } from '../components/SystemError';
import AnimalCards from '../components/AnimalCards';
import ShelterlyPrintifyButton from '../components/ShelterlyPrintifyButton';
import { useLocationWithRoutes } from '../hooks';
import {
  printIntakeSummaryAnimalCareSchedules,
  printOwnerDetails,
  printAllOwnersDetails,
  printIntakeSummary
} from './Utils';

function ShelterIntakeSummary({ id, incident, organization }) {
  const { setShowSystemError } = useContext(SystemErrorContext);
  const [data, setData] = useState({
    id: '',
    shelter: '',
    shelter_name: '',
    intake_type: '',
    date: '',
    animals: [],
    animal_objects: [],
    person: null,
    person_object: {first_name:'', last_name:''}
  });
  const [organizationData, setOrganizationData] = useState({
    name: '',
    short_name: '',
    liability_name: '',
    liability_short_name: '',
  });
  const [animalOwners, setAnimalOwners] = useState([]);
  const { getFullLocationFromPath } = useLocationWithRoutes();

  function buildAnimalUrl(animal) {
    return getFullLocationFromPath(`/${organization}/${incident}/animals/${animal.id}`)
  }

  const handlePrintOwnerClick = () =>
    printOwnerDetails(data.person_object, organizationData);

  const handlePrintAnimalOwnersClick = () =>
    printAllOwnersDetails(animalOwners, organizationData);

  const handlePrintAllAnimalsClick = () => {
    const animals = data.animal_objects.map((animal) => ({
      ...animal,
      url: buildAnimalUrl(animal)
    }));
    return printIntakeSummaryAnimalCareSchedules(animals, id);
  }

  const handlePrintIntakeSummary = async () =>
    printIntakeSummary(data);

  // Hook for initializing data.
  useEffect(() => {
    let unmounted = false;
    let source = axios.CancelToken.source();

    const fetchIntakeSummaryData = async () => {
      // Fetch intake summary data.
      await axios.get('/shelter/api/intakesummary/' + id + '/?incident=' + incident, {
        cancelToken: source.token,
      })
      .then(response => {
        if (!unmounted) {
          setData(response.data);
        }
      })
      .catch(error => {
        if (!unmounted) {
          setShowSystemError(true);
        }
      });
    };
    fetchIntakeSummaryData();

    const fetchOrganizationData = async () => {
      // Fetch Organization data.
      await axios.get('/incident/api/organization/', {
        cancelToken: source.token,
      })
      .then(response => {
        if (!unmounted) {
          setOrganizationData(response.data[0]);
        }
      })
      .catch(error => {
        if (!unmounted) {
          setShowSystemError(true);
        }
      });
    };
    fetchOrganizationData();

    // Cleanup.
    return () => {
      unmounted = true;
      source.cancel();
    };
  }, [id, incident]);

  useEffect(() => {
    const ownersFromAnimals = [];

    data?.animal_objects?.forEach?.((animal) => {
      animal.owners?.forEach?.((owner) => {
        const foundOwner = ownersFromAnimals.find(({ id }) => id === owner.id);
        if (!foundOwner) {
          ownersFromAnimals.push({
            ...owner,
            animals: data.animal_objects.filter(
              (a) => !!a.owners.find(({ id }) => id === owner.id)
            ),
          });
        }
      });
    });

    setAnimalOwners(ownersFromAnimals);
  }, [data]);

  return (
    <>
      <Header>
        {data.intake_type === "owner_walkin"
          ? "Owner Walk-In "
          : data.intake_type === "reporter_walkin"
          ? "Reporter Walk-In "
          : "Dispatch "}
        Intake Summary
      </Header>
      <hr />
      <Row className="d-flex">
        <Col>
          <Card className="border rounded d-flex" style={{width:"100%", height: "100%"}}>
            <Card.Body>
              <Card.Title>
                <h4>Information</h4>
              </Card.Title>
              <hr/>
              <ListGroup variant="flush" style={{marginTop:"-13px", marginBottom:"-13px"}}>
                <ListGroup.Item>
                  <b>Shelter:</b> <Link href={"/" + organization + "/" + incident + "/shelter/" + data.shelter} className="text-link" style={{textDecoration:"none", color:"white"}}>{data.shelter_name}</Link>
                </ListGroup.Item>
                <ListGroup.Item>
                  <b>Date:</b> <Moment format="MMMM Do YYYY HH:mm">{data.date}</Moment>
                </ListGroup.Item>
                {data.intake_type === 'owner_walkin' ?
                  <ListGroup.Item>
                    <b>Owner:</b>{' '}
                    <Link
                      href={"/" + organization + "/" + incident + "/people/owner/" + data.person}
                      className="text-link"
                      style={{textDecoration:"none", color:"white"}}
                    >
                      {data.person_object.first_name}
                      {' '}
                      {data.person_object.last_name}
                    </Link>
                    <ShelterlyPrintifyButton
                      id="dispatch-assignment-owner"
                      spinnerSize={0.8}
                      tooltipPlacement='top'
                      tooltipText='Print Owner Details'
                      printFunc={handlePrintOwnerClick}
                    />
                  </ListGroup.Item>
                : data.intake_type === 'reporter_walkin' ?
                <ListGroup.Item>
                  <b>Reporter:</b> <Link href={"/" + organization + "/" + incident + "/people/reporter/" + data.person} className="text-link" style={{textDecoration:"none", color:"white"}}>{data.person_object.first_name} {data.person_object.last_name}</Link>
                </ListGroup.Item>
                : animalOwners.length ?
                  <ListGroup.Item>
                    <b>Owner(s):</b>{' '}
                    {animalOwners.map((owner, i) => (
                      <span key={`owner-${owner.id}`}>{owner.first_name} {owner.last_name}{i < animalOwners.length - 1 ? ', ' : ' '}</span>
                    ))}
                    <ShelterlyPrintifyButton
                      id="dispatch-assignment-all-owners"
                      spinnerSize={0.8}
                      tooltipPlacement='top'
                      tooltipText='Print All Owners'
                      printFunc={handlePrintAnimalOwnersClick}
                    />
                  </ListGroup.Item>
                : ""}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <div className="row mt-3">
      <div className="col-12 d-flex">
        <Card className="mb-2 border rounded" style={{width:"100%"}}>
          <Card.Body style={{marginBottom:"-17px"}}>
            <Card.Title>
              <h4 className="mb-0">Animals ({data.animals.length})
                {data.animals?.length > 0 && (
                  <ShelterlyPrintifyButton
                    id="dispatch-assignment-animal-care-schedules"
                    spinnerSize={1.5}
                    tooltipPlacement='top'
                    tooltipText='Print All Animal Care Schedules'
                    printFunc={handlePrintAllAnimalsClick}
                  />
                )}
              </h4>
            </Card.Title>
            <hr/>
            <AnimalCards animals={data.animal_objects} show_owner={true} organization={organization} incident={"/" + incident} />
            {data.animals.length < 1 ? <p>No animals were intaken.</p> : ""}
          </Card.Body>
        </Card>
      </div>
    </div>
    </>
  );
};

export default ShelterIntakeSummary;
