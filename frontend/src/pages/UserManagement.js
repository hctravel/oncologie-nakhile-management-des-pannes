import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Modal, Spinner, Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { userService } from '../services/apiService';
import DataTable from '../components/DataTable';
import '../styles/UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'reception',
    password: '',
  });

  const [submitting, setSubmitting] = useState(false);

  const roles = [
    { value: 'super admin', label: 'Administrateur' },
    { value: 'admin', label: 'Admin' },
    { value: 'technician', label: 'Technicien' },
    { value: 'reception', label: 'Réception' },
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getAll(1, 100);
      setUsers(response.data.data.users || []);
    } catch (error) {
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const handleShowModal = (user = null) => {
    if (user) {
      setEditingId(user.id);
      setFormData({ ...user, password: '' });
    } else {
      setEditingId(null);
      setFormData({ name: '', email: '', role: 'reception', password: '' });
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
    const errors = [];
    if (!formData.name || formData.name.trim() === '') errors.push('Nom');
    if (!formData.email || formData.email.trim() === '') errors.push('Email');
    if (!editingId && (!formData.password || formData.password === '')) errors.push('Mot de passe');
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      errors.push('Email invalide');
    }

    if (errors.length > 0) {
      toast.error(`Champs obligatoires ou invalides: ${errors.join(', ')}`);
      return;
    }

    setSubmitting(true);
    try {
      // Data sanitization
      const sanitizedData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        role: formData.role,
      };

      // Only include password if provided
      if (formData.password && formData.password.trim() !== '') {
        sanitizedData.password = formData.password.trim();
      }

      if (editingId) {
        await userService.update(editingId, sanitizedData);
        toast.success('Utilisateur modifié avec succès');
      } else {
        await userService.create(sanitizedData);
        toast.success('Utilisateur créé avec succès');
      }
      handleCloseModal();
      fetchUsers();
    } catch (error) {
      console.error('Form submission error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Une erreur est survenue';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur?')) {
      try {
        await userService.delete(id);
        toast.success('Utilisateur supprimé avec succès');
        fetchUsers();
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const columns = [
    { key: 'name', label: 'Nom' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Rôle' },
  ];

  const filters = [
    { key: 'name', label: 'Nom', type: 'text' },
    { key: 'email', label: 'Email', type: 'text' },
    { key: 'role', label: 'Rôle', type: 'text' },
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
        <h2>Gestion des Utilisateurs</h2>
        <Button variant="success" onClick={() => handleShowModal()}>
          + Ajouter un Utilisateur
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={users}
        onEdit={handleShowModal}
        onDelete={handleDelete}
        filters={filters}
        showActions={true}
      />

      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingId ? 'Modifier l\'Utilisateur' : 'Ajouter un Utilisateur'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Nom</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Rôle</Form.Label>
              <Form.Select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                required
              >
                {roles.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </Form.Select>
            </Form.Group>

            {!editingId && (
              <Form.Group className="mb-3">
                <Form.Label>Mot de passe</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  placeholder="Entrez un mot de passe sécurisé"
                />
              </Form.Group>
            )}

            {editingId && (
              <Form.Group className="mb-3">
                <Form.Label>Nouveau Mot de passe (optionnel)</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Laissez vide pour ne pas modifier"
                />
              </Form.Group>
            )}

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

export default UserManagement;
