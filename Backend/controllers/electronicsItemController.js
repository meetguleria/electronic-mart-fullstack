const { ElectronicsItem } = require('../models');

async function getAllItems(req, res) {
  try {
    const items = await ElectronicsItem.findAll();
    return res.status(200).json({ items });
  } catch (err) {
    console.error('Error fetching items:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

async function createItem(req, res) {
  // Validate payload structure
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return res.status(400).json({ message: 'Invalid payload' });
  }

  const { item_name, item_quantity } = req.body;

  // Check required fields
  if (item_name === undefined || item_quantity === undefined) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  // Validate types
  if (typeof item_name !== 'string') {
    return res.status(400).json({ message: 'Invalid item_name' });
  }
  if (!Number.isSafeInteger(item_quantity)) {
    return res.status(400).json({ message: 'Invalid item_quantity' });
  }

  // Validate constraints
  if (item_name.length > 255) {
    return res.status(400).json({ message: 'Invalid item_name' });
  }
  if (item_quantity < 0) {
    return res.status(400).json({ message: 'Invalid item_quantity' });
  }

  // Sanitize item_name: remove script tags
  const sanitizedItemName = item_name.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');

  try {
    const item = await ElectronicsItem.create({
      item_name: sanitizedItemName,
      item_quantity
    });
    return res.status(201).json({ message: 'Item created!', item });
  } catch (err) {
    console.error('Error creating item:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

async function updateItem(req, res) {
  try {
    const { id } = req.params;
    const [updated] = await ElectronicsItem.update(
      { item_name: req.body.item_name, item_quantity: req.body.item_quantity },
      { where: { item_id: id } }
    );
    if (!updated) {
      return res.status(404).json({ message: 'Item not found' });
    }
    return res.status(200).json({ message: 'Item updated!' });
  } catch (err) {
    console.error('Error updating item:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

async function deleteItem(req, res) {
  const idNum = parseInt(req.params.id, 10);
  if (isNaN(idNum)) {
    return res.status(404).json({ message: 'Item not found' });
  }
  try {
    const deleted = await ElectronicsItem.destroy({ where: { item_id: idNum } });
    if (!deleted) {
      return res.status(404).json({ message: 'Item not found' });
    }
    return res.status(200).json({ message: 'Item deleted!' });
  } catch (err) {
    console.error('Error deleting item:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

module.exports = {
  getAllItems,
  createItem,
  updateItem,
  deleteItem
};