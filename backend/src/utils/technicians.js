const { User } = require('../models');

/**
 * Get all technicians
 * Consolidates duplicate getTechnicians() logic used in pannes and maintenance routes
 * 
 * @returns {Promise<Array>} - Array of technician users
 */
const getTechnicians = async () => {
  try {
    const technicians = await User.findAll({
      where: {
        role: 'technician',
      },
      attributes: ['id', 'name', 'email', 'phone'],
      order: [['name', 'ASC']],
    });

    return technicians.map((tech) => ({
      id: tech.id,
      name: tech.name,
      email: tech.email,
      phone: tech.phone,
    }));
  } catch (error) {
    throw new Error(`Failed to fetch technicians: ${error.message}`);
  }
};

/**
 * Get technician by ID
 */
const getTechnicianById = async (id) => {
  try {
    const technician = await User.findByPk(id);
    
    if (!technician || technician.role !== 'technician') {
      throw new Error('Technician not found');
    }

    return {
      id: technician.id,
      name: technician.name,
      email: technician.email,
      phone: technician.phone,
    };
  } catch (error) {
    throw new Error(`Failed to fetch technician: ${error.message}`);
  }
};

module.exports = {
  getTechnicians,
  getTechnicianById,
};
