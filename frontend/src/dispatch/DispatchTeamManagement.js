import React, { useContext, useState, useEffect } from "react";
import { Link } from "raviger";
import axios from "axios";
import { Card, Col, OverlayTrigger, Row, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEye, faEyeSlash, faUser, faUsers, faUserPlus
} from '@fortawesome/free-solid-svg-icons';
import Header from "../components/Header";
import Scrollbar from '../components/Scrollbars';
import { SystemErrorContext } from '../components/SystemError';

function DispatchTeamManagement({ incident }) {

  const { setShowSystemError } = useContext(SystemErrorContext);

  const [data, setData] = useState({team_members: [], teams: [], isFetching: false});

  const showHideTeam = async (team_id, action) => {
    await axios.patch('/evac/api/dispatchteam/' + team_id + '/', {'action':action})
    .then(response => {
      const index = data.teams.findIndex(team => team.id === team_id);
      let teams = [...data.teams];
      teams[index] = response.data;
      setData(prevState => ({ ...prevState, "teams": teams }));
    })
    .catch(error => {
      setShowSystemError(true);
    });
  }

  const showHideTeamMember = async (team_member_id, action) => {
    await axios.patch('/evac/api/evacteammember/' + team_member_id + '/', {'action':action})
    .then(response => {
      const index = data.team_members.findIndex(team_member => team_member.id === team_member_id);
      let team_members = [...data.team_members];
      team_members[index] = response.data;
      setData(prevState => ({ ...prevState, "team_members": team_members }));
    })
    .catch(error => {
      setShowSystemError(true);
    });
  }

  // Hook for initializing data.
  useEffect(() => {
    let unmounted = false;
    let source = axios.CancelToken.source();

    const fetchTeamData = async () => {

      setData({team_members: [], teams: [], isFetching: true});
      axios.get('/evac/api/evacteammember/', {
        cancelToken: source.token,
      })
      .then(teamMemberResponse => {
        if (!unmounted) {
          // Fetch all recent Teams.
          axios.get('/evac/api/dispatchteam/?incident=' + incident, {
            params: {
              map: true
            },
            cancelToken: source.token,
          })
          .then(teamResponse => {
            setData({team_members: teamMemberResponse.data, teams: teamResponse.data, isFetching: false});
          })
          .catch(error => {
            if (!unmounted) {
              setData({team_members: [], teams: [], isFetching: false});
              setShowSystemError(true);
            }
          });
        }
      })
      .catch(error => {
        setData({team_members: [], teams: [], isFetching: false});
        setShowSystemError(true);
      });

      // Cleanup.
      return () => {
        unmounted = true;
        source.cancel();
      };
    }

  fetchTeamData();

  }, [incident]);

  return (
    <>
    <Header>Dispatch Team Management</Header>
    <hr/>
    <h3 style={{marginBottom:"5px"}}>
      Team Members
      <OverlayTrigger
        key={"add-team-member"}
        placement="bottom"
        overlay={
          <Tooltip id={`tooltip-add-team-member`}>
            Create new team member
          </Tooltip>
        }
      >
        <Link href={"/" + incident + "/dispatch/dispatchteammember/new"}><FontAwesomeIcon icon={faUserPlus} size="sm" className="ml-2" inverse /></Link>
      </OverlayTrigger>
    </h3>
    <Scrollbar style={{height:"270px", minHeight:"270px"}} renderView={props => <div {...props} style={{...props.style, overflowX:"hidden"}}/>}  renderThumbHorizontal={props => <div {...props} style={{...props.style, display: 'none'}} />}>
      <Row className="ml-0 mb-1">
        {data.team_members.map(team_member => (
          <span key={team_member.id} className="pl-0 pr-0 mr-3 mb-3">
              <Card className="border rounded" style={{height:"41px"}}>
                <div className="row no-gutters" style={{height:"41px", textTransform:"capitalize", marginRight:"-2px"}}>
                  <Row className="ml-0 mr-0 w-100" style={{minWidth:"334px", maxWidth:"334px"}}>
                    <div style={{width:"41px"}}>
                      <FontAwesomeIcon icon={faUser} size="2x" style={{marginTop:"5px", marginLeft:"7px"}} inverse />
                    </div>
                    <Col style={{marginLeft:"-5px", marginRight:"-25px"}}>
                      <div className="border" style={{height:"41px", paddingTop:"9px", paddingBottom:"7px", paddingLeft:"10px", marginLeft:"-11px", marginTop: "-1px", fontSize:"15px", width:"100%", borderTopRightRadius:"0.25rem", borderBottomRightRadius:"0.25rem", backgroundColor:"#615e5e"}}>
                        {team_member.display_name}
                        <span className="float-right">
                          {team_member.show ?
                          <OverlayTrigger
                            key={"show-team-member"}
                            placement="bottom"
                            overlay={
                              <Tooltip id={`tooltip-show-team-member`}>
                                This team member is currently being shown on the map. Click to hide.
                              </Tooltip>
                            }
                          >
                            <FontAwesomeIcon icon={faEye} className="mr-2" onClick={() => showHideTeamMember(team_member.id, 'hide')} style={{cursor:'pointer'}} inverse />
                          </OverlayTrigger>
                          :
                          <OverlayTrigger
                            key={"hide-team-member"}
                            placement="bottom"
                            overlay={
                              <Tooltip id={`tooltip-hide-team-member`}>
                                This team member is currently being hidden on the map. Click to show.
                              </Tooltip>
                            }
                          >
                            <FontAwesomeIcon icon={faEyeSlash} className="mr-2" onClick={() => showHideTeamMember(team_member.id, 'show')} style={{cursor:'pointer'}} inverse />
                          </OverlayTrigger>
                          }
                        </span>
                      </div>
                    </Col>
                  </Row>
                </div>
              </Card>
          </span>
        ))}
      </Row>
    </Scrollbar>
    <hr/>
    <h3 style={{marginBottom:"5px"}}>Teams</h3>
    <Scrollbar style={{height:"451px", minHeight:"451px"}} renderView={props => <div {...props} style={{...props.style, overflowX:"hidden"}}/>}  renderThumbHorizontal={props => <div {...props} style={{...props.style, display: 'none'}} />}>
      <Row className="ml-0 mb-3">
        {data.teams.map(team => (
          <span key={team.id} className="pl-0 pr-0 mr-3" style={{marginBottom:"17px"}}>
              <Card className="border rounded" style={{height:"100px"}}>
                <div className="row no-gutters" style={{height:"100px", textTransform:"capitalize", marginRight:"-2px"}}>
                  <Row className="ml-0 mr-0 w-100" style={{minWidth:"510px", maxWidth:"510px"}}>
                    <div className="border-right" style={{width:"100px"}}>
                      <FontAwesomeIcon icon={faUsers} size="5x" className="ml-1 team-icon" style={{marginTop:"12px", paddingRight:"2px"}} inverse />
                    </div>
                    <Col style={{marginLeft:"-5px", marginRight:"-25px"}}>
                      <div className="border" style={{paddingTop:"5px", paddingBottom:"7px", paddingLeft:"10px", marginLeft:"-11px", marginTop: "-1px", fontSize:"18px", width:"100%", borderTopRightRadius:"0.25rem", backgroundColor:"#615e5e"}}>
                        {team.name}
                        <span className="float-right">
                          {team.show ?
                          <OverlayTrigger
                            key={"show-team"}
                            placement="bottom"
                            overlay={
                              <Tooltip id={`tooltip-show-team`}>
                                This team is currently being shown on the map. Click to hide.
                              </Tooltip>
                            }
                          >
                            <FontAwesomeIcon icon={faEye} className="mr-2" onClick={() => showHideTeam(team.id, 'hide')} style={{cursor:'pointer'}} inverse />
                          </OverlayTrigger>
                          :
                          <OverlayTrigger
                            key={"hide-team"}
                            placement="bottom"
                            overlay={
                              <Tooltip id={`tooltip-hide-team`}>
                                This team is currently being hidden on the map. Click to show.
                              </Tooltip>
                            }
                          >
                            <FontAwesomeIcon icon={faEyeSlash} className="mr-2" onClick={() => showHideTeam(team.id, 'show')} style={{cursor:'pointer'}} inverse />
                          </OverlayTrigger>
                          }
                        </span>
                      </div>
                      <div className="text-break" style={{marginTop:"6px", width:"399px"}}>
                        {team.display_name}
                      </div>
                    </Col>
                  </Row>
                </div>
              </Card>
          </span>
        ))}
      </Row>
    </Scrollbar>
    </>
  )
}

export default DispatchTeamManagement
