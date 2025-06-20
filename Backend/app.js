const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { sequelize } = require('./models');
const RolesMiddleware = require('./middleware/RolesMiddleware');
const { getAllItems, createItem, updateItem, deleteItem } = require('./controllers/electronicsItemController');
const { registerUser } = require('./controllers/registrationController');
const validateRegistration = require('./middleware/validateRegisteration');
const { signInUser } = require('./controllers/signInController');
const JWTAuth = require('./middleware/JWTAuth');

const app = express();
app.use(cors());
app.use(express.static('dist'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test Sequelize connection (optional)
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Sequelize connected');
  } catch (err) {
    console.error('Sequelize connection error:', err);
    process.exit(1);
  }
})();

app.get('/', (req, res) => res.json({ message: 'Welcome to NodeJS API.' }));

app.post('/register', validateRegistration, registerUser);
app.post('/signin', signInUser);

app.get('/all_items', JWTAuth, getAllItems);
app.post('/create_item', JWTAuth, RolesMiddleware.verifyAdmin, createItem);
app.put('/update/item/:id', JWTAuth, RolesMiddleware.verifyAdminOrMod, updateItem);
app.delete('/delete/item/:id', JWTAuth, RolesMiddleware.verifyAdmin, deleteItem);

module.exports = app;