/* Utility Functions */

export const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

export const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'MAD',
  }).format(amount);
};

export const exportToCSV = (data, filename = 'export.csv') => {
  const csvContent = [];
  if (data.length === 0) return;

  // Get headers from first object
  const headers = Object.keys(data[0]);
  csvContent.push(headers.join(','));

  // Add data rows
  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header];
      if (typeof value === 'string' && value.includes(',')) {
        return `"${value}"`;
      }
      return value;
    });
    csvContent.push(values.join(','));
  });

  // Download file
  const csv = csvContent.join('\n');
  const link = document.createElement('a');
  link.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
  link.download = filename;
  link.click();
};

export const exportToExcel = (data, filename = 'export.xlsx') => {
  // Note: This is a simple implementation
  // For full Excel support, use a library like xlsx
  exportToCSV(data, filename.replace('.xlsx', '.csv'));
};

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePhone = (phone) => {
  const re = /^[0-9\-+().\s]+$/;
  return re.test(phone);
};

export const getRoleLabel = (role) => {
  const roleMap = {
    'super admin': 'Administrateur',
    admin: 'Admin',
    technician: 'Technicien',
    reception: 'Réception',
  };
  return roleMap[role] || role;
};

export const getStatusColor = (status) => {
  const colors = {
    active: 'success',
    inactive: 'danger',
    pending: 'warning',
    completed: 'info',
    resolved: 'success',
    open: 'warning',
  };
  return colors[status] || 'secondary';
};
