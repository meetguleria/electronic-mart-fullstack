import { useState, useEffect } from 'react';

import CreateItem from './Actions/CreateItem';

import axios from 'axios';
import jwt_decode from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { AiFillEdit } from 'react-icons/ai'
import { MdDeleteForever } from 'react-icons/md';

const Dashboard = () => {

    const API_BASE_URL = import.meta.env.VITE_BASE_URL;

    const navigate = useNavigate();

    const [electronicItems, setElectronicItems] = useState([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [roleId, setRoleId] = useState(null);

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
            const response = await axios.get(`${API_BASE_URL}/all_items`, {
                headers: {
                    authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
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
        const itemId = item.item_id;

        axios.delete(`${API_BASE_URL}/delete/item/${itemId}`, {
            header: {
                authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        })
            .then((response) => {
                console.log('Item deleted:', response.data.message);
                fetchItems();
            })
            .catch((error) => {
                console.error('Error deleting item:', error);
            });
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