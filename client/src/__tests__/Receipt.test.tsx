import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import Receipt from '../components/Receipt';

describe('Receipt component', () => {
  it('renders Receipt component correctly', () => {
    const transactionId = '12345';
    const amount = 100;

    const { container } = render(
      <Receipt transactionId={transactionId} amount={amount} />,
    );
    const div = container.querySelector('.receipt');
    expect(div).toHaveTextContent('Transaction ID: 12345');
    expect(div).toHaveTextContent('Total Amount: $100');
  });
});
