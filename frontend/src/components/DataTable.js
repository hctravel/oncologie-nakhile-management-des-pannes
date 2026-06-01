import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';

const DataTable = ({ columns, data, onEdit, onDelete, onExport, filters = [], showActions = false }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filterValues, setFilterValues] = useState({});
  const [appliedFilters, setAppliedFilters] = useState({});

  // Format status field
  const formatValue = (key, value) => {
    if (key === 'status') {
      const statusMap = {
        'operational': 'Opérationnel',
        'maintenance': 'En Maintenance',
        'broken': 'En Panne',
        'retired': 'Retiré',
      };
      return statusMap[value] || value;
    }
    return value;
  };

  const handleFilterChange = (filterKey, value) => {
    setFilterValues({ ...filterValues, [filterKey]: value });
  };

  const handleApplyFilters = () => {
    setAppliedFilters({ ...filterValues });
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilterValues({});
    setAppliedFilters({});
    setCurrentPage(1);
  };

  const filteredData = data.filter((item) => {
    return filters.every((filter) => {
      const value = appliedFilters[filter.key];
      if (!value) return true;
      const itemValue = item[filter.key]?.toString().toLowerCase() || '';
      return itemValue.includes(value.toLowerCase());
    });
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const handleExportToExcel = () => {
    const csvContent = [];
    csvContent.push(columns.map(col => col.label).join(','));
    filteredData.forEach((row) => {
      csvContent.push(columns.map(col => row[col.key] || '').join(','));
    });

    const csv = csvContent.join('\n');
    const link = document.createElement('a');
    link.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
    link.download = `export_${new Date().getTime()}.csv`;
    link.click();
  };

  return (
    <div className="data-table-container">
      {filters.length > 0 && (
        <div className="table-filters mb-3">
          <h6>Filtres:</h6>
          <div className="row">
            {filters.map((filter) => (
              <div key={filter.key} className="col-md-3 mb-2">
                <Form.Group>
                  <Form.Label>{filter.label}</Form.Label>
                  <Form.Control
                    type={filter.type || 'text'}
                    placeholder={`Filtrer par ${filter.label}`}
                    value={filterValues[filter.key] || ''}
                    onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                  />
                </Form.Group>
              </div>
            ))}
          </div>
          <div className="filter-buttons mt-3">
            <Button variant="primary" size="sm" onClick={handleApplyFilters} className="me-2">
              🔍 Filtrer
            </Button>
            <Button variant="outline-secondary" size="sm" onClick={handleClearFilters}>
              ✕ Effacer les filtres
            </Button>
          </div>
        </div>
      )}

      <div className="table-wrapper">
        <table className="table table-hover">
          <thead className="table-dark">
            <tr>
              {columns.map((col) => (
                <th key={col.key}>{col.label}</th>
              ))}
              {showActions && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (showActions ? 1 : 0)} className="text-center py-4">
                  Aucune donnée disponible
                </td>
              </tr>
            ) : (
              paginatedData.map((row, index) => (
                <tr key={index}>
                  {columns.map((col) => (
                    <td key={col.key}>{formatValue(col.key, row[col.key])}</td>
                  ))}
                  {showActions && (
                    <td>
                      {onEdit && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => onEdit(row)}
                          className="me-2"
                        >
                          Modifier
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => onDelete(row.id)}
                        >
                          Supprimer
                        </Button>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="table-footer">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <span>Affichage {startIndex + 1} à {Math.min(startIndex + itemsPerPage, filteredData.length)} sur {filteredData.length}</span>
          </div>
          <div>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => handleExportToExcel()}
              className="me-2"
            >
              Exporter en Excel
            </Button>
          </div>
          <div className="pagination-controls">
            <Button
              variant="outline-secondary"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Précédent
            </Button>
            <span className="mx-2">{currentPage} / {totalPages}</span>
            <Button
              variant="outline-secondary"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Suivant
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
