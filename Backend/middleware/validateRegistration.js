const { User, Role, Sequelize } = require('../models');
const { Op } = Sequelize;
const validator = require('validator');

async function validateRegistration(req, res, next) {
  const { username, email, password, role_name } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'username, email and password are required' });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W]).{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({ message: 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character' });
  }

  // Check if username or email already exist
	try {
    const existing = await User.findOne({
      where: {
        [Op.or]: [{ username }, { email }]
      }
    });
    if (existing) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }
  } catch (err) {
    console.error('Error checking username/email existence:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }

  // Determine role_id
  let role;
  try {
    if (role_name) {
      role = await Role.findOne({ where: { role_name } });
      if (!role) {
        return res.status(400).json({ message: 'Invalid role specified.' });
      }
    } else {
      role = await Role.findOne({ where: { role_name: 'user' } });
    }
  } catch (err) {
    console.error('Error checking role existence:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }

  req.role_id = role.role_id;
  next();
}

module.exports = validateRegistration;