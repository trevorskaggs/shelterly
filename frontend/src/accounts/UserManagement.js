import React, { useState, useEffect } from "react";
import { Link } from "raviger";
import axios from "axios";
import { Button, Card, Col, Form, FormControl, InputGroup, Modal, OverlayTrigger, Row, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMinusSquare, faUpload, faUserPlus
} from '@fortawesome/free-solid-svg-icons';
import {
  faPencil, faUserUnlock
} from '@fortawesome/pro-solid-svg-icons';
import Header from "../components/Header";

function UserManagement() {

  const [data, setData] = useState({users: [], isFetching: false});
  const [filteredData, setFilteredData] = useState({users: [], isFetching: false});

  const [userToDelete, setUserToDelete] = useState({id: 0, first_name: '', last_name: ''});
  const [showUserConfirm, setShowUserConfirm] = useState(false);
  const handleUserClose = () => setShowUserConfirm(false);

  const [userToReset, setUserToReset] = useState({id: 0, first_name: '', last_name: ''});
  const [showUserResetConfirm, setShowUserResetConfirm] = useState(false);
  const handleUserResetClose = () => setShowUserResetConfirm(false);

  const [file, setFile] = useState({users: [], isFetching: false});
  const [showUploadCSV, setShowUploadCSV] = useState(false);
  const handleUploadCSVClose = () => setShowUploadCSV(false);

  const [timer, setTimer] = useState(null);

  const handleRemoveUserSubmit = async () => {
    await axios.delete('/accounts/api/user/' + userToDelete.id + '/')
    .then(response => {
      setData(prevState => ({ ...prevState, "users":data.users.filter(user => user.id !== userToDelete.id) }));
      setFilteredData(prevState => ({ ...prevState, "users":data.users.filter(user => user.id !== userToDelete.id) }));
      setUserToDelete({id: 0, first_name: '', last_name: ''});
      handleUserClose();
    })
    .catch(error => {
    });
  }

  const handleResetUserSubmit = async () => {
    await axios.patch('/accounts/api/user/' + userToReset.id + '/', {'reset_password':true})
    .then(response => {
      setUserToReset({id: 0, first_name: '', last_name: ''});
      handleUserResetClose();
    })
    .catch(error => {
    });
  }

  const handleUploadCSV = async () => {
    const formData = new FormData();
    formData.append('user_csv', file);

    await axios.post('/accounts/api/user/upload_csv/', formData)
    .then(response => {
      setData(prevState => ({ ...prevState, "users":data.users.concat(response.data)}));
      setFilteredData(prevState => ({ ...prevState, "users":filteredData.users.concat(response.data)}));
      handleUploadCSVClose();
    })
    .catch(error => {
    });
  }

  // Use a delay for quick search
  function changeDelay(searchTerm) {
    if (timer) {
      clearTimeout(timer);
      setTimer(null);
    }
    setTimer(
      setTimeout(() => {
        handleSearch(searchTerm);
      }, 1000)
    );
  }

  // Update searchTerm when field input changes.
  const handleSearch = (searchTerm) => {
    if (searchTerm) {
      setFilteredData(prevState => ({ ...prevState,
        "users":data.users.filter(user => (user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  user.cell_phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  (user.agency_id ? user.agency_id.toLowerCase().includes(searchTerm.toLowerCase()) : null))
      ) }));
    }
    else {
      setFilteredData(prevState => ({ ...prevState, "users":data.users }));
    }
  };

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
          setFilteredData({users: response.data, isFetching: false});
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
      <OverlayTrigger
        key={"upload-csv"}
        placement="bottom"
        overlay={
          <Tooltip id={`tooltip-upload-csv`}>
            Upload user CSV
          </Tooltip>
        }
      >
        <FontAwesomeIcon icon={faUpload} size="sm" className="ml-2 fa-move-up" onClick={() => {setShowUploadCSV(true);}} style={{cursor:'pointer'}} inverse />
      </OverlayTrigger>
    </Header>
    <hr/>
    <InputGroup className="mb-3">
      <FormControl
        type="text"
        placeholder="Quick Search..."
        name="searchTerm"
        onChange={(event) => {
          changeDelay(event.target.value);
        }}
      />
    </InputGroup>
    <Row>
      <Col style={{minWidth:"150px", maxWidth:"150px", marginLeft:"0px"}}>
          Last Name
      </Col>
      <Col style={{minWidth:"150px", maxWidth:"150px", marginLeft:"1px"}}>
          First Name
      </Col>
      <Col style={{minWidth:"358px", maxWidth:"358px"}}>
          Email
      </Col>
      <Col style={{minWidth:"150px", maxWidth:"150px"}}>
          Phone
      </Col>
      <Col style={{minWidth:"150px", maxWidth:"150px"}}>
          Agency ID
      </Col>
      <Col>
          Actions
      </Col>
    </Row>
    {filteredData.users.map(user => (
      <Card key={user.id} className=" rounded w-100 mb-1" style={{height:"32px"}}>
        <div className="row no-gutters">
          <Col className="border-top border-left border-bottom" style={{height:"32px", paddingLeft:"3px", paddingTop:"5px", marginTop: "-1px", fontSize:"13px", borderTopLeftRadius:"0.25rem", borderBottomLeftRadius:"0.25rem", minWidth:"150px", maxWidth:"150px", backgroundColor:"#615e5e"}}>
            {user.last_name}
          </Col>
          <Col className="border-top border-left border-bottom" style={{height:"32px", paddingLeft:"3px", paddingTop:"5px", marginTop: "-1px", fontSize:"13px", minWidth:"150px", maxWidth:"150px", backgroundColor:"#615e5e"}}>
            {user.first_name}
          </Col>
          <Col className="border-top border-left border-bottom" style={{height:"32px", paddingLeft:"3px", paddingTop:"5px", marginTop: "-1px", fontSize:"13px", minWidth:"358px", maxWidth:"358px", backgroundColor:"#615e5e"}}>
            {user.email}
          </Col>
          <Col className="border-top border-left border-bottom" style={{height:"32px", paddingLeft:"3px", paddingTop:"5px", marginTop: "-1px", fontSize:"13px", minWidth:"150px", maxWidth:"150px", backgroundColor:"#615e5e"}}>
            {user.display_phone}
          </Col>
          <Col className="border-top border-left border-bottom" style={{height:"32px", paddingLeft:"3px", paddingTop:"5px", marginTop: "-1px", fontSize:"13px", minWidth:"150px", maxWidth:"150px", backgroundColor:"#615e5e"}}>
            {user.agency_id}
          </Col>
          <Col className="border" style={{height:"32px", paddingLeft:"3px", paddingTop:"5px", marginTop: "-1px", fontSize:"13px", borderTopRightRadius:"0.25rem", borderBottomRightRadius:"0.25rem", backgroundColor:"#615e5e"}}>
            <OverlayTrigger
              key={"edit-user"}
              placement="top"
              overlay={
                <Tooltip id={`tooltip-edit-user`}>
                  Edit user
                </Tooltip>
              }
            >
              <Link href={"/accounts/user/edit/" + user.id}><FontAwesomeIcon icon={faPencil} size="lg" className="ml-1" inverse /></Link>
            </OverlayTrigger>
            <OverlayTrigger
              key={"remove-user"}
              placement="top"
              overlay={
                <Tooltip id={`tooltip-remove-user`}>
                  Remove user
                </Tooltip>
              }
            >
              <FontAwesomeIcon icon={faMinusSquare} style={{cursor:'pointer'}} size="lg" className="ml-1" onClick={() => {setUserToDelete({id:user.id, first_name: user.first_name, last_name: user.last_name});setShowUserConfirm(true);}} inverse />
            </OverlayTrigger>
            <OverlayTrigger
              key={"reset-user-password"}
              placement="top"
              overlay={
                <Tooltip id={`tooltip-reset-user-password`}>
                  Reset user password
                </Tooltip>
              }
            >
              <FontAwesomeIcon icon={faUserUnlock} style={{cursor:'pointer'}} size="lg" className="ml-1" onClick={() => {setUserToReset({id:user.id, first_name: user.first_name, last_name: user.last_name});setShowUserResetConfirm(true);}} inverse />
            </OverlayTrigger>
          </Col>
        </div>
      </Card>
    ))}
    <Modal show={showUserConfirm} onHide={handleUserClose}>
      <Modal.Header closeButton>
        <Modal.Title>Confirm User Removal</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          Are you sure you would like to remove user {userToDelete.first_name} {userToDelete.last_name}?
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={handleRemoveUserSubmit}>Yes</Button>
        <Button variant="secondary" onClick={handleUserClose}>Cancel</Button>
      </Modal.Footer>
    </Modal>
    <Modal show={showUserResetConfirm} onHide={handleUserResetClose}>
      <Modal.Header closeButton>
        <Modal.Title>Confirm User Password Reset</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          Are you sure you would like to reset the password for user {userToReset.first_name} {userToReset.last_name}?
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={handleResetUserSubmit}>Yes</Button>
        <Button variant="secondary" onClick={handleUserResetClose}>Cancel</Button>
      </Modal.Footer>
    </Modal>
    <Modal show={showUploadCSV} onHide={handleUploadCSVClose}>
      <Modal.Header closeButton>
        <Modal.Title>Upload User CSV</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group controlId="formFile" className="mt-3 mb-3">
          <Form.Control type="file" onChange={(event) => {setFile(event.target.files[0]) }} />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={handleUploadCSV}>Upload</Button>
        <Button variant="secondary" onClick={handleUploadCSVClose}>Cancel</Button>
      </Modal.Footer>
    </Modal>
    </>
  )
}

export default UserManagement
