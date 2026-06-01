import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Nav, Navbar as BootstrapNavbar, Container, Offcanvas } from 'react-bootstrap';
import { FiHome, FiTool, FiAlertTriangle, FiUsers, FiBarChart2, FiActivity } from 'react-icons/fi';
import '../styles/Sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector(state => state.auth);
  const [show, setShow] = React.useState(false);

  // Define all menu items with their required roles
  const allMenuItems = [
    { path: '/', label: 'Tableau de bord', icon: <FiHome />, roles: ['super admin', 'admin', 'technician'] },
    { path: '/machines', label: 'Appareils', icon: <FiTool />, roles: ['super admin', 'admin', 'technician'] },
    { path: '/pannes', label: 'Pannes', icon: <FiAlertTriangle />, roles: ['super admin', 'admin', 'technician'] },
    { path: '/maintenance', label: 'Maintenance', icon: <FiActivity />, roles: ['super admin', 'admin', 'technician'] },
    { path: '/machine-usage', label: 'Utilisation', icon: <FiBarChart2 />, roles: ['super admin', 'admin', 'reception'] },
    { path: '/reports', label: 'Rapports', icon: <FiBarChart2 />, roles: ['super admin', 'admin'] },
    { path: '/users', label: 'Utilisateurs', icon: <FiUsers />, roles: ['super admin', 'admin'] },
  ];

  // Filter menu items based on user role
  const menuItems = allMenuItems.filter(item => 
    user && item.roles.includes(user.role)
  );

  const handleNavigate = (path) => {
    navigate(path);
    setShow(false);
  };

  return (
    <>
      <BootstrapNavbar bg="dark" expand="lg" sticky="top" className="navbar-custom d-lg-none">
        <Container fluid>
          <BootstrapNavbar.Brand href="/" className="navbar-brand-logo">
            <img src="/cropped-logo-oncologie-nakhil-768x146.png" alt="Oncologie Nakhil" height="40" />
          </BootstrapNavbar.Brand>
          <BootstrapNavbar.Toggle onClick={() => setShow(true)} />
        </Container>
      </BootstrapNavbar>

      <Offcanvas show={show} onHide={() => setShow(false)} placement="start" className="d-lg-none">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Menu</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {menuItems.map((item) => (
            <Nav.Link
              key={item.path}
              onClick={() => handleNavigate(item.path)}
              className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
            >
              {item.icon} {item.label}
            </Nav.Link>
          ))}
        </Offcanvas.Body>
      </Offcanvas>

      <div className="sidebar d-none d-lg-flex">
        <div className="sidebar-header">
          <img src="/cropped-logo-oncologie-nakhil-768x146.png" alt="Oncologie Nakhil" height="50" />
        </div>

        <Nav className="flex-column sidebar-nav">
          {menuItems.map((item) => (
            <Nav.Link
              key={item.path}
              onClick={() => handleNavigate(item.path)}
              className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
            >
              {item.icon} <span>{item.label}</span>
            </Nav.Link>
          ))}
        </Nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <p className="user-name">Medical Machine</p>
            <p className="user-role">App V2</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
