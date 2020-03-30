import React from 'react';
import { StyledBurger } from './Burger.styled';
import  Navbar from './Navbar';
import Nav from 'reactstrap/lib/Nav';

const Burger = ({open, setOpen}) => {
  return (
    <StyledBurger open={open} onClick={() => setOpen(!open)}>
    {/* Each div is a styled line produced by applying the menu div styles to these rendered divs. */}
      <div />
      <div />
      <div />
    </StyledBurger>
  )
}
// Burger.propTypes = {
//   open: bool.isRequired,
//   setOpen: func.isRequired,
// };
export default Burger;
