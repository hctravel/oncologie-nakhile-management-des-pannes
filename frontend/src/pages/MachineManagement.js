import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Card, Modal, Spinner, Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { machineService } from '../services/apiService';
import DataTable from '../components/DataTable';
import '../styles/MachineManagement.css';

// Status field added for machine management
const MachineManagement = () => {
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    serialNumber: '',
    location: '',
    price: '',
    manufacturer: '',
    purchaseDate: '',
    status: 'operational',
  });

  const locations = ['Salle A', 'Salle B', 'Salle C', 'Salle D', 'Urgence', 'Autres'];

  useEffect(() => {
    fetchMachines();
  }, []);

  const fetchMachines = async () => {
    try {
      setLoading(true);
      const response = await machineService.getAll(1, 100);
      setMachines(response.data.data.machines || []);
    } catch (error) {
      toast.error('Erreur lors du chargement des appareils');
    } finally {
      setLoading(false);
    }
  };

  const handleShowModal = (machine = null) => {
    if (machine) {
      setEditingId(machine.id);
      setFormData(machine);
    } else {
      setEditingId(null);
      setFormData({ name: '', serialNumber: '', location: '', price: '', manufacturer: '', purchaseDate: '', status: 'operational' });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name?.trim()) {
      toast.error('Le nom de l\'appareil est requis');
      return;
    }
    if (!formData.serialNumber?.trim()) {
      toast.error('Le numéro de série est requis');
      return;
    }
    if (!formData.location?.trim()) {
      toast.error('La localisation est requise');
      return;
    }

    setSubmitting(true);
    try {
      const submitData = {
        name: formData.name?.trim(),
        serialNumber: formData.serialNumber?.trim(),
        location: formData.location?.trim(),
        price: formData.price ? parseFloat(formData.price) : null,
        manufacturer: formData.manufacturer?.trim() || '',
        purchaseDate: formData.purchaseDate || null,
        status: formData.status || 'operational',
      };

      if (editingId) {
        await machineService.update(editingId, submitData);
        toast.success('Appareil modifié avec succès');
      } else {
        await machineService.create(submitData);
        toast.success('Appareil créé avec succès');
      }
      handleCloseModal();
      fetchMachines();
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Une erreur est survenue';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet appareil?')) {
      try {
        await machineService.delete(id);
        toast.success('Appareil supprimé avec succès');
        fetchMachines();
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const columns = [
    { key: 'name', label: 'Nom' },
    { key: 'serialNumber', label: 'Numéro de Série' },
    { key: 'location', label: 'Localisation' },
    { key: 'price', label: 'Prix' },
    { key: 'status', label: 'Statut' },
    { key: 'manufacturer', label: 'Fabricant' },
  ];

  const filters = [
    { key: 'name', label: 'Nom', type: 'text' },
    { key: 'serialNumber', label: 'Numéro de Série', type: 'text' },
    { key: 'location', label: 'Localisation', type: 'text' },
  ];

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
        <h2>Gestion des Appareils Médicaux</h2>
        <Button variant="success" onClick={() => handleShowModal()}>
          + Ajouter un Appareil
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={machines}
        onEdit={handleShowModal}
        onDelete={handleDelete}
        filters={filters}
        showActions={true}
      />

      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingId ? 'Modifier l\'Appareil' : 'Ajouter un Appareil'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nom de l'Appareil</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Date d'Achat</Form.Label>
                  <Form.Control
                    type="date"
                    name="purchaseDate"
                    value={formData.purchaseDate}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Numéro de Série</Form.Label>
                  <Form.Control
                    type="text"
                    name="serialNumber"
                    value={formData.serialNumber}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Localisation</Form.Label>
                  <Form.Select
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Sélectionnez une localisation</option>
                    {locations.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Fabricant</Form.Label>
                  <Form.Control
                    type="text"
                    name="manufacturer"
                    value={formData.manufacturer}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Prix (MAD)</Form.Label>
                  <Form.Control
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    step="0.01"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Statut</Form.Label>
                  <Form.Select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="operational">Opérationnel</option>
                    <option value="maintenance">En Maintenance</option>
                    <option value="broken">En Panne</option>
                    <option value="retired">Retiré</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex gap-2">
              <Button variant="primary" type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                    {editingId ? 'Modification...' : 'Création...'}
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

export default MachineManagement;
