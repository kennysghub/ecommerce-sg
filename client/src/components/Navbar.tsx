import { Link } from "react-router-dom";
const Navbar = () => {
  return (
    <div className="container navbar">
      <Link to="/">Home</Link>
      <nav className="nav-links">
        <Link to="/products">Products</Link>
        <Link to="/checkout">Checkout</Link>
      </nav>
    </div>
  );
};

export default Navbar;
