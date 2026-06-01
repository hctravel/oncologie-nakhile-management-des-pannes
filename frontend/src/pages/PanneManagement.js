import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Modal, Spinner, Row, Col, Card } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { panneService, machineService } from '../services/apiService';
import DataTable from '../components/DataTable';
import '../styles/PanneManagement.css';

const PanneManagement = () => {
  const [pannes, setPannes] = useState([]);
  const [machines, setMachines] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    codePanne: '',
    machineId: '',
    description: '',
    instantPanne: '',
    status: 'reported',
    assignedTechnician: '',
    notes: '',
    cost: '',
    reportDate: new Date().toISOString().split('T')[0],
    resolvedDate: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pannesRes, machinesRes, techRes] = await Promise.all([
        panneService.getAll(1, 100),
        machineService.getAll(1, 100),
        panneService.getTechnicians(),
      ]);
      setPannes(pannesRes.data.data.pannes || []);
      setMachines(machinesRes.data.data.machines || []);
      setTechnicians(techRes.data.data.technicians || []);
    } catch (error) {
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleShowModal = (panne = null) => {
    if (panne) {
      setEditingId(panne.id);
      setFormData({
        codePanne: panne.codePanne || '',
        machineId: panne.machineId || '',
        description: panne.description || '',
        instantPanne: panne.instantPanne || '',
        status: panne.status || 'reported',
        assignedTechnician: panne.assignedTechnician || '',
        notes: panne.notes || '',
        cost: panne.cost || panne.actualCost || '',
        reportDate: panne.reportDate ? panne.reportDate.split('T')[0] : new Date().toISOString().split('T')[0],
        resolvedDate: panne.resolvedDate ? panne.resolvedDate.split('T')[0] : '',
      });
    } else {
      setEditingId(null);
      setFormData({
        codePanne: '',
        machineId: '',
        description: '',
        instantPanne: '',
        status: 'reported',
        assignedTechnician: '',
        notes: '',
        cost: '',
        reportDate: new Date().toISOString().split('T')[0],
        resolvedDate: '',
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation - only machineId, reportDate, and description are required
    if (!formData.machineId?.toString().trim()) {
      toast.error('Sélectionnez un appareil médical');
      return;
    }
    if (!formData.reportDate?.toString().trim()) {
      toast.error('La date de rapport est requise');
      return;
    }
    if (!formData.description?.trim()) {
      toast.error('La description du problème est requise');
      return;
    }

    setSubmitting(true);
    try {
      const submitData = {
        codePanne: formData.codePanne?.trim() || null,
        machineId: parseInt(formData.machineId),
        description: formData.description?.trim(),
        instantPanne: formData.instantPanne?.trim() || null,
        status: formData.status || 'reported',
        assignedTechnician: formData.assignedTechnician?.trim() || '',
        notes: formData.notes?.trim() || '',
        cost: formData.cost ? parseFloat(formData.cost) : null,
        reportDate: formData.reportDate || new Date().toISOString().split('T')[0],
        resolvedDate: formData.resolvedDate || null,
      };

      if (editingId) {
        await panneService.update(editingId, submitData);
        toast.success('Panne modifiée avec succès');
      } else {
        await panneService.create(submitData);
        toast.success('Panne créée avec succès');
      }
      handleCloseModal();
      fetchData();
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Une erreur est survenue';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette panne?')) {
      try {
        await panneService.delete(id);
        toast.success('Panne supprimée avec succès');
        fetchData();
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const handleResolve = async (id) => {
    try {
      const resolutionDate = new Date().toISOString().split('T')[0];
      await panneService.resolve(id, { resolutionDate });
      toast.success('Panne résolue avec succès');
      fetchData();
    } catch (error) {
      toast.error('Erreur lors de la résolution');
    }
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'codePanne', label: 'Code Panne' },
    { key: 'machineSerialNumber', label: 'Numéro de Série' },
    { key: 'instantPanne', label: 'Instant du Panne' },
    { key: 'reportDate', label: 'Date de Rapport' },
    { key: 'description', label: 'Description' },
    { key: 'status', label: 'Statut' },
    { key: 'assignedTechnician', label: 'Technicien Assigné' },
    { key: 'cost', label: 'Coût (MAD)' },
    { key: 'resolvedDate', label: 'Date de Résolution' },
  ];

  // Prepare pannes data with machine serial number (without filtering - DataTable handles it)
  const pannesWithData = pannes.map(panne => ({
    ...panne,
    machineSerialNumber: panne.machine?.serialNumber || 'N/A',
    instantPanne: panne.instantPanne || 'Non spécifié',
    assignedTechnician: panne.assignedTechnicianUser?.name || 'Non assigné',
    reportDate: panne.reportDate ? panne.reportDate.split('T')[0] : 'N/A',
    resolvedDate: panne.resolvedDate ? panne.resolvedDate.split('T')[0] : 'Non résolu',
    cost: panne.cost ? `${panne.cost} MAD` : 'N/A',
  }));

  const filterDefinitions = [
    { key: 'machineSerialNumber', label: 'Numéro de Série', type: 'text' },
    { key: 'id', label: 'ID Panne', type: 'text' },
    { key: 'reportDate', label: 'Date Rapport', type: 'date' },
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
        <h2>Gestion des Pannes</h2>
        <Button variant="success" onClick={() => handleShowModal()}>
          + Signaler une Panne
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={pannesWithData}
        onEdit={handleShowModal}
        onDelete={handleDelete}
        filters={filterDefinitions}
        showActions={true}
      />

      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingId ? 'Modifier la Panne' : 'Signaler une Panne'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Code Panne</Form.Label>
                  <Form.Control
                    type="text"
                    name="codePanne"
                    value={formData.codePanne}
                    onChange={handleInputChange}
                    placeholder="Ex: P-2026-001"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Instant du Panne</Form.Label>
                  <Form.Select
                    name="instantPanne"
                    value={formData.instantPanne}
                    onChange={handleInputChange}
                  >
                    <option value="">Sélectionnez un instant</option>
                    <option value="Au cour TTT">Au cour TTT</option>
                    <option value="Hors TTT">Hors TTT</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

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
                      <option key={m.id} value={m.id}>{m.name} - {m.serialNumber}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Date de Rapport</Form.Label>
                  <Form.Control
                    type="date"
                    name="reportDate"
                    value={formData.reportDate}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Description du Problème</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Décrivez le problème détaillé"
                required
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Statut</Form.Label>
                  <Form.Select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="reported">Signalé</option>
                    <option value="in_progress">En cours</option>
                    <option value="resolved">Résolu</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Coût (MAD)</Form.Label>
                  <Form.Control
                    type="number"
                    name="cost"
                    value={formData.cost}
                    onChange={handleInputChange}
                    step="0.01"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Technicien Assigné</Form.Label>
              <Form.Select
                name="assignedTechnician"
                value={formData.assignedTechnician}
                onChange={handleInputChange}
              >
                <option value="">Sélectionnez un technicien</option>
                {technicians.map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({t.email})</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Manipulateurs/Trices</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Ahmed"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Date de Résolution</Form.Label>
              <Form.Control
                type="date"
                name="resolvedDate"
                value={formData.resolvedDate}
                onChange={handleInputChange}
              />
            </Form.Group>

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

export default PanneManagement;
