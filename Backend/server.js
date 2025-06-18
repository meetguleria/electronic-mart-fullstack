const express = require('express');
const cors = require('cors');
const { Client } = require('pg');
require('dotenv').config();

const RolesMiddleware = require('./middleware/RolesMiddleware');
const {
  getAllItems,
  createItem,
  updateItem,
  deleteItem
} = require('./controllers/electronicsItemController');
const registrationController = require('./controllers/registrationController');
const validateRegistration = require('./middleware/validateRegisteration');
const signInController = require('./controllers/signInController');
const JWTAuth = require('./middleware/JWTAuth');
const connString = process.env.CONN_STRING;

const app = express();

app.use(cors());

app.use(express.static('dist'))

//parse requests 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const client = new Client(connString);

client.connect((err) => {
    if (err) {
        console.error('Error connecting to the database: ', err);
        process.exit(1); // Terminate the connection
    }
    console.log('Connected to the database');
})

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to NodeJS API.'})
})
//Registration Route
app.post('/register', validateRegistration(client), registrationController(client).registerUser);
//Login Route
app.post('/signin', signInController(client).signInUser);

//Get all electronics items list
app.get('/all_items', JWTAuth, CRUDControllers.allItemsController(client).getAllItems);

//Only admin can create new items middleware will check for admin role
app.post('/create_item', JWTAuth, RolesMiddleware.verifyAdmin, CRUDControllers.createItemsController(client).createItem);

//Only mod or admin can update the item info
app.put('/update/item/:id', JWTAuth, RolesMiddleware.verifyAdminOrMod, CRUDControllers.updateItemController(client).updateItem);

//Only admin can delete the items
app.delete('/delete/item/:id', JWTAuth, RolesMiddleware.verifyAdmin, CRUDControllers.deleteItemController(client).deleteItem)

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
