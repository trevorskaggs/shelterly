import React, { useState, useEffect } from "react";
import { Link } from "raviger";
import axios from "axios";
import { Card, Col, OverlayTrigger, Row, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUserPlus
} from '@fortawesome/free-solid-svg-icons';
import {
  faPencil
} from '@fortawesome/pro-solid-svg-icons';
import Header from "../components/Header";

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
    <Header>
      User Management
      <OverlayTrigger
        key={"add-user"}
        placement="bottom"
        overlay={
          <Tooltip id={`tooltip-add-user`}>
            Create new user
          </Tooltip>
        }
      >
        <Link href={"/accounts/user/new"}><FontAwesomeIcon icon={faUserPlus} size="sm" className="ml-2 fa-move-up" inverse /></Link>
      </OverlayTrigger>
    </Header>
    <hr/>
    <Row>
      <Col style={{maxWidth:"150px", marginLeft:"0px"}}>
          Last Name
      </Col>
      <Col style={{maxWidth:"150px", marginLeft:"1px"}}>
          First Name
      </Col>
      <Col style={{maxWidth:"350px", marginRight:"-30px"}}>
          Email
      </Col>
      <Col style={{maxWidth:"100px"}}>
          Phone
      </Col>
      <Col style={{maxWidth:"100px"}}>
          Agency ID
      </Col>
      <Col>
          Actions
      </Col>
    </Row>
    {data.users.map(user => (
      <Card key={user.id} className=" rounded w-100 mb-1" style={{height:"32px"}}>
        <div className="row no-gutters">
          {/* <div style={{width:"32px"}}>
            <FontAwesomeIcon icon={faUser} size="2x" style={{marginTop:"5px", marginLeft:"7px"}} inverse />
          </div> */}
          <Col className="border-top border-left border-bottom" style={{height:"32px", paddingLeft:"3px", paddingTop:"5px", marginTop: "-1px", fontSize:"13px", borderTopLeftRadius:"0.25rem", borderBottomLeftRadius:"0.25rem", maxWidth:"150px", backgroundColor:"#615e5e"}}>
            {user.last_name}
          </Col>
          <Col className="border-top border-left border-bottom" style={{height:"32px", paddingLeft:"3px", paddingTop:"5px", marginTop: "-1px", fontSize:"13px", maxWidth:"150px", backgroundColor:"#615e5e"}}>
            {user.first_name}
          </Col>
          <Col className="border-top border-left border-bottom" style={{height:"32px", paddingLeft:"3px", paddingTop:"5px", marginTop: "-1px", fontSize:"13px", maxWidth:"350px", backgroundColor:"#615e5e"}}>
            {user.email}
          </Col>
          <Col className="border-top border-left border-bottom" style={{height:"32px", paddingLeft:"3px", paddingTop:"5px", marginTop: "-1px", fontSize:"13px", maxWidth:"100px", backgroundColor:"#615e5e"}}>
            {user.cell_phone}
          </Col>
          <Col className="border-top border-left border-bottom" style={{height:"32px", paddingLeft:"3px", paddingTop:"5px", marginTop: "-1px", fontSize:"13px", maxWidth:"100px", backgroundColor:"#615e5e"}}>
            {user.agency_id}
          </Col>
          <Col className="border" style={{height:"32px", paddingLeft:"3px", paddingTop:"5px", marginTop: "-1px", fontSize:"13px", borderTopRightRadius:"0.25rem", borderBottomRightRadius:"0.25rem", backgroundColor:"#615e5e"}}>
            {/* <OverlayTrigger
              key={"add-user"}
              placement="bottom"
              overlay={
                <Tooltip id={`tooltip-add-user`}>
                  Create new user
                </Tooltip>
              }
            >
              <Link href={"/accounts/user/new"}><FontAwesomeIcon icon={faUserPlus} size="sm" className="ml-2 fa-move-up" inverse /></Link>
            </OverlayTrigger> */}
            <OverlayTrigger
              key={"edit-user"}
              placement="bottom"
              overlay={
                <Tooltip id={`tooltip-edit-user`}>
                  Edit user
                </Tooltip>
              }
            >
              <Link href={"/accounts/user/edit/" + user.id}><FontAwesomeIcon icon={faPencil} size="sm" className="ml-2 fa-move-up" inverse /></Link>
            </OverlayTrigger>
          </Col>
        </div>
      </Card>
    ))}
    </>
  )
}

export default UserManagement
