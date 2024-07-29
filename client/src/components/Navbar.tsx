import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { setIsAuthenticated, isAuthenticated } = useAuth();

  const navigate = useNavigate();
  const handleSignOut = () => {
    console.log('Removing token from local storage and signing user out...');
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    navigate('/');
  };

  return (
    <div className="container navbar">
      {isAuthenticated ? (
        <nav className="nav-links">
          <Link to="/home">Home</Link>
          <Link to="/cart">Cart</Link>
          <button className="sign-out-button" onClick={handleSignOut}>
            Sign Out
          </button>
        </nav>
      ) : (
        <nav className="nav-links">
          <Link to="/signin">Sign In</Link>
          <Link to="/signup">Sign Up</Link>
        </nav>
      )}
    </div>
  );
};

export default Navbar;
