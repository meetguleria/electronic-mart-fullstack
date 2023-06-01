const CRUDControllers = require('../controllers/CRUDControllers');

const client = {
    query: jest.fn(),
};

describe('CRUDControllers', () => {
    describe('allItemsController', () => {
        it('should fetch all items from the electronics_items table from db', () => {
            const req = {};
            const res = {
                json: jest.fn(),
                status: jest.fn().mockReturnThis(),
            };

            client.query.mockImplementation((query, callback) => {
                //Simulate
                const results = { rows: [{ item_id: 1, item_name: 'Television', item_quantity: 5 }] };
                callback(null, results);
            });

            CRUDControllers.allItemsController(client).getAllItems(req, res);

            expect(client.query).toHaveBeenCalledWith('SELECT * FROM electronics_items', expect.any(Function));
            expect(res.json).toHaveBeenCalledWith({ items: [{ item_id: 1, item_name: 'Television', item_quantity: 5 }] });
            expect(res.status).toHaveBeenCalledWith(200);
        });
        it('should handle error while fetching items', () => {
            const req = {};
            const res = {
                json: jest.fn(),
                status: jest.fn().mockReturnThis(),
            };

            client.query.mockImplementation((query, callback) => {
                // Simulate error during query execution
                const error = new Error('Database error');
                callback(error);
            });

            CRUDControllers.allItemsController(client).getAllItems(req, res);

            expect(client.query).toHaveBeenCalledWith('SELECT * FROM electronics_items', expect.any(Function));
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.status(500).json).toHaveBeenCalledWith({ message: 'Internal Server Error' });
        });
    });

    describe('createItemsController', () => {
        it('should create a new item', () => {
            const req = {
                body: {
                    item_name: 'Television',
                    item_quantity: 5,
                },
            };
            const res = {
                json: jest.fn(),
                status: jest.fn().mockReturnThis(),
            };

            client.query.mockImplementation((query, values, callback) => {
                //Simulating successful item creation
                callback(null);
            });

            CRUDControllers.createItemsController(client).createItem(req, res);

            expect(client.query).toHaveBeenCalledWith(
                'INSERT INTO electronics_items (item_name, item_quantity) VALUES ($1, $2)',
                ['Television', 5],
                expect.any(Function)
            );
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.status().json).toHaveBeenCalledWith({ message: 'Item created!' });
        });

        it('should handle error while creating item', () => {
            const req = {
                body: {
                    item_name: 'Television',
                    item_quantity: 5,
                },
            };
            const res = {
                json: jest.fn(),
                status: jest.fn().mockReturnThis(),
            };

            client.query.mockImplementation((query, values, callback) => {
                //Simulate error during item creation
                const error = new Error('Database error');
                callback(error);
            });

            CRUDControllers.createItemsController(client).createItem(req, res);

            expect(client.query).toHaveBeenCalledWith(
                'INSERT INTO electronics_items (item_name, item_quantity) VALUES ($1, $2)',
                ['Television', 5],
                expect.any(Function)
            );
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Internal Server Error'})
        });
    });

    describe('updateItemController', () => {
        it('should update an existing item', () => {
          // Create mock request and response objects
            const req = {
                params: {
                id: 1,
                },
                body: {
                    item_name: 'Updated Television',
                item_quantity: 10,
                },
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };
            // Mock the client.query method to simulate successful update
            client.query.mockImplementation((query, values, callback) => {
            // Simulate a successful SELECT query
                if (query.startsWith('SELECT')) {
                const results = { rowCount: 1 };
                callback(null, results);
                }
            // Simulate a successful UPDATE query
                else if (query.startsWith('UPDATE')) {
                    callback(null);
                }
            });
          // Call the updateItem function
            updateItemController(client).updateItem(req, res);

          // Verify the expected behavior
            expect(client.query).toHaveBeenCalledWith(
                'SELECT * FROM electronics_items WHERE item_id = $1',
                [req.params.id],
                expect.any(Function)
            );
            expect(client.query).toHaveBeenCalledWith(
                'UPDATE electronics_items SET item_name = $1, item_quantity = $2 WHERE item_id = $3',
                [req.body.item_name, req.body.item_quantity, req.params.id],
                expect.any(Function)
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'Item updated!' });
        });
    });
    
    describe('deleteItemController', () => {
        it('should delete an item', () => {
            const req = {
                params: {
                    id: 1,
                },
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            }
            //Mock query 
            client.query.mockImplementation((query, values, callback) => {
                //
                if (query.startsWith('DELETE')) {
                    const results = { rowCount: 1 };
                    callback(null, results);
                }
            });
            //Calling the deleteItemController
            CRUDControllers.deleteItemController(client).deleteItem(req, res);

            //Verifying the expected behavior
            expect(client.query).toHaveBeenCalledWith(
                'DELETE FROM electronics_items WHERE item_id = $1',
                [req.params.id],
                expect.any(Function)
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'Item deleted!' });
        });
    });
});