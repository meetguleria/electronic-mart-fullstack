const bcrypt = require('bcryptjs');
const registrationController = require('../controllers/registrationController');

//Mocking the client object 
const client = {
    query: jest.fn(),
};

describe('registrationController', () => {
    it('should register a user', () => {
        const req = {
            body: {
                username: 'testuser',
                email: 'test@gmail.com',
                password: 'testuser1234',
            },
            role_id: 1,
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        //Mocking the bcrypt hash functionality for return a hashed password
        bcrypt.hash = jest.fn().mockImplementation((password, saltRounds, callback) => {
            callback(null, 'hashedPassword');
        });

        client.query.mockImplementation((query, values, callback) => {
            callback(null);
        })

        registrationController(client).registerUser(req, res);

        expect(bcrypt.hash).toHaveBeenCalledWith(
            'testuser1234',
            10,
            expect.any(Function)
        );

        expect(client.query).toHaveBeenCalledWith(
            'INSERT INTO users (username, email, password, role_id) VALUES ($1, $2, $3, $4)',
            ['testuser', 'test@gmail.com', 'hashedPassword', 1],
            expect.any(Function)
        );

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: 'User registered successfully.'});
    });

    it('should handler error while registering a user', () => {
        const req = {
            body: {
                username: 'testuser',
                email: 'test@gmail.com',
                password: 'testuser1234',
            },
            role_id: 1,
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        bcrypt.hash = jeest.fn().mockImplementation((password, saltRounds, callback) => {
            callback(new Error ('Hashing error'));
        });

        client.query.mockImplementation((query, values, callback) => {
            callback(new Error('Database error'));
        });
    })
})

