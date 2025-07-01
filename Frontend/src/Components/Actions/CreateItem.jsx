import { useState } from 'react';
import api from '../../Services/api';

const CreateItem = ({ fetchItems, onClose }) => {
    const [itemName, setItemName] = useState('');
    const [itemQuantity, setItemQuantity] = useState('');

    const handleFormSubmit = (e) => {
        e.preventDefault();

        // Creating object with the item data
        const newItem = {
            item_name: itemName,
            item_quantity: Number(itemQuantity),
        };

        // Make a POST request to create the item
        api.post('/create_item', newItem)
            .then((response) => {
                fetchItems();
                onClose();
                console.log('Item created:', response.data);
            })
            .catch((error) => {
                console.log('Error creating item:', error);
            });
        setItemName('');
        setItemQuantity('');
    };

    return (
        <div>
            <h2>Create Item:</h2>
            <form onSubmit={handleFormSubmit}>
                <div>
                    <label htmlFor='item-name'>Item Name:</label>
                    <input 
                        type="text"
                        id="item-name"
                        value={itemName}
                        onChange={(e) => setItemName(e.target.value)}
                    />
                </div>
                <div>
                    <label htmlFor='item-quantity'>Item Quantity:</label>
                    <input
                        type="text"
                        id="item-quantity"
                        value={itemQuantity}
                        onChange={(e) => setItemQuantity(e.target.value)}
                    />
                </div>
                <button type="submit">Create</button>
                <button 
                    type="button"
                    onClick={() => {
                        onClose();
                        setItemName('');
                        setItemQuantity('');
                    }}
                >
                    Cancel
                </button>
            </form>
        </div>
    )
}

export default CreateItem;