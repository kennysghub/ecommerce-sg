import { useState } from "react";
import useCart from "../hooks/useCart";
import CartLineItem from "../components/CartLineItem";
// import { useAuth } from "../context/AuthContext";
const Checkout = () => {
  const { dispatch, REDUCER_ACTIONS, totalItems, totalPrice, cart } = useCart();
  const [confirm, setConfirm] = useState<boolean>(false);
  // const { user, loading } = useAuth();

  const onSubmitOrder = () => {
    setConfirm(true);
  };
  return (
    <div>
      <h2>Checkout Page</h2>
      <ul className="cart">
        {cart.map((item) => {
          return (
            <CartLineItem
              key={item.sku}
              item={item}
              dispatch={dispatch}
              REDUCER_ACTIONS={REDUCER_ACTIONS}
            />
          );
        })}
      </ul>
      <div className="cart__totals">
        <p>Total Items:{totalItems} </p>
        <p>Total Price:{totalPrice} </p>
        {/* If no items in cart, you won't be able to click the place order button */}
        <p>Description: </p>

        <button
          className="cart__submit"
          disabled={!totalItems}
          onClick={onSubmitOrder}
        >
          Place Order
        </button>
      </div>
    </div>
  );
};

export default Checkout;
