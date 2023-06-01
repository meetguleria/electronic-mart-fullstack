import { Link } from 'react-router-dom';

function Footer() {
    return (
        <footer>
            <div className="footer-links">
                <Link to="/about">About</Link>
                <Link to="/contact">Contact</Link>
            </div>
            <div className="footer-developer">
                Developed by Meet Guleria
            </div>
        </footer>
    );
}

export default Footer;
