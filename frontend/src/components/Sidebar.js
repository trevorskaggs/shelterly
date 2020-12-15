import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'raviger';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Nav } from 'react-bootstrap';
import { faDoorOpen, faHome, faBullhorn, faPhone, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { logoutUser } from ".././accounts/AccountsUtils";

export const StyledMenu = styled(Nav)`
  background: ${({ theme }) => theme.primaryDark};
  height: 100%;
  text-align: left;
  padding: 1.5rem;
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

const Menu = ({ state, dispatch, removeCookie, ...props }) => {

    const viewHeight = window.outerHeight;
    useEffect(() => {
       document.title = "Shelterly"
    }, []);
    
    return (
    <StyledMenu  {...props} className="flex-column" style={{ height: viewHeight }}>
    <img src="https://sheltelry-app-static.s3-us-west-2.amazonaws.com/shelterly.png" alt="logo" />
    <div className="logo border-bottom">SHELTERLY</div>
      <Link href="/hotline" ><FontAwesomeIcon icon={faPhone} fixedWidth inverse/> HOTLINE</Link>
      <Link href="/evac"><FontAwesomeIcon icon={faBullhorn} fixedWidth inverse/>  DISPATCH</Link>
      <Link href="/intake"><FontAwesomeIcon icon={faDoorOpen} fixedWidth inverse/>  INTAKE</Link>
      <Link href="/shelter"><FontAwesomeIcon icon={faHome} fixedWidth inverse/> SHELTER</Link>
      {state.user ? <Link onClick={() => logoutUser({dispatch}, {removeCookie})} href="#"><FontAwesomeIcon icon={faSignOutAlt} fixedWidth inverse/> SIGN OUT</Link> : ""}
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
