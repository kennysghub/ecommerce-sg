import { useState } from 'react';
import { submitOrder, IOrderResponse } from '../api/OrderService';
import useCart from '../hooks/useCart';
import CartLineItem from '../components/CartLineItem';
import Receipt from '../components/Receipt';

const Checkout = () => {
  const { dispatch, REDUCER_ACTIONS, totalItems, totalPrice, cart } = useCart();
  const [orderAmount, setOrderAmount] = useState<number>(0);
  const [transactionId, setTransactionId] = useState<string>('');

  const [confirm, setConfirm] = useState<boolean>(false);

  const onSubmitOrder = async () => {
    const res: IOrderResponse = await submitOrder();
    dispatch({ type: REDUCER_ACTIONS.SUBMIT });
    console.log(
      `TransactionId: ${res.transactionId}, Total Amount: ${res.amount}`,
    );
    setTransactionId(res.transactionId);
    setOrderAmount(res.amount);
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
        {confirm && (
          <Receipt transactionId={transactionId} amount={orderAmount} />
        )}
      </div>
    </div>
  );
};

export default Checkout;
