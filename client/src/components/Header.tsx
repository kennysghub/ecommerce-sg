import Nav from "./Nav";
import useCart from "../hooks/useCart";
import { signOut } from "../api/AuthService";
import { useNavigate } from "react-router-dom";

type PropsType = {
  viewCart: boolean;
  setViewCart: React.Dispatch<React.SetStateAction<boolean>>;
};

const Header = ({ viewCart, setViewCart }: PropsType) => {
  const { totalItems, totalPrice } = useCart();
  const navigate = useNavigate();

  const handleSignOut = () => {
    signOut();
    navigate("/signin");
  };

  const content = (
    <header className="header">
      <div className="header__title-bar">
        <h1>sweetgreen</h1>
        <div className="header__price-box">
          <p>Total Items:{totalItems}</p>
          <p>Total Price:{totalPrice}</p>
        </div>
      </div>
      <button onClick={handleSignOut}>Sign Out</button>
      <Nav viewCart={viewCart} setViewCart={setViewCart} />
    </header>
  );

  return content;
};

export default Header;
