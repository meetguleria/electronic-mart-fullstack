import { Link } from 'react-router-dom';

import { FiMonitor } from 'react-icons/fi';

function Navbar() {
  return (
    <nav>
      <div className='logo-container'>
        <Link to = "/" className='logo'>
            <FiMonitor className='logo-icon'/> 
            <span className='logo-text'>Electronics Mart</span>
        </Link>
      </div>
      <ul className='nav-links'>
        <button>
          <Link to = '/'>
            Home
          </Link>
        </button>
        <button>
          <Link to = '/signup'>
            Sign Up
          </Link>
        </button>
        <button>
          <Link to = '/signin'>
            Sign In
          </Link>
        </button>
        <button>
          <Link to = '/about'>
            About
          </Link>
        </button>
        <button>
          <Link to = '/contact'>
            Contact
          </Link>
        </button>
      </ul>
    </nav>
  )
}

export default Navbar;