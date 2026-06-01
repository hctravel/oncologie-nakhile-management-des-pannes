import React, { useState } from 'react';
import { Container, Tabs, Tab, Spinner, Row, Col, Card, Form } from 'react-bootstrap';
import '../styles/Reports.css';

const Reports = () => {
  const [loading, setLoading] = useState(false);

  return (
    <Container fluid className="reports-container">
      <div className="reports-header">
        <h2>Rapports et Analyses</h2>
      </div>

      <Tabs defaultActiveKey="machines" className="mb-4">
        <Tab eventKey="machines" title="Rapport Appareils">
          <Card>
            <Card.Body>
              <h5>Rapport des Appareils Médicaux</h5>
              <Form className="mb-3">
                <Row>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Date Début</Form.Label>
                      <Form.Control type="date" />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Date Fin</Form.Label>
                      <Form.Control type="date" />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <div className="d-flex align-items-end h-100">
                      <button className="btn btn-primary w-100">Générer le rapport</button>
                    </div>
                  </Col>
                </Row>
              </Form>
              <p className="text-muted">Consultez les statistiques détaillées de vos appareils</p>
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="pannes" title="Rapport Pannes">
          <Card>
            <Card.Body>
              <h5>Rapport des Pannes</h5>
              <Form className="mb-3">
                <Row>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Date Début</Form.Label>
                      <Form.Control type="date" />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Date Fin</Form.Label>
                      <Form.Control type="date" />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <div className="d-flex align-items-end h-100">
                      <button className="btn btn-primary w-100">Générer le rapport</button>
                    </div>
                  </Col>
                </Row>
              </Form>
              <p className="text-muted">Analysez les pannes et les coûts de réparation</p>
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="maintenance" title="Rapport Maintenance">
          <Card>
            <Card.Body>
              <h5>Rapport de la Maintenance</h5>
              <Form className="mb-3">
                <Row>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Date Début</Form.Label>
                      <Form.Control type="date" />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Date Fin</Form.Label>
                      <Form.Control type="date" />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <div className="d-flex align-items-end h-100">
                      <button className="btn btn-primary w-100">Générer le rapport</button>
                    </div>
                  </Col>
                </Row>
              </Form>
              <p className="text-muted">Suivi de la maintenance préventive et corrective</p>
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="usage" title="Rapport Utilisation">
          <Card>
            <Card.Body>
              <h5>Rapport d'Utilisation des Appareils</h5>
              <Form className="mb-3">
                <Row>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Date Début</Form.Label>
                      <Form.Control type="date" />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Date Fin</Form.Label>
                      <Form.Control type="date" />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <div className="d-flex align-items-end h-100">
                      <button className="btn btn-primary w-100">Générer le rapport</button>
                    </div>
                  </Col>
                </Row>
              </Form>
              <p className="text-muted">Consultez les statistiques d'utilisation et de revenus</p>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
    </Container>
  );
};

export default Reports;
