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
  try {
    const { item_name, item_quantity } = req.body;
    const item = await ElectronicsItem.create({ item_name, item_quantity });
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
  try {
    const { id } = req.params;
    const deleted = await ElectronicsItem.destroy({ where: { item_id: id } });
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