const bcrypt = require('bcryptjs');
const saltRounds = 10;

const registrationController = (client) => {
    const registerUser = (req, res) => {
        const { username, email, password } = req.body;
        const role_id = req.role_id; // Assuming it has been set by the registeration validation middleware

        //Hash the password
        bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
            if (err) {
                console.error('Error hashing password:', err);
                return res.status(500).json({ message: 'Internal Server Error' });
        }
        //We will execute INSERT query to add the user to the 'users' table
        client.query(
            'INSERT INTO users (username, email, password, role_id) VALUES ($1, $2, $3, $4)',
            [username, email, hashedPassword, role_id],
            (err) => {
                if (err) {
                    console.error('Error registering user: ', err);
                    return res.status(500).json({ message: 'Internal Server Error.'})
                }
                res.status(200).json({ message: 'User registered successfully.'})
            }
        )
        })
    }
    return { registerUser };
}

module.exports = registrationController;