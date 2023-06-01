const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWTString = process.env.JWT_STRING;

const JWTAuth = (req, res, next) => {
  // Extract token from the authorization header
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(401).json({ message: 'Token Missing' });
    }

    if (authHeader && authHeader.startsWith('Bearer ')) {

        const token = authHeader.replace('Bearer ', '')
        console.log(token)
        jwt.verify(token, JWTString, (err, decodedToken) => {
            if (err) {
                console.error('Error verifying token:', err);
                return res.status(401).json({ message: 'Invalid Token' });
            }
            req.user_id = decodedToken;
            next();
        });
    }   else    {
        return res.status(401).json({ message: 'Invalid Token' });
    }
}

module.exports = JWTAuth;
