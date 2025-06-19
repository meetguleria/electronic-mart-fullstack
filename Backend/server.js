const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { sequelize } = require('./models');

const RolesMiddleware = require('./middleware/RolesMiddleware');
const {
  getAllItems,
  createItem,
  updateItem,
  deleteItem
} = require('./controllers/electronicsItemController');
const { registerUser } = require('./controllers/registrationController');
const validateRegistration = require('./middleware/validateRegisteration');
const { signInUser } = require('./controllers/signInController');
const JWTAuth = require('./middleware/JWTAuth');

const app = express();

app.use(cors());

app.use(express.static('dist'))

//parse requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test Sequelize connection
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Sequelize connected to database');
  } catch (err) {
    console.error('Unable to connect to database via Sequelize:', err);
    process.exit(1);
  }
})();

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to NodeJS API.'})
})
//Registration Route
app.post('/register', validateRegistration, registerUser);
//Login Route
app.post('/signin', signInUser);

//Get all electronics items list
app.get('/all_items', JWTAuth, getAllItems);

//Only admin can create new items middleware will check for admin role
app.post('/create_item', JWTAuth, RolesMiddleware.verifyAdmin, createItem);

//Only mod or admin can update the item info
app.put('/update/item/:id', JWTAuth, RolesMiddleware.verifyAdminOrMod, updateItem);

//Only admin can delete the items
app.delete('/delete/item/:id', JWTAuth, RolesMiddleware.verifyAdmin, deleteItem);

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
