import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { signOut } from '../api/AuthService';
const Navbar = () => {
  const navigate = useNavigate();
  const handleSignOut = () => {
    signOut();
    navigate('/')
  }
  return (
    <div className="container navbar">
      <Link to="/home">Home</Link>
      <nav className="nav-links">
        <Link to="/">Sign In</Link>
        <Link to="/signup">Sign Up</Link>
        {/* <Link to="/checkout">Checkout</Link> */}
        <Link to="/cart">Cart</Link>
      </nav>
        <button className='sign-out-button'onClick={handleSignOut}>Sign Out</button>
    </div>
  );
};

export default Navbar;
