import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner } from 'react-bootstrap';
import { reportService } from '../services/apiService';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await reportService.getSummary();
      setStats(response.data.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" />
      </div>
    );
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF6B6B'];

  return (
    <Container fluid className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Tableau de Bord</h1>
        <p className="dashboard-subtitle">Bienvenue sur Medical Machine App V2</p>
      </div>

      {/* Key Metrics */}
      <Row className="stats-row mb-4">
        <Col md={3} sm={6} className="mb-3">
          <Card className="stat-card stat-machines">
            <Card.Body>
              <h6 className="stat-label">Machines Totales</h6>
              <p className="stat-value">{stats?.totalMachines || 0}</p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} sm={6} className="mb-3">
          <Card className="stat-card stat-operational">
            <Card.Body>
              <h6 className="stat-label">Opérationnelles</h6>
              <p className="stat-value">{stats?.operationalMachines || 0}</p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} sm={6} className="mb-3">
          <Card className="stat-card stat-broken">
            <Card.Body>
              <h6 className="stat-label">Machines Cassées</h6>
              <p className="stat-value">{stats?.brokenMachines || 0}</p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} sm={6} className="mb-3">
          <Card className="stat-card stat-active-pannes">
            <Card.Body>
              <h6 className="stat-label">Pannes Actives</h6>
              <p className="stat-value">{stats?.activePannes || 0}</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Financial Metrics */}
      <Row className="stats-row mb-4">
        <Col md={3} sm={6} className="mb-3">
          <Card className="stat-card stat-revenue">
            <Card.Body>
              <h6 className="stat-label">Revenu Total</h6>
              <p className="stat-value stat-green">{(stats?.totalRevenue || 0).toFixed(2)} MAD</p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} sm={6} className="mb-3">
          <Card className="stat-card stat-maintenance-cost">
            <Card.Body>
              <h6 className="stat-label">Coûts Maintenance</h6>
              <p className="stat-value stat-red">{(stats?.totalMaintenanceCost || 0).toFixed(2)} MAD</p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} sm={6} className="mb-3">
          <Card className="stat-card stat-panne-cost">
            <Card.Body>
              <h6 className="stat-label">Coûts Pannes</h6>
              <p className="stat-value stat-orange">{(stats?.totalPanneCost || 0).toFixed(2)} MAD</p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} sm={6} className="mb-3">
          <Card className="stat-card stat-maintenance-completed">
            <Card.Body>
              <h6 className="stat-label">Maintenance Complétée</h6>
              <p className="stat-value">{stats?.completedMaintenance || 0}</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row className="charts-row">
        <Col md={6} className="mb-4">
          <Card className="chart-card">
            <Card.Header>
              <h5>Distribution des Appareils</h5>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Opérationnels', value: stats?.operationalMachines || 0 },
                      { name: 'Cassés', value: stats?.brokenMachines || 0 },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {COLORS.map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} className="mb-4">
          <Card className="chart-card">
            <Card.Header>
              <h5>Aperçu Financier</h5>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[
                  { name: 'Revenu', value: stats?.totalRevenue || 0 },
                  { name: 'Maintenance', value: stats?.totalMaintenanceCost || 0 },
                  { name: 'Pannes', value: stats?.totalPanneCost || 0 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Card className="quick-actions-card">
        <Card.Header>
          <h5>Informations</h5>
        </Card.Header>
        <Card.Body>
          <ul className="list-unstyled">
            <li>✓ Accédez aux reportages pour des données détaillées</li>
            <li>✓ Utilisez les filtres sur toutes les pages pour affiner vos recherches</li>
            <li>✓ Exportez les données en Excel depuis n'importe quelle table</li>
            <li>✓ Suivez les pannes et les maintenances en temps réel</li>
          </ul>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Dashboard;
