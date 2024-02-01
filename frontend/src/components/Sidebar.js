import React, { useRef, useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link, navigate } from 'raviger';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Collapse, ListGroup, Nav } from 'react-bootstrap';
import { faHome, faBullhorn, faChevronDown, faChevronUp, faPhone, faSearch, faSignOutAlt, faUserCog } from '@fortawesome/free-solid-svg-icons';
import { faFileChartColumn } from '@fortawesome/pro-solid-svg-icons';
import { logoutUser } from ".././accounts/AccountsUtils";
import { titleCase } from '.././components/Utils';

export const StyledMenu = styled(Nav)`
  background: ${({ theme }) => theme.primaryDark};
  text-align: left;
  padding: 1.5rem;
  float: left;
  margin-left: 0;
  margin-top: -15px;
  height: 100vh;
  top: 0;
  left: 0;
  @media (max-width: ${({ theme }) => theme.mobile}) {
      width: 100%;
    }
  a {
    font-size: 2rem;
    display: block;
    text-transform: uppercase;
    padding: 1rem 0;
    font-weight: bold;
    letter-spacing: 0.5rem;
    color: ${({ theme }) => theme.primaryLight};
    text-decoration: none;
    transition: color 0.3s linear;
    @media (max-width: ${({ theme }) => theme.mobile}) {
      font-size: 1.5rem;
      text-align: center;
    }
    &:hover {
      color: #a52b44;
    }
  }
  img {
    display: flex;
    margin-left: auto;
    margin-right: auto;
    width: 10rem;
    height: 10rem;
  }
  div.logo {
    font-size: 2rem;
    font-weight: bold;
    width: 267px;
    display: block;
    letter-spacing: 0.5rem;
    margin-left: auto;
    margin-right: auto;
    padding-bottom: 1rem;
    color: ${({ theme }) => theme.primaryLight};
  }
`;

const Menu = ({ state, dispatch, removeCookie, ...props }) => {

    const viewHeight = window.outerHeight;
    const path = window.location.pathname;
    const incident = '/' + path.split('/')[1] + '/' + path.split('/')[2];

    const [showSearch, setShowSearch] = useState(path.includes("search") ? true : false);

    useEffect(() => {
      document.title = "Shelterly";
      setShowSearch(path.includes("search"));
    }, [path]);

    return (
    <StyledMenu  {...props} className="flex-column" style={{ height: viewHeight, minHeight:"1025px" }}>
      <Link href={incident} style={{marginTop:"-5px", paddingBottom:"0px"}} title="Home"><img src="/static/images/shelterly.png" alt="Logo" /></Link>
      <div className="logo text-center" style={{marginTop:"10px", marginBottom:"0px", paddingBottom:"0px"}}>SHELTERLY</div>
      <div className="logo border-bottom text-center" style={{paddingBottom:"12px", letterSpacing:"0.25rem", fontSize:"1.2rem"}} title="Incident"><span style={{cursor:"pointer"}} className="incident" onClick={() => navigate('/' + path.split('/')[1])}>{state.incident.name}</span></div>
      <Link href={incident + "/hotline"} className="rounded sidebar" style={{backgroundColor:(path.includes("/hotline/") || path.endsWith("/hotline")) && !path.includes("search") ? "#444444" : "#292b2c", marginLeft:"-23px", marginRight:"-23px", marginBottom:"-10px"}}><FontAwesomeIcon icon={faPhone} fixedWidth inverse className="sidebar-icon" style={{marginLeft:"23px"}} /> HOTLINE</Link>
      <Link href={incident + "/dispatch"} className="rounded sidebar" style={{backgroundColor:(path.includes("/dispatch/") || path.endsWith("/dispatch")) && !path.includes("search") ? "#444444" : "#292b2c", marginLeft:"-23px", marginRight:"-23px", marginBottom:"-10px"}}><FontAwesomeIcon icon={faBullhorn} fixedWidth inverse className="sidebar-icon" style={{marginLeft:"23px"}} />  DISPATCH</Link>
      <Link href={incident + "/shelter"} className="rounded sidebar" style={{backgroundColor:path.includes("/shelter/") || path.endsWith("/shelter") ? "#444444" : "#292b2c", marginLeft:"-23px", marginRight:"-23px", marginBottom:"-10px"}}><FontAwesomeIcon icon={faHome} fixedWidth inverse className="sidebar-icon" style={{marginLeft:"23px"}} /> SHELTER</Link>
      <span className="rounded sidebar search" onClick={() => setShowSearch(!showSearch)} style={{cursor:'pointer', marginBottom:"-10px"}}><FontAwesomeIcon icon={faSearch} className="sidebar-icon" fixedWidth inverse /><span className="sidebar-icon"> SEARCH</span><FontAwesomeIcon icon={showSearch ? faChevronUp : faChevronDown} size="sm" className="fa-move-up sidebar-icon" fixedWidth inverse /></span>
      <Collapse in={showSearch}>
        <ListGroup variant="flush" style={{marginTop:"-5px", marginBottom:"-10px"}}>
          <ListGroup.Item action className="rounded sidebar" onClick={() => navigate(incident + '/animals/search')} style={{backgroundColor:path.includes("animals/search") ? "#444444" : "#292b2c"}}><FontAwesomeIcon className="mr-1 sidebar-icon" icon={faSearch} fixedWidth inverse/><span className="sidebar-icon">ANIMALS</span></ListGroup.Item>
          <ListGroup.Item action className="rounded sidebar" onClick={() => navigate(incident + '/people/owner/search')} style={{backgroundColor:path.includes("people/owner/search") ? "#444444" : "#292b2c"}}><FontAwesomeIcon className="mr-1 sidebar-icon" icon={faSearch} fixedWidth inverse/><span className="sidebar-icon">OWNERS</span></ListGroup.Item>
          <ListGroup.Item action className="rounded sidebar" onClick={() => navigate(incident + '/hotline/servicerequest/search')} style={{backgroundColor:path.includes("hotline/servicerequest/search") ? "#444444" : "#292b2c"}}><FontAwesomeIcon className="mr-1 sidebar-icon" icon={faSearch} fixedWidth inverse/><span className="sidebar-icon">SERVICE REQUESTS</span></ListGroup.Item>
          {state.user && (state.user.is_superuser || state.user.vet_perms) ? <ListGroup.Item action className="rounded sidebar" onClick={() => navigate(incident + '/vet/vetrequest/search')} style={{backgroundColor:path.includes("vet/vetrequest/search") ? "#444444" : "#292b2c"}}><FontAwesomeIcon className="mr-1 sidebar-icon" icon={faSearch} fixedWidth inverse/><span className="sidebar-icon">VETERINARY TASKS</span></ListGroup.Item> : ""}
          <ListGroup.Item action className="rounded sidebar" onClick={() => navigate(incident + '/dispatch/dispatchassignment/search')} style={{backgroundColor:path.includes("dispatch/dispatchassignment/search") ? "#444444" : "#292b2c"}}><FontAwesomeIcon className="mr-1 sidebar-icon" icon={faSearch} fixedWidth inverse/><span className="sidebar-icon">DISPATCH ASSIGNMENTS</span></ListGroup.Item>
        </ListGroup>
      </Collapse>
      <Link href={incident + "/reports"} className="rounded sidebar" style={{backgroundColor:path.includes("reports") ? "#444444" : "#292b2c", marginLeft:"-23px", marginRight:"-23px", marginBottom:"-10px"}}><FontAwesomeIcon icon={faFileChartColumn} fixedWidth inverse className="sidebar-icon" style={{marginLeft:"23px"}} /> REPORTS</Link>
      {state.user ? <Link onClick={() => logoutUser({dispatch}, {removeCookie})} href="#" className="rounded sidebar"><FontAwesomeIcon icon={faSignOutAlt} className="sidebar-icon" fixedWidth inverse/> SIGN OUT</Link> : ""}
    </StyledMenu>
    )
  }

function Sidebar({ state, dispatch, removeCookie }) {
    
    const node = useRef();
    const menuId = "main-menu";

    return (
      <div ref={node}>
          <Menu id={menuId} state={state} dispatch={dispatch} removeCookie={removeCookie} />
      </div>
    )
}
export default Sidebar;
