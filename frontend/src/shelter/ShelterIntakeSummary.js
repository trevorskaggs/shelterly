import React, { useContext, useEffect, useState } from 'react';
import axios from "axios";
import { Link } from 'raviger';
import { Card, Col, ListGroup, Row } from 'react-bootstrap';
import Moment from 'react-moment';
import Header from '../components/Header';
import { SystemErrorContext } from '../components/SystemError';
import AnimalCards from '../components/AnimalCards';
import ShelterlyPrintifyButton from '../components/ShelterlyPrintifyButton';
import {
  printIntakeSummaryAnimalCareSchedules,
  printOwnerDetails,
  printIntakeSummary
} from "./Utils";

function ShelterIntakeSummary({ id, incident }) {

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

  const handlePrintOwnerClick = () =>
    printOwnerDetails(data.person_object);

  const handlePrintAllAnimalsClick = () =>
    printIntakeSummaryAnimalCareSchedules(data.animal_objects, id);

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
    // Cleanup.
    return () => {
      unmounted = true;
      source.cancel();
    };
  }, [id, incident]);

  return (
    <>
      <Header>
        {data.intake_type === "owner_walkin"
          ? "Owner Walk-In "
          : data.intake_type === "reporter_walkin"
          ? "Reporter Walk-In "
          : "Dispatch "}
        Intake Summary

        {data.person_object && data.animal_objects?.length ? (
          <ShelterlyPrintifyButton
            id="dispatch-assignment"
            spinnerSize={2}
            tooltipPlacement='bottom'
            tooltipText='Print Intake Summary'
            printFunc={handlePrintIntakeSummary}
          />
        ): null}
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
                  <b>Shelter:</b> <Link href={"/" + incident + "/shelter/" + data.shelter} className="text-link" style={{textDecoration:"none", color:"white"}}>{data.shelter_name}</Link>
                </ListGroup.Item>
                <ListGroup.Item>
                  <b>Date:</b> <Moment format="MMMM Do YYYY HH:mm">{data.date}</Moment>
                </ListGroup.Item>
                {data.intake_type === 'owner_walkin' ?
                  <ListGroup.Item>
                    <b>Owner:</b>{' '}
                    <Link
                      href={"/" + incident + "/people/owner/" + data.person}
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
                  <b>Reporter:</b> <Link href={"/" + incident + "/people/reporter/" + data.person} className="text-link" style={{textDecoration:"none", color:"white"}}>{data.person_object.first_name} {data.person_object.last_name}</Link>
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
            <AnimalCards animals={data.animal_objects} show_owner={true} incident={"/" + incident} />
            {data.animals.length < 1 ? <p>No animals were intaken.</p> : ""}
          </Card.Body>
        </Card>
      </div>
    </div>
    </>
  );
};

export default ShelterIntakeSummary;
