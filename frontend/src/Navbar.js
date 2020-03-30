import React, { useState} from 'react';
import {
  Navbar as BootstrapNavbar,
  NavbarToggler,
  Collapse,
  NavItem,
  NavLink,
  Nav
} from 'reactstrap';


const Navbar = props => {
  const [collapsed, setCollapsed] = useState(true);
  const [screen, setScreen] = useState('home');
  const toggleNavbar = () => setCollapsed(!collapsed);

  return (
    <div>
      <BootstrapNavbar color="faded" light>
        <NavbarToggler onClick={toggleNavbar} className="mr-2" />
        <Collapse isOpen={!collapsed} navbar>
          <Nav navbar>
            <NavItem>
              <NavLink href="#" onClick={() => setScreen('home')}>
                Home
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink href="#" onClick={() => setScreen('map')}>
                Map
              </NavLink>
            </NavItem>
          </Nav>
        </Collapse>
      </BootstrapNavbar>
    </div>
  );
};

export default Navbar;