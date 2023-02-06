import React, { useContext, useEffect, useState } from 'react';
import axios from "axios";
import { Link } from 'raviger';
import { Card, Col, ListGroup, OverlayTrigger, Row, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPrint
} from '@fortawesome/free-solid-svg-icons';
import Moment from 'react-moment';
import Header from '../components/Header';
import { SystemErrorContext } from '../components/SystemError';
import AnimalCards from '../components/AnimalCards';
import { printRoomAnimalCareSchedules } from './Utils';

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

  const handlePrintAllAnimalsClick = (e) => {
    e.preventDefault();

    printRoomAnimalCareSchedules(data.animals, id);
  }

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
      {data.intake_type === 'owner_walkin' ? 'Owner Walk-In ' : data.intake_type === 'reporter_walkin' ? 'Reporter Walk-In ' : 'Dispatch '}Intake Summary
      </Header>
      <hr/>
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
                  <b>Owner:</b> <Link href={"/" + incident + "/people/owner/" + data.person} className="text-link" style={{textDecoration:"none", color:"white"}}>{data.person_object.first_name} {data.person_object.last_name}</Link>
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
                  <OverlayTrigger
                    key={"printall"}
                    placement="top"
                    overlay={
                      <Tooltip id={`tooltip-printall`}>
                        Print all animal care schedules
                      </Tooltip>
                    }
                  >
                    <FontAwesomeIcon icon={faPrint} onClick={handlePrintAllAnimalsClick} style={{cursor:'pointer'}} className="ml-1 fa-move-up" size="sm" inverse />
                  </OverlayTrigger>
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
