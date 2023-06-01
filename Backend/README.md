# Electronic Mart API

The Electronic Mart API is a Node.js-based API for managing electronic items within an online marketplace. It provides endpoints for registration, authentication, CRUD operations on electronic items, and role-based access control.

## PostgreSQL Schema

The API uses a PostgreSQL database with the following schema:

- Roles table:
  - `role_id`: A unique identifier for each role (serial primary key).
  - `role_name`: The name of the role(varchar, not null).

- Users table:
  - `user_id`: A unique identifier for each user (serial primary key).
  - `username`: The username of the user (varchar, not null).
  - `email`: The email address of the user (varchar, not null).
  - `password`: The password of the user (varchar, not null).
  - `role_id`: The foreign key referencing the role assigned to the user (int, not null, foreign key referencing `roles.role_id`).
  - The `role_id` column in the `users` table refrences the `role_id` column
    in the `roles` table, establishing a relatship between the two tables.

- Electronics Items table:
  - `item_id`: A unique identifier for each electronic item. (serial primary key)
  - `item_name`: The name of the electronic item (varchar, not null).
  - `item_quantity`: The quantity of the electronic item (integer, not null).
  - `date_created`: (timestamp with default value of current timestamp)
  - `is_deleted`: (boolean with default value of false)

## Connection to ElephantSQL

The Electronic Mart API connects to an ElephantSQL database using a connection string stored as the `CONN_STRING` environment variable. The API uses the `pg` library to establish a connection with the ElephantSQL database.

## Authentication with JWT

The API implements authentication using JSON Web Tokens (JWT). Upon successful login, a JWT is generated and included in the response. Subsequent requests to protected routes require the JWT to be included in the `Authorization` header as a Bearer token.

## Getting Started

To get started with the Electronic Mart API:

1. Clone the repository.
2. Set up a PostgreSQL database and obtain the connection string.
3. Set up the environment variables:
    - `CONN_STRING`: The connection string for the ElephantSQL DB.
    - `JWT_SECRET`: The secret key used for JWT Authentication.
4. Install the required dependencies: `npm install`.
5. Start the API server: `node server.js`.

The API will start running on `http://localhost:8080`.

## API Endpoints

The Electronic Mart API provides the following endpoints:
- `POST /register`: Register a new user.
- `POST /signin`: Sign in and authenticate a user.
- `GET /all_items`: Get a list of all electronic items.
- `POST /create_item`: Create a new electronic item.
- `PUT /update/item/:id`: Update the details of an electronic item.
- `DELETE /delete/item/:id`: Delete an electronic item.

