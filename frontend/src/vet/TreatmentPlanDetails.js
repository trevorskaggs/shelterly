import React, { useContext, useEffect, useState } from 'react';
import axios from "axios";
import Moment from 'react-moment';
import { Link, navigate } from 'raviger';
import { Button, Card, ListGroup, Modal, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEdit,
  faPlusSquare
} from '@fortawesome/free-solid-svg-icons';
import Header from '../components/Header';
import { SystemErrorContext } from '../components/SystemError';

function TreatmentPlanDetails({ id, incident }) {

  const { setShowSystemError } = useContext(SystemErrorContext);

  const [data, setData] = useState({id: '', treatment_object:{name:'', category:''}, start: '', end:'', frequency: '', quantity: '', unit: '', route: '', treatment_requests:[]});

  // Hook for initializing data.
  useEffect(() => {
    let unmounted = false;
    let source = axios.CancelToken.source();

    const fetchTreatmentPlanData = async () => {
      // Fetch Room Details data.
      await axios.get('/vet/api/treatmentplan/' + id + '/?incident=' + incident, {
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
    fetchTreatmentPlanData();
    // Cleanup.
    return () => {
      unmounted = true;
      source.cancel();
    };
  }, [id, incident]);

  return (
    <>
    <Header>
      Treatment Details
      <OverlayTrigger
        key={"edit-treatment-plan"}
        placement="bottom"
        overlay={
          <Tooltip id={`tooltip-edit-treatment-plan`}>
            Update treatment
          </Tooltip>
        }
      >
        <Link href={"/" + incident + "/vet/treatmentplan/edit/" + id}><FontAwesomeIcon icon={faEdit} className="ml-1" inverse /></Link>
      </OverlayTrigger>
    </Header>
    <hr/>
    <Card className="border rounded d-flex" style={{width:"100%"}}>
      <Card.Body>
        <Card.Title>
          <h4>Information</h4>
        </Card.Title>
        <hr/>
        <ListGroup variant="flush" style={{marginTop:"-13px", marginBottom:"-13px"}}>
          <ListGroup.Item>
            <b>Vet Request:</b> <Link href={"/" + incident + "/vet/vetrequest/" + data.vet_request}  className="text-link" style={{textDecoration:"none", color:"white"}}>VR#{data.vet_request}</Link>
          </ListGroup.Item>
          <ListGroup.Item>
            <b>Treatment:</b> {data.treatment_object.description}
          </ListGroup.Item>
          <ListGroup.Item>
            <div className="row">
              <span className="col-3"><b>Frequency:</b> {data.frequency}</span>
              <span className="col-3"><b>Start: </b><Moment format="lll">{data.start}</Moment></span>
              <span className="col-3"><b>End: </b><Moment format="lll">{data.end}</Moment></span>
            </div>
          </ListGroup.Item>
          <ListGroup.Item>
          <div className="row">
              <span className="col-3"><b>Quantity:</b> {data.quantity}</span>
              <span className="col-3"><b>Unit:</b> {data.unit}</span>
              <span className="col-3"><b>Route:</b> {data.route}</span>
            </div>
          </ListGroup.Item>
        </ListGroup>
      </Card.Body>
    </Card>
    <div className="row mt-3">
      <div className="col-12 d-flex">
        <Card className="mb-2 border rounded" style={{width:"100%"}}>
          <Card.Body style={{marginBottom:"-17px"}}>
            <Card.Title>
              <h4 className="mb-0">Treatment Requests</h4>
            </Card.Title>
            <hr/>
            {data.treatment_requests.map(treatment_request => (
              treatment_request.id
            ))}
            {/* <AnimalCards animals={data.animals} show_owner={true} incident={"/" + incident} /> */}
            {data.treatment_requests.length < 1 ? <p>No treatment requests have been created for this treatment plan.</p> : ""}
          </Card.Body>
        </Card>
      </div>
    </div>
    {/* <History action_history={data.action_history} /> */}
    </>
  );
};

export default TreatmentPlanDetails;
