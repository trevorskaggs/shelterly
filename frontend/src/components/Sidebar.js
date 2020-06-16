import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { Link } from 'raviger';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Nav, Button } from 'react-bootstrap';
import { faUserCircle , faClipboardList, faHome, faBullhorn, faPhone} from '@fortawesome/free-solid-svg-icons';
import logo from ".././static/images/shelterly.png"

export const StyledBurger = styled.button`
  position: absolute;
  top: 5%;
  left: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  width: 2rem;
  height: 2rem;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  z-index: 10;
  span {
    width: 2rem;
    height: 0.25rem;
    background: #0D0C1D;
    border-radius: 10px;
    transition: all 0.3s linear;
    position: relative;
    transform-origin: 1px;
    :first-child {
      transform: ${({ open }) => open ? 'rotate(45deg)' : 'rotate(0)'};
    }
    :nth-child(2) {
      opacity: ${({ open }) => open ? '0' : '1'};
      transform: ${({ open }) => open ? 'translateX(20px)' : 'translateX(0)'};
    }
    :nth-child(3) {
      transform: ${({ open }) => open ? 'rotate(-45deg)' : 'rotate(0)'};
    }
  }
`;

export const StyledMenu = styled(Nav)`
  background: ${({ theme }) => theme.primaryDark};
  transform: ${({ open }) => open ? 'translateX(0)' : 'translateX(-100%)'};
  height: 100%;
  text-align: left;
  padding: 4rem;
  position: fixed;
  top: 0;
  left: 0;
  transition: transform 0.3s ease-in-out;
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

const Burger = ({ open, setOpen, ...props }) => {
  
  const isExpanded = open ? true : false;
  
  return (
    <StyledBurger aria-label="Toggle menu" aria-expanded={isExpanded} open={open} onClick={() => setOpen(!open)} {...props}>
      <span />
      <span />
      <span />
    </StyledBurger>
  )
}

const Menu = ({ open, ...props }) => {
  
    const isHidden = open ? true : false;
    const tabIndex = isHidden ? 0 : -1;
  
    return (
    <div>
    <StyledMenu open={open} aria-hidden={!isHidden} {...props} className="flex-column">
    <img src={logo} alt="logo" />
    <div className="logo">SHELTERLY</div>
      <Link href="/hotline" tabIndex={tabIndex}><FontAwesomeIcon icon={faPhone} fixedWidth inverse/> HOTLINE</Link>
      <Link href="/evac" tabIndex={tabIndex}><FontAwesomeIcon icon={faBullhorn} fixedWidth inverse/>  EVAC</Link>
      <Link href="/intake" tabIndex={tabIndex}><FontAwesomeIcon icon={faClipboardList} fixedWidth inverse/>  INTAKE</Link>
      <Link href="/shelter" tabIndex={tabIndex}><FontAwesomeIcon icon={faHome} fixedWidth inverse/> SHELTER</Link>
      <FontAwesomeIcon icon={faUserCircle} size="4x" />
    </StyledMenu>
    </ div>
    )
  }

function Sidebar({ open, setOpen, ...props }) {
    
    const node = useRef();
    const menuId = "main-menu";

    return (
        <div ref={node}>
            <Burger open={open} setOpen={setOpen} aria-controls={menuId} />
            <Menu open={open} setOpen={setOpen} id={menuId} />
        </div>
    )
}
export default Sidebar;