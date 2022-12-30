import React, { useContext, useEffect, useState } from 'react';
import axios from "axios";
import { Link, navigate } from 'raviger';
import { Button, Card, ListGroup, Modal, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEdit,
  faPlusSquare
} from '@fortawesome/free-solid-svg-icons';
import Header from '../components/Header';
import { SystemErrorContext } from '../components/SystemError';

function VetRequestDetails({ id, incident }) {

  const { setShowSystemError } = useContext(SystemErrorContext);

  const priorityText = {urgent:'Urgent', when_available:'When Available'};

  const [data, setData] = useState({id: '', patient:{}, assignee:{}, open: '', assigned:'', closed: '', concern: '', priority: '', diagnosis: '', treatment_plans:[], presenting_complaints:[], animal_object: {id:'', name:'', species:'', sex:'', age:'', size:'', pcolor:'', scolor:'', medical_notes:''}});

  // Hook for initializing data.
  useEffect(() => {
    let unmounted = false;
    let source = axios.CancelToken.source();

    const fetchVetRequestData = async () => {
      // Fetch Room Details data.
      await axios.get('/vet/api/vetrequest/' + id + '/?incident=' + incident, {
          cancelToken: source.token,
      })
      .then(response => {
        if (!unmounted) {
          setData(response.data);
          console.log(response.data)
        }
      })
      .catch(error => {
        setShowSystemError(true);
      });
    };
    fetchVetRequestData();
    // Cleanup.
    return () => {
      unmounted = true;
      source.cancel();
    };
  }, [id, incident]);

  return (
    <>
    <Header>
      Vet Request Details
      <OverlayTrigger
        key={"edit-vet-request"}
        placement="bottom"
        overlay={
          <Tooltip id={`tooltip-edit-vet-request`}>
            Update vet request
          </Tooltip>
        }
      >
        <Link href={"/" + incident + "/vet/vetrequest/edit/" + id}><FontAwesomeIcon icon={faEdit} className="ml-1" inverse /></Link>
      </OverlayTrigger>
    </Header>
    <hr/>
    <div className="row">
      <div className="col-6 d-flex">
        <Card className="border rounded d-flex" style={{width:"100%"}}>
          <Card.Body>
            <Card.Title>
              <h4>Information</h4>
            </Card.Title>
            <hr/>
            <ListGroup variant="flush" style={{marginTop:"-13px", marginBottom:"-13px"}}>
              <ListGroup.Item>
                <div className="row">
                  <span className="col-6"><b>ID: </b>VR#{data.id}</span>
                  <span className="col-6"><b>Priority: </b>{priorityText[data.priority]}</span>
                </div>
              </ListGroup.Item>
              <ListGroup.Item>
                <b>Assignee:</b> {data.assignee_object ? <span>{data.assignee_object.first_name} {data.assignee_object.last_name}</span> : "None"}
              </ListGroup.Item>
              <ListGroup.Item>
                <b>Presenting Complaints:</b> {data.complaints_text || "None"}
              </ListGroup.Item>
              <ListGroup.Item>
                <b>Concern:</b> {data.concern || "N/A"}
              </ListGroup.Item>
              <ListGroup.Item>
                <b>Diagnosis:</b> {data.diagnosis_text || "N/A"}
              </ListGroup.Item>
            </ListGroup>
          </Card.Body>
        </Card>
      </div>
      <div className="col-6 d-flex pl-0">
        <Card className="border rounded" style={{width:"100%"}}>
          <Card.Body>
            <Card.Title>
              <h4 className="mb-0">Patient</h4>
            </Card.Title>
            <hr/>
            <ListGroup variant="flush" style={{marginTop:"-13px", marginBottom:"-13px"}}>
              <ListGroup.Item>
                <div className="row" style={{textTransform:"capitalize"}}>
                  <span className="col-6"><b>ID:</b> A#{data.animal_object.id}</span>
                  <span className="col-6"><b>Name:</b> {data.animal_object.name||"Unknown"}</span>
                </div>
              </ListGroup.Item>
              <ListGroup.Item>
                <div className="row" style={{textTransform:"capitalize"}}>
                  <span className="col-6"><b>Species:</b> {data.animal_object.species}</span>
                  <span className="col-6"><b>Sex:</b> {data.animal_object.sex||"Unknown"}</span>
                </div>
              </ListGroup.Item>
              <ListGroup.Item>
                <div className="row" style={{textTransform:"capitalize"}}>
                  <span className="col-6"><b>Age:</b> {data.animal_object.age||"Unknown"}</span>
                  <span className="col-6"><b>Size:</b> {data.animal_object.size||"Unknown"}</span>
                </div>
              </ListGroup.Item>
              <ListGroup.Item style={{textTransform:"capitalize"}}>
                <div className="row">
                  <span className="col-6"><b>Primary Color:</b> {data.animal_object.pcolor||"N/A"}</span>
                  <span className="col-6"><b>Secondary Color:</b> {data.animal_object.scolor||"N/A"}</span>
                </div>
              </ListGroup.Item>
              <ListGroup.Item>
                  <span><b>Medical Notes:</b> {data.animal_object.medical_notes || "N/A"}</span>
              </ListGroup.Item>
            </ListGroup>
          </Card.Body>
        </Card>
      </div>
    </div>
    <div className="row mt-3">
      <div className="col-12 d-flex">
        <Card className="mb-2 border rounded" style={{width:"100%"}}>
          <Card.Body style={{marginBottom:"-17px"}}>
            <Card.Title>
              <h4 className="mb-0">Treatments
                <OverlayTrigger
                  key={"add-treatment"}
                  placement="top"
                  overlay={
                    <Tooltip id={`tooltip-add-treatment`}>
                      Add a treatment to this vet request
                    </Tooltip>
                  }
                >
                  <Link href={"/" + incident + "/vet/treatment/new?vetrequest_id=" + id}><FontAwesomeIcon icon={faPlusSquare} className="ml-1" inverse /></Link>
                </OverlayTrigger>
              </h4>
            </Card.Title>
            <hr/>
            {data.treatment_plans.map(treatment_plan => (
              <Link key={treatment_plan.id} href={"/" + incident + "/vet/treatment/" + treatment_plan.id}  className="text-link" style={{textDecoration:"none", color:"white"}}>T#{treatment_plan.id}</Link>
            ))}
            {data.treatment_plans.length < 1 ? <p>No treatments have been created for this request.</p> : ""}
          </Card.Body>
        </Card>
      </div>
    </div>
    {/* <History action_history={data.action_history} /> */}
    </>
  );
};

export default VetRequestDetails;
