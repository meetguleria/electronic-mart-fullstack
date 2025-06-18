// controllers/signInController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
require('dotenv').config();

const JWTString = process.env.JWT_STRING;

async function signInUser(req, res) {
  try {
    const { username, password } = req.body;

    // Find the user by username
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Verify the hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Generate and sign the JWT with user_id and role_id
    const token = jwt.sign(
      { user_id: user.user_id, role_id: user.role_id },
      JWTString,
      { expiresIn: '1h' }
    );

    return res.json({
      token,
      username: user.username,
      user_id: user.user_id,
      role_id: user.role_id
    });
  } catch (err) {
    console.error('Error signing in:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

module.exports = { signInUser };
