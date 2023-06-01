const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWTString = process.env.JWT_STRING;

const signInController = (client) => {
    const signInUser = (req, res) => {
        const { username, password } = req.body;

        // Check if username exists in the database
        client.query(
            'SELECT * FROM users WHERE username = $1',
            [username],
            (err, result) => {
                if (err) {
                    console.error('Error signing in:', err);
                    return res.status(500).json({ message: 'Internal Server Error' });
                }
                if (result.rows.length === 0) {
                    return res.status(401).json({ message: 'Invalid username or password' });
                }

                const user = result.rows[0];

                // Verify the hashed password
                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if (err) {
                        console.error('Error comparing passwords:', err);
                        return res.status(500).json({ message: 'Internal Server Error' });
                    }
                    if (!isMatch) {
                        return res.status(401).json({ message: 'Invalid username or password' });
                    }

                    // Generate and sign the JWT with user_id and role_id
                    const token = jwt.sign(
                        { user_id: user.user_id, role_id: user.role_id },
                        JWTString,
                        { expiresIn: '1h' }
                    );

                    res.json({
                        token,
                        username: user.username,
                        user_id: user.user_id,
                        role_id: user.role_id
                    });
                });
            }
        );
    };
    return { signInUser };
};

module.exports = signInController;
