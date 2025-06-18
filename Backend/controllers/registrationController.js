const bcrypt = require('bcryptjs');
const { User } = require('../models');
const saltRounds = 10;

async function registerUser(req, res) {
  try {
    const { username, email, password } = req.body;
    const role_id = req.role_id; // set by validateRegistration middleware

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create the user via Sequelize
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role_id
    });

    return res.status(201).json({ message: 'User registered successfully.', user_id: user.user_id });
  } catch (err) {
    console.error('Error registering user:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

module.exports = { registerUser };