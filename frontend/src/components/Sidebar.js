import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { Link } from 'raviger';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Nav, Button } from 'react-bootstrap';
import { faUserCircle , faClipboardList, faHome, faBullhorn, faPhone, faSignOutAlt} from '@fortawesome/free-solid-svg-icons';
import logo from ".././static/images/shelterly.png"

export const StyledMenu = styled(Nav)`
  background: ${({ theme }) => theme.primaryDark};
  height: 100%;
  text-align: left;
  padding: 4rem;
  float: left;
  margin-left: 0;
  height: 100vh;
  top: 0;
  left: 0;
  @media (max-width: ${({ theme }) => theme.mobile}) {
      width: 100%;
    }
  a {
    font-size: 2rem;
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
      color: ${({ theme }) => theme.primaryHover};
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
    display: block;
    letter-spacing: 0.5rem;
    margin-left: auto;
    margin-right: auto;
    padding-bottom: 1rem;
    color: ${({ theme }) => theme.primaryLight};
  }
`;

const Menu = ({ ...props }) => {
    
    return (
    <div>
    <StyledMenu  {...props} className="flex-column">
    <img src={logo} alt="logo" />
    <div className="logo">SHELTERLY</div>
      <Link href="/hotline" ><FontAwesomeIcon icon={faPhone} fixedWidth inverse/> HOTLINE</Link>
      <Link href="/evac"><FontAwesomeIcon icon={faBullhorn} fixedWidth inverse/>  EVAC</Link>
      <Link href="/intake"><FontAwesomeIcon icon={faClipboardList} fixedWidth inverse/>  INTAKE</Link>
      <Link href="/shelter"><FontAwesomeIcon icon={faHome} fixedWidth inverse/> SHELTER</Link>
      <Link href="/"><FontAwesomeIcon icon={faSignOutAlt} fixedWidth inverse/> SIGN OUT</Link>
    </StyledMenu>
    </ div>
    )
  }

function Sidebar({ ...props }) {
    
    const node = useRef();
    const menuId = "main-menu";

    return (
        <div ref={node}>
            <Menu id={menuId} />
        </div>
    )
}
export default Sidebar;