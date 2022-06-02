import React, { useState, useEffect } from "react";
import { Link } from "raviger";
import axios from "axios";
import { Card, Col, OverlayTrigger, Row, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEye, faEyeSlash, faUser, faUsers, faUserPlus
} from '@fortawesome/free-solid-svg-icons';
import Header from "../components/Header";
import Scrollbar from '../components/Scrollbars';

function UserManagement() {

  const [data, setData] = useState({users: [], isFetching: false});

  // Hook for initializing data.
  useEffect(() => {
    let unmounted = false;
    let source = axios.CancelToken.source();

    const fetchUserData = async () => {

      setData({users: [], isFetching: true});
      axios.get('/accounts/api/user/', {
        cancelToken: source.token,
      })
      .then(response => {
        if (!unmounted) {
          setData({users: response.data, isFetching: false});
        }
      })
      .catch(error => {
        setData({users: [], isFetching: false});
      });

      // Cleanup.
      return () => {
        unmounted = true;
        source.cancel();
      };
    }

  fetchUserData();

  }, []);

  return (
    <>
    <Header>User Management</Header>
    <hr/>
    <h3 style={{marginBottom:"5px"}}>
      {/* <OverlayTrigger
        key={"add-team-member"}
        placement="bottom"
        overlay={
          <Tooltip id={`tooltip-add-team-member`}>
            Create new team member
          </Tooltip>
        }
      >
        <Link href={"/dispatch/dispatchteammember/new"}><FontAwesomeIcon icon={faUserPlus} size="sm" className="ml-2" inverse /></Link>
      </OverlayTrigger> */}
    </h3>
    <Row>
      <Col style={{minWidth:"150px", marginLeft:"0px", marginRight:"-15px", paddingRight:"0px"}}>
          Last Name
      </Col>
      <Col style={{minWidth:"150px", marginLeft:"-15px", marginRight:"-15px", paddingLeft:"0px", paddingRight:"0px"}}>
          First Name
      </Col>
      <Col style={{marginLeft:"-15px", marginRight:"-15px"}}>
          Email
      </Col>
      <Col style={{minWidth:"100px", marginLeft:"-15px", marginRight:"-15px"}}>
          Phone
      </Col>
      <Col style={{minWidth:"100px", marginLeft:"-15px", marginRight:"-15px"}}>
          Agency ID
      </Col>
      <Col>
          Actions
      </Col>
    </Row>
    {data.users.map(user => (
      // <Row key={user.id} className="ml-0 mr-0 mb-1">
        <Card className=" rounded w-100 mb-1" style={{height:"32px"}}>
          <div className="row no-gutters" style={{textTransform:"capitalize", marginRight:"-2px"}}>
            {/* <div style={{width:"32px"}}>
              <FontAwesomeIcon icon={faUser} size="2x" style={{marginTop:"5px", marginLeft:"7px"}} inverse />
            </div> */}
            <Col className="border-top border-left border-bottom" style={{height:"32px", paddingLeft:"3px", paddingTop:"5px", marginTop: "-1px", fontSize:"13px", borderTopLeftRadius:"0.25rem", borderBottomLeftRadius:"0.25rem", maxWidth:"150px", backgroundColor:"#615e5e"}}>
              {/* <div className="border" > */}
                {user.last_name}
              {/* </div> */}
            </Col>
            <Col className="border-top border-left border-bottom" style={{height:"32px", paddingLeft:"3px", paddingTop:"5px", marginTop: "-1px", fontSize:"13px", maxWidth:"150px", backgroundColor:"#615e5e"}}>
                {user.first_name}
            </Col>
            <Col className="border-top border-left border-bottom" style={{height:"32px", paddingLeft:"3px", paddingTop:"5px", marginTop: "-1px", fontSize:"13px", backgroundColor:"#615e5e"}}>
                {user.email}
            </Col>
            <Col className="border-top border-left border-bottom" style={{height:"32px", paddingLeft:"3px", paddingTop:"5px", marginTop: "-1px", fontSize:"13px", maxWidth:"100px", backgroundColor:"#615e5e"}}>
                {user.cell_phone}
            </Col>
            <Col className="border-top border-left border-bottom" style={{height:"32px", paddingLeft:"3px", paddingTop:"5px", marginTop: "-1px", fontSize:"13px", maxWidth:"100px", backgroundColor:"#615e5e"}}>
                {user.agency_id}
            </Col>
            <Col className="border" style={{height:"32px", paddingLeft:"3px", paddingTop:"5px", marginTop: "-1px", fontSize:"13px", borderTopRightRadius:"0.25rem", borderBottomRightRadius:"0.25rem", backgroundColor:"#615e5e"}}>
                
            </Col>
          </div>
        </Card>
      // </Row>
    ))}
    </>
  )
}

export default UserManagement
