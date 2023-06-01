allItemsController = (client) => {
    const getAllItems = (req, res) => {
        //Fetch all items from the database
        client.query('SELECT * FROM electronics_items', (err, results) => {
            if (err) {
                console.error('Error fetching items:', err);
                return res.status(500).json({ message: 'Internal Server Error' });
            }

            const items = results.rows;
            res.status(200).json({ items });
        });
    };
    return { getAllItems };
};

createItemsController = (client) => {
    const createItem = (req, res) => {

        //Extract item details from the request body
        const { item_name, item_quantity } = req.body;

        client.query(
            //Insert into the table: item name and item quantity.
            'INSERT INTO electronics_items (item_name, item_quantity) VALUES ($1, $2)',
            [item_name, item_quantity],
            (err) => {
                if (err) {
                    console.error('Error creating item:', err)
                    return res.status(500).json({ message: 'Internal Server Error' });
                }
                res.status(201).json({ message: 'Item created!' });
            });
        };
        return { createItem };
};

updateItemController = (client) => {
    const updateItem = (req, res) => {
    const itemId = req.params.id;
    const { item_name, item_quantity } = req.body;

    // Check if the item exists
    client.query(
        'SELECT * FROM electronics_items WHERE item_id = $1',
        [itemId],
        (err, result) => {
            if (err) {
                console.error('Error updating item:', err);
                return res.status(500).json({ message: 'Internal Server Error' });
            }

            if (result.rowCount === 0) {
                return res.status(404).json({ message: 'Item not found' });
            }
        });

          // Update the item
        client.query(
            'UPDATE electronics_items SET item_name = $1, item_quantity = $2 WHERE item_id = $3',
            [item_name, item_quantity, itemId],
            (err) => {
                if (err) {
                    console.error('Error updating item:', err);
                    return res.status(500).json({ message: 'Internal Server Error' });
                }
                res.status(200).json({ message: 'Item updated!' });
            }
        );
    };
    return { updateItem };
};

deleteItemController = (client) =>{
    const deleteItem = (req, res) => {
        const itemId = req.params.id;

        client.query(
            'DELETE FROM electronics_items WHERE item_id = $1',
            [itemId],
            (err, result) => {
                if (err) {
                    console.error('Error deleting item:', err);
                    return res.status(500).json({ message: 'Internal Server Error' })
                }

                if (result.rowCount === 0) {
                    return res.status(404).json({ message: 'Item not found' });
                }

                res.status(200).json({ message: 'Item deleted!'});
            }
        );
    };
    return { deleteItem };
};

const CRUDControllers = {
    allItemsController: allItemsController,
    createItemsController: createItemsController,
    updateItemController: updateItemController,
    deleteItemController: deleteItemController
}

module.exports = CRUDControllers;