import React from "react";

type ReceiptProps = {
  transactionId: string;
  amount: number;
};

const Receipt: React.FC<ReceiptProps> = ({ transactionId, amount }) => {
  return (
    <div className="receipt">
      <h2>Order Receipt</h2>
      <p>
        <strong>Transaction ID:</strong> {transactionId}
      </p>
      <p>
        <strong>Total Amount:</strong> ${amount.toFixed(2)}
      </p>
    </div>
  );
};

export default Receipt;
