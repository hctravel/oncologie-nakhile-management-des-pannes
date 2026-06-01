import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Modal, Spinner, Row, Col, Card } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { maintenanceService, machineService } from '../services/apiService';
import DataTable from '../components/DataTable';
import '../styles/MaintenanceManagement.css';

const MaintenanceManagement = () => {
  const [maintenance, setMaintenance] = useState([]);
  const [machines, setMachines] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    machineId: '',
    maintenanceDate: new Date().toISOString().split('T')[0],
    type: 'preventive',
    description: '',
    technician: '',
    cost: '',
    status: 'scheduled',
    notes: '',
    startDate: '',
    endDate: '',
    workedDays: 0,
    currentMonth: new Date(),
  });

  const [maintenanceDays, setMaintenanceDays] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [maintRes, machinesRes, techRes] = await Promise.all([
        maintenanceService.getAll(1, 100),
        machineService.getAll(1, 100),
        maintenanceService.getTechnicians(),
      ]);
      setMaintenance(maintRes.data.data.maintenance || []);
      setMachines(machinesRes.data.data.machines || []);
      setTechnicians(techRes.data.data.technicians || []);
    } catch (error) {
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleShowModal = (item = null) => {
    if (item) {
      setEditingId(item.id);
      const startDate = item.startDate || item.maintenanceDate || new Date().toISOString().split('T')[0];
      const endDate = item.endDate || item.completionDate || item.maintenanceDate || new Date().toISOString().split('T')[0];
      const daysWorked = item.workedDays ? item.workedDays.length : (item.maintenanceDaysCount ? parseInt(item.maintenanceDaysCount) : 0);
      
      // Determine technician ID - if stored as string, try to find matching technician
      let technicianId = '';
      if (item.technician) {
        // First check if it's already an ID that matches a technician
        const matchingTech = technicians.find(t => t.id == item.technician);
        if (matchingTech) {
          technicianId = matchingTech.id;
        } else if (typeof item.technician === 'string') {
          // Try to find by name
          const techByName = technicians.find(t => t.name === item.technician);
          technicianId = techByName ? techByName.id : item.technician;
        }
      }
      
      setFormData({
        machineId: item.machineId || '',
        maintenanceDate: item.maintenanceDate ? item.maintenanceDate.split('T')[0] : new Date().toISOString().split('T')[0],
        type: item.type || 'preventive',
        description: item.description || '',
        technician: technicianId,
        cost: item.cost || '',
        status: item.status || 'scheduled',
        notes: item.notes || '',
        startDate: startDate.split('T')[0],
        endDate: endDate.split('T')[0],
        workedDays: daysWorked,
        currentMonth: new Date(item.maintenanceDate || new Date()),
      });
    } else {
      setEditingId(null);
      setFormData({
        machineId: '',
        maintenanceDate: new Date().toISOString().split('T')[0],
        type: 'preventive',
        description: '',
        technician: '',
        cost: '',
        status: 'scheduled',
        notes: '',
        startDate: '',
        endDate: '',
        workedDays: 0,
        currentMonth: new Date(),
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
    
    // Validation - only machineId, type, and startDate are required
    const errors = [];
    if (!formData.machineId || formData.machineId === '') errors.push('Appareil Médical');
    if (!formData.type) errors.push('Type de Maintenance');
    if (!formData.startDate) errors.push('Date Début');
    if (!formData.technician || formData.technician === '') errors.push('Technicien');
    
    if (errors.length > 0) {
      toast.error(`Champs obligatoires: ${errors.join(', ')}`);
      return;
    }

    setSubmitting(true);
    try {
      const sanitizedData = {
        machineId: parseInt(formData.machineId),
        maintenanceDate: formData.startDate,
        type: formData.type,
        description: formData.description?.trim() || '',
        technician: formData.technician?.trim() || '',
        cost: formData.cost ? parseFloat(formData.cost) : 0,
        status: formData.status,
        notes: formData.notes?.trim() || '',
        startDate: formData.startDate,
        endDate: formData.endDate,
        workedDays: parseInt(formData.workedDays),
      };

      if (editingId) {
        await maintenanceService.update(editingId, sanitizedData);
        toast.success('Maintenance modifiée avec succès');
      } else {
        await maintenanceService.create(sanitizedData);
        toast.success('Maintenance créée avec succès');
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
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette maintenance?')) {
      try {
        await maintenanceService.delete(id);
        toast.success('Maintenance supprimée avec succès');
        fetchData();
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const columns = [
    { key: 'machineName', label: 'Machine' },
    { key: 'type', label: 'Type' },
    { key: 'technicianNames', label: 'Techniciens' },
    { key: 'startDate', label: 'Date Début' },
    { key: 'endDate', label: 'Date Fin' },
    { key: 'maintenanceDaysCount', label: 'Jours' },
    { key: 'cost', label: 'Coût (MAD)' },
    { key: 'description', label: 'Description' },
  ];

  const filterDefinitions = [
    { key: 'machineId', label: 'Machine', type: 'text' },
    { key: 'maintenanceDate', label: 'Date', type: 'date' },
  ];

  // Prepare maintenance data with machine names, technician names and formatted dates
  const maintenanceWithTechnicianNames = maintenance.map(item => {
    // Get machine name - item.machineId is a number, need to find matching machine object
    let machineName = 'Machine non trouvée';
    if (item.machineId) {
      const machineById = machines.find(m => m.id == item.machineId);
      if (machineById) {
        machineName = machineById.name;
      }
    }

    // Get technician name - item.technician is a string, need to find matching technician object
    let technicianName = 'Non assigné';
    if (item.technician) {
      // Try to find technician by ID first
      const techById = technicians.find(t => t.id == item.technician);
      if (techById) {
        technicianName = techById.name;
      } else if (typeof item.technician === 'string' && item.technician.length > 0) {
        // If stored as name string directly
        technicianName = item.technician;
      }
    }

    // Calculate days worked for display
    const daysWorked = item.workedDays ? item.workedDays.length : (item.maintenanceDaysCount ? parseInt(item.maintenanceDaysCount) : 0);

    return {
      ...item,
      machineName: machineName,
      technicianNames: technicianName,
      startDate: (item.startDate || item.maintenanceDate) ? (item.startDate || item.maintenanceDate).split('T')[0] : 'N/A',
      endDate: item.endDate ? item.endDate.split('T')[0] : (item.completionDate ? item.completionDate.split('T')[0] : 'N/A'),
      maintenanceDaysCount: daysWorked,
    };
  });

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
        <h2>Gestion de la Maintenance</h2>
        <Button variant="success" onClick={() => handleShowModal()}>
          + Programmer une Maintenance
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={maintenanceWithTechnicianNames}
        onEdit={handleShowModal}
        onDelete={handleDelete}
        filters={filterDefinitions}
        showActions={true}
      />

      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingId ? 'Modifier la Maintenance' : 'Programmer une Maintenance'}
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
                  <Form.Label>Type de Maintenance</Form.Label>
                  <Form.Select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Preventive">Préventive</option>
                    <option value="Corrective">Corrective</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Technicien</Form.Label>
                  <Form.Select
                    name="technician"
                    value={formData.technician}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Sélectionnez un technicien</option>
                    {technicians.map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.email})</option>
                    ))}
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

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Date Début</Form.Label>
                  <Form.Control
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Date Fin</Form.Label>
                  <Form.Control
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre de Jours Travaillés</Form.Label>
                  <Form.Control
                    type="number"
                    name="workedDays"
                    value={formData.workedDays}
                    onChange={handleInputChange}
                    min="0"
                    placeholder="Entrez le nombre de jours de maintenance"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
              />
            </Form.Group>

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

export default MaintenanceManagement;
