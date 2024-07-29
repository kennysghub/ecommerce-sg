import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Checkout from '../pages/Checkout';
import * as useCartHook from '../hooks/useCart';
import * as OrderService from '../api/OrderService';

vi.mock('../hooks/useCart');
vi.mock('../api/OrderService');

describe('Checkout Component', () => {
  const mockDispatch = vi.fn();
  const mockReducerActions = {
    SUBMIT: 'SUBMIT',
    ADD: 'ADD',
    REMOVE: 'REMOVE',
    QUANTITY: 'QUANTITY',
    SET_CART: 'SET_CART',
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders Checkout component with empty cart', () => {
    vi.mocked(useCartHook.default).mockReturnValue({
      dispatch: mockDispatch,
      REDUCER_ACTIONS: mockReducerActions,
      totalItems: 0,
      totalPrice: '$0.00',
      cart: [],
      cartId: null,
      setCartId: vi.fn(),
      updateItemQuantity: vi.fn(),
      isLoading: false,
    });

    render(<Checkout />);

    expect(screen.getByText('Checkout Page')).toBeInTheDocument();
    expect(screen.getByText('Total Items:0')).toBeInTheDocument();
    expect(screen.getByText('Total Price:$0.00')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Place Order' })).toBeDisabled();
  });

  it('renders Checkout component with items in cart', () => {
    const mockCart = [
      { sku: '1', name: 'Item 1', price: 10, qty: 2, imageURL: 'image1.jpg' },
      { sku: '2', name: 'Item 2', price: 15, qty: 1, imageURL: 'image2.jpg' },
    ];

    vi.mocked(useCartHook.default).mockReturnValue({
      dispatch: mockDispatch,
      REDUCER_ACTIONS: mockReducerActions,
      totalItems: 3,
      totalPrice: '$35.00',
      cart: mockCart,
      cartId: null,
      setCartId: vi.fn(),
      updateItemQuantity: vi.fn(),
      isLoading: false,
    });

    render(<Checkout />);

    expect(screen.getByText('Total Items:3')).toBeInTheDocument();
    expect(screen.getByText('Total Price:$35.00')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Place Order' })).toBeEnabled();
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('submits order and displays receipt', async () => {
    const mockCart = [
      { sku: '1', name: 'Item 1', price: 10, qty: 1, imageURL: 'image1.jpg' },
    ];

    vi.mocked(useCartHook.default).mockReturnValue({
      dispatch: mockDispatch,
      REDUCER_ACTIONS: mockReducerActions,
      totalItems: 1,
      totalPrice: '$10.00',
      cart: mockCart,
      cartId: null,
      setCartId: vi.fn(),
      updateItemQuantity: vi.fn(),
      isLoading: false,
    });

    vi.mocked(OrderService.submitOrder).mockResolvedValue({
      transactionId: 'mock-transaction-id',
      amount: 10,
    });

    render(<Checkout />);

    const placeOrderButton = screen.getByRole('button', {
      name: 'Place Order',
    });
    fireEvent.click(placeOrderButton);

    await waitFor(() => {
      expect(OrderService.submitOrder).toHaveBeenCalledTimes(1);
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'SUBMIT' });
    });

    await waitFor(() => {
      expect(screen.getByText('Order Receipt')).toBeInTheDocument();
    });

    expect(
      screen.getByText('Transaction ID: mock-transaction-id'),
    ).toBeInTheDocument();

    expect(screen.getByText('Total Amount: $10')).toBeInTheDocument();
  });
});
