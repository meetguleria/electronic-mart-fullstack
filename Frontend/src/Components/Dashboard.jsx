import { useState, useEffect } from 'react';

import CreateItem from './Actions/CreateItem';
import ConfirmModal from './ConfirmModal';
import api from '../Services/api';

import jwt_decode from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { AiFillEdit } from 'react-icons/ai'
import { MdDeleteForever } from 'react-icons/md';

const Dashboard = () => {
    const navigate = useNavigate();

    const [electronicItems, setElectronicItems] = useState([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [roleId, setRoleId] = useState(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            const decoded = jwt_decode(storedToken)
            const role_Id = decoded.role_id;
            setRoleId(role_Id)
            fetchItems();
        } else {
            navigate('/signin')
        }

    }, []);

    const fetchItems = async () => {
        try {
            const response = await api.get('/all_items');
            setElectronicItems(response.data.items);
        } catch (error) {
            console.error(error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token')
        navigate('/signin');
    };

    const renderButtons = (item) => {
        if (roleId === 1) {
            return (
                <div className='edit-delete-buttons'>
                    <button onClick={() => handleEdit(item)} className='edit-button'><AiFillEdit /></button>
                    <button onClick={() => handleDelete(item)}><MdDeleteForever /></button>
                </div>
            )
        } else if (roleId === 3) {
            return <button onClick={() => handleEdit(item)}>Edit</button>
        }
        return null;
    }

    const handleCreateItemClick = () => {
        setShowCreateForm(true);
    }

    const handleEdit = (item) => {
        console.log('Edit item:', item)
    }

    const handleDelete = (item) => {
        setItemToDelete(item);
        setConfirmOpen(true);
    };
    const confirmDelete = () => {
        api.delete(`/delete/item/${itemToDelete.item_id}`)
            .then((response) => {
                console.log('Item deleted:', response.data.message);
                fetchItems();
            })
            .catch(error => console.error('Error deleting item:', error))
            .finally(() => {
                setConfirmOpen(false);
                setItemToDelete(null);
            });
        };

    const cancelDelete = () => {
        setConfirmOpen(false);
        setItemToDelete(null);
    };

    return (
        <div className='dashboard-container'>
            <div className='dashboard-header'>
                <h2>Welcome to your Dashboard.</h2>
            </div>
            <div className="nav-links">
                <button onClick={handleCreateItemClick} >Create New Item</button>
                <button onClick={handleLogout} >Log Out</button>
            </div>
            {showCreateForm && (
                <CreateItem
                fetchItems={fetchItems}
                onClose={() => setShowCreateForm(false)}
                />
            )}
            {confirmOpen && (
                <ConfirmModal
                    message={`Delete "${itemToDelete.item_name}"?`}
                    onConfirm={confirmDelete}
                    onCancel={cancelDelete}
                />
            )}
            <table className='dashboard-table'>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Quantity</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {electronicItems.map((item) => (
                        <tr key={item.item_id}>
                            <td>{item.item_name}</td>
                            <td>{item.item_quantity}</td>
                            <td>{renderButtons(item)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default Dashboard;