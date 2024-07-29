import React from 'react';

type ReceiptProps = {
  transactionId: string;
  amount: number;
};

const Receipt: React.FC<ReceiptProps> = ({ transactionId, amount }) => {
  return (
    <div className="receipt">
      <h2>Order Receipt</h2>
      <p>
        <strong>Transaction ID: {transactionId}</strong>
      </p>
      <p>
        <strong>Total Amount: ${amount}</strong>
      </p>
    </div>
  );
};

export default Receipt;
