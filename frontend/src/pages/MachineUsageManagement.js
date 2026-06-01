import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Modal, Spinner, Row, Col, Card } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { machineUsageService, machineService } from '../services/apiService';
import DataTable from '../components/DataTable';
import '../styles/MachineUsage.css';

const MachineUsageManagement = () => {
  const [usage, setUsage] = useState([]);
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [formData, setFormData] = useState({
    machineId: '',
    date: '',
    usageType: '',
    numberOfPatients: '',
  });

  const [filters, setFilters] = useState({
    machineId: '',
    startDate: '',
    endDate: '',
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    calculateTotalAmount();
  }, [usage, filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usageRes, machinesRes] = await Promise.all([
        machineUsageService.getAll(1, 100, filters),
        machineService.getAll(1, 100),
      ]);
      setUsage(usageRes.data.data.usage || []);
      setMachines(machinesRes.data.data.machines || []);
    } catch (error) {
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalAmount = async () => {
    try {
      const res = await machineUsageService.getTotalAmount(filters);
      setTotalAmount(res.data.data.totalAmount || 0);
    } catch (error) {
      // Error silently handled
    }
  };

  const handleShowModal = (item = null) => {
    if (item) {
      setEditingId(item.id);
      // Transform backend field names to frontend field names
      setFormData({
        machineId: item.machineId || '',
        date: item.usageDate || item.date || new Date().toISOString().split('T')[0],
        usageType: item.notes || item.usageType || '',
        numberOfPatients: item.quantity || item.numberOfPatients || '',
      });
    } else {
      setEditingId(null);
      setFormData({
        machineId: '',
        date: new Date().toISOString().split('T')[0],
        usageType: '',
        numberOfPatients: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const errors = [];
    if (!formData.machineId || formData.machineId === '') errors.push('Appareil Médical');
    if (!formData.date) errors.push('Date');
    if (!formData.usageType || formData.usageType.trim() === '') errors.push('Type d\'Utilisation');
    if (!formData.numberOfPatients || formData.numberOfPatients === '') errors.push('Nombre de Patients');
    
    if (errors.length > 0) {
      toast.error(`Champs obligatoires: ${errors.join(', ')}`);
      return;
    }

    setSubmitting(true);
    try {
      // Data sanitization
      const sanitizedData = {
        machineId: parseInt(formData.machineId),
        date: formData.date.trim(),
        usageType: formData.usageType.trim(),
        numberOfPatients: parseInt(formData.numberOfPatients),
        amount: 0, // Default to 0 since montant is removed from form
      };

      if (editingId) {
        await machineUsageService.update(editingId, sanitizedData);
        toast.success('Utilisation modifiée avec succès');
      } else {
        await machineUsageService.create(sanitizedData);
        toast.success('Utilisation créée avec succès');
      }
      handleCloseModal();
      fetchData();
    } catch (error) {
      console.error('Form submission error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Une erreur est survenue';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette utilisation?')) {
      try {
        await machineUsageService.delete(id);
        toast.success('Utilisation supprimée avec succès');
        fetchData();
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const columns = [
    { key: 'machineName', label: 'Appareil' },
    { key: 'date', label: 'Date' },
    { key: 'usageType', label: 'Type Utilisation' },
    { key: 'numberOfPatients', label: 'Nombre de Patients' },
  ];

  const filterDefinitions = [
    { key: 'machineName', label: 'Appareil', type: 'text' },
    { key: 'date', label: 'Date', type: 'date' },
  ];

  // Transform usage data to include machineName
  const usageWithNames = usage.map(u => ({
    ...u,
    machineName: u.machine?.name || 'N/A',
  }));

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <Container fluid className="management-container">
      <div className="management-header">
        <h2>Gestion de l'Utilisation des Appareils</h2>
        <Button variant="success" onClick={() => handleShowModal()}>
          + Ajouter une Utilisation
        </Button>
      </div>

      <Card className="total-amount-card mb-4">
        <Card.Body>
          <h5>Montant Total</h5>
          <p className="total-amount">{totalAmount.toFixed(2)} MAD</p>
        </Card.Body>
      </Card>

      <Card className="filters-card mb-4">
        <Card.Body>
          <h6>Filtres:</h6>
          <Row>
            <Col md={4}>
              <Form.Group className="mb-2">
                <Form.Label>Appareil</Form.Label>
                <Form.Select
                  name="machineId"
                  value={filters.machineId}
                  onChange={handleFilterChange}
                >
                  <option value="">Tous les appareils</option>
                  {machines.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-2">
                <Form.Label>Date Début</Form.Label>
                <Form.Control
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-2">
                <Form.Label>Date Fin</Form.Label>
                <Form.Control
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                />
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <DataTable
        columns={columns}
        data={usageWithNames}
        onEdit={handleShowModal}
        onDelete={handleDelete}
        filters={filterDefinitions}
        showActions={true}
      />

      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingId ? 'Modifier l\'Utilisation' : 'Ajouter une Utilisation'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Appareil Médical</Form.Label>
                  <Form.Select
                    name="machineId"
                    value={formData.machineId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Sélectionnez un appareil</option>
                    {machines.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Type d'Utilisation</Form.Label>
                  <Form.Control
                    type="text"
                    name="usageType"
                    value={formData.usageType}
                    onChange={handleInputChange}
                    placeholder="Ex: Consultation, Examen..."
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre de Patients</Form.Label>
                  <Form.Control
                    type="number"
                    name="numberOfPatients"
                    value={formData.numberOfPatients}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex gap-2">
              <Button variant="primary" type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Traitement...
                  </>
                ) : (
                  editingId ? 'Modifier' : 'Créer'
                )}
              </Button>
              <Button variant="secondary" onClick={handleCloseModal} disabled={submitting}>
                Annuler
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default MachineUsageManagement;
