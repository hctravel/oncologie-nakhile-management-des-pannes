import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

/**
 * Reusable hook for CRUD data management
 * Eliminates duplicate code across management pages (Machines, Pannes, Maintenance, Usage)
 * 
 * @param {object} service - API service with create, update, delete, getAll methods
 * @param {string} resourceName - Name of resource for toast messages (e.g., 'Appareil', 'Panne')
 * @param {object} initialFormData - Initial form data structure
 * @returns {object} - State and handler functions for CRUD operations
 */
export const useDataManagement = (service, resourceName, initialFormData) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState(initialFormData);

  // Fetch all items on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await service.getAll?.();
      setItems(response.data.data || []);
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || `Erreur lors du chargement des ${resourceName}s`;
      toast.error(errorMsg);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleShowModal = (item = null) => {
    if (item) {
      setEditingId(item.id);
      setFormData(item);
    } else {
      setEditingId(null);
      setFormData(initialFormData);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData(initialFormData);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e, sanitizeData = null) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const submitData = sanitizeData ? sanitizeData(formData) : formData;

      if (editingId) {
        await service.update(editingId, submitData);
        toast.success(`${resourceName} modifié(e) avec succès`);
      } else {
        await service.create(submitData);
        toast.success(`${resourceName} créé(e) avec succès`);
      }

      handleCloseModal();
      fetchData();
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || `Une erreur est survenue`;
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer ce ${resourceName}?`)) {
      try {
        await service.delete(id);
        toast.success(`${resourceName} supprimé(e) avec succès`);
        fetchData();
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || `Erreur lors de la suppression`;
        toast.error(errorMessage);
      }
    }
  };

  return {
    items,
    loading,
    showModal,
    editingId,
    submitting,
    formData,
    setFormData,
    fetchData,
    handleShowModal,
    handleCloseModal,
    handleInputChange,
    handleSubmit,
    handleDelete,
  };
};
