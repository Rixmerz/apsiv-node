/**
 * Example controller with basic CRUD operations
 */

// Get all items
const getAllItems = async (req, res) => {
  try {
    // Example implementation
    res.status(200).json({ message: 'Get all items' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get item by ID
const getItemById = async (req, res) => {
  try {
    const { id } = req.params;
    // Example implementation
    res.status(200).json({ message: `Get item with ID: ${id}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new item
const createItem = async (req, res) => {
  try {
    const data = req.body;
    // Example implementation
    res.status(201).json({ message: 'Item created', data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update item
const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    // Example implementation
    res.status(200).json({ message: `Item ${id} updated`, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete item
const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    // Example implementation
    res.status(200).json({ message: `Item ${id} deleted` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem
};
