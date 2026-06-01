import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { Container, Alert } from 'react-bootstrap';

const PrivateRoute = ({ children, requiredRoles = [] }) => {
  // Authentication disabled - allow direct access
  return children;
};

export default PrivateRoute;
