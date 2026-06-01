import React from 'react';
import { Container, Navbar as BootstrapNavbar } from 'react-bootstrap';
import '../styles/Navbar.css';

const Navbar = () => {
  return (
    <BootstrapNavbar bg="light" className="navbar-custom sticky-top">
      <Container fluid>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;
