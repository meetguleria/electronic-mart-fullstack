import Layout from "../Layout/Layout"

function Home() {
    return (
        <Layout>
    <div className="home-container">
      <h2>Welcome to Electronics Mart</h2>
      <p>
        Electronics Mart is an online platform built with ReactJS, Node.js, Express, PostgreSQL, and JSON Web Token (JWT). It provides a secure authentication system for users to sign in and access various features based on their roles and permissions.
      </p>
      <p>
        The backend of the application is created using Node.js and Express, which handle the server-side operations and interact with the PostgreSQL database for storing and retrieving data.
      </p>
      <p>
        Sign-in authentication in this app is implemented using JSON Web Token (JWT). When a user successfully signs in, a token is generated and sent back to the client. This token is then used to authenticate subsequent requests to protected routes by including it in the Authorization header.
      </p>
      <p>
        The application has different roles and permissions. The admin role has full CRUD (Create, Read, Update, Delete) rights, allowing them to manage electronic items, including adding, editing, and deleting them. A moderator (mod) role can view and update electronic item details but doesn't have the ability to delete items. Regular users have limited permissions and can only view the items.
      </p>
    </div>
        </Layout>
    )
}

export default Home