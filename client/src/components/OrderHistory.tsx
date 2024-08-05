import React, { useEffect, useState } from 'react';
import { getOrderHistory, IOrderHistory } from '../api/OrderService';

const OrderHistory: React.FC = () => {
  const [orderHistory, setOrderHistory] = useState<IOrderHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderHistory = async () => {
      try {
        const history = await getOrderHistory();
        setOrderHistory(history);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch order history');
        setLoading(false);
      }
    };

    fetchOrderHistory();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h2>Order History</h2>
      <br />
      {orderHistory.map((order) => (
        <div key={order.orderId}>
          <h3>-Order ID: {order.transactionId}</h3>
          <p>
            <strong>Date:</strong>{' '}
            {new Date(order.createdAt).toLocaleDateString()}
          </p>
          <p>
            <strong>Total Amount</strong> ${order.amount}
          </p>
          <h4>Items:</h4>
          <ul>
            {order.items.map((item, index) => (
              <li key={index}>
                {item.productName}: Quantity: {Number(item.quantity)}, Price: $
                {item.price}
              </li>
            ))}
          </ul>
          <br />
        </div>
      ))}
    </div>
  );
};

export default OrderHistory;
