const validateRegistration = (client) => {
    return (req, res, next) => {
        const { username, email, password, role_name } = req.body;

        //check if username or email already exist in db
        client.query(
            'SELECT * FROM users WHERE username = $1 OR email = $2',
            [username, email],
            (err, result) => {
                if (err) {
                    console.log('Error checking username/email existence', err);
                    return res.statue(500).json({ message: "Internal Server Error"})
                }
                if (result.rows.length > 0) {
                    return res.status(400).json({ message: 'Username or email exists' });
                }
                // If no role is defined, then we set the default role as 'user'
                let role_id;
                if (!role_name) {
                    role_id = 2; //Setting 'user' as default role since no role mentioned
                    req.role_id = role_id; //Store the role_id in the request object
                    next();
                    return;
                }

                //Now we check if specified role exists
                client.query(
                    'SELECT role_id FROM roles WHERE role_name = $1',
                    [role_name],
                    (err, result) => {
                        if (err) {
                            console.error('Error check role existence.')
                        }
                        if (result.rows.length === 0) {
                            return res.status(400).json({ message: 'Invalid role specified.' });
                        }

                        role_id = result.rows[0].role_id;
                        req.role_id = role_id;
                        next();
                    }
                )
            }
        )
    }
}

module.exports = validateRegistration;