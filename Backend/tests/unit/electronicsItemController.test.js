jest.mock('../../models', () => ({
  ElectronicsItem: {
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn()
  }
}));

const {
  getAllItems,
  createItem,
  updateItem,
  deleteItem
} = require('../../controllers/electronicsItemController');

const { ElectronicsItem } = require('../../models');

describe('electronicsItemController', () => {
  let req;
  let res;

  beforeEach(() => {
    // Reset mock implementations and mock data
    jest.clearAllMocks();
    req = { params: {}, body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe('getAllItems', () => {
    it('should respond with items when findAll succeeds', async () => {
      const mockItems = [{ item_id: 1, item_name: 'Phone', item_quantity: 3 }];
      ElectronicsItem.findAll.mockResolvedValue(mockItems);

      await getAllItems(req, res);

      expect(ElectronicsItem.findAll).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ items: mockItems });
    });

    it('should respond with 500 on error', async () => {
      ElectronicsItem.findAll.mockRejectedValue(new Error('DB error'));

      await getAllItems(req, res);

      expect(ElectronicsItem.findAll).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Internal Server Error' });
    });
  });

  describe('createItem', () => {
    it('should create and return new item on success', async () => {
      req.body = { item_name: 'Tablet', item_quantity: 5 };
      const newItem = { item_id: 2, item_name: 'Tablet', item_quantity: 5 };
      ElectronicsItem.create.mockResolvedValue(newItem);

      await createItem(req, res);

      expect(ElectronicsItem.create).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: 'Item created!', item: newItem });
    });

    it('should respond with 500 on error', async () => {
      req.body = { item_name: 'Tablet', item_quantity: 5 };
      ElectronicsItem.create.mockRejectedValue(new Error('DB error'));

      await createItem(req, res);

      expect(ElectronicsItem.create).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Internal Server Error' });
    });
  });

  describe('updateItem', () => {
    it('should update an existing item and respond 200', async () => {
      req.params.id = '3';
      req.body = { item_name: 'Camera', item_quantity: 7 };
      ElectronicsItem.update.mockResolvedValue([1]);

      await updateItem(req, res);

      expect(ElectronicsItem.update).toHaveBeenCalledWith(
        { item_name: 'Camera', item_quantity: 7 },
        { where: { item_id: '3' } }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Item updated!' });
    });

    it('should respond 404 when no rows are updated', async () => {
      req.params.id = '3';
      ElectronicsItem.update.mockResolvedValue([0]);

      await updateItem(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Item not found' });
    });

    it('should respond with 500 on error', async () => {
      req.params.id = '3';
      ElectronicsItem.update.mockRejectedValue(new Error('DB error'));

      await updateItem(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Internal Server Error' });
    });
  });

  describe('deleteItem', () => {
    it('should delete an existing item and respond 200', async () => {
      req.params.id = '4';
      ElectronicsItem.destroy.mockResolvedValue(1);

      await deleteItem(req, res);

      expect(ElectronicsItem.destroy).toHaveBeenCalledWith({ where: { item_id: '4' } });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Item deleted!' });
    });

    it('should respond 404 when no rows are deleted', async () => {
      req.params.id = '4';
      ElectronicsItem.destroy.mockResolvedValue(0);

      await deleteItem(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Item not found' });
    });

    it('should respond with 500 on error', async () => {
      ElectronicsItem.destroy.mockRejectedValue(new Error('DB error'));

      await deleteItem(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Internal Server Error' });
    });
  });
});