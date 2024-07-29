import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Product from '../components/Product';
import { ProductType } from '../context/ProductsProvider';
import { ReducerActionType } from '../context/CartProvider';

describe('Product Component', () => {
  const mockProduct: ProductType = {
    id: '1',
    sku: 'SKU1',
    name: 'Test Product',
    price: 9.99,
    description: 'This is a test product',
    imageURL: 'test-image.jpg',
    createdAt: '2023-01-01',
  };

  const mockDispatch = vi.fn();
  const MOCK_REDUCER_ACTIONS: ReducerActionType = {
    ADD: 'ADD',
    REMOVE: 'REMOVE',
    QUANTITY: 'QUANTITY',
    SUBMIT: 'SUBMIT',
    SET_CART: 'SET_CART',
  };

  it('renders product details correctly', () => {
    render(
      <Product
        product={mockProduct}
        dispatch={mockDispatch}
        REDUCER_ACTIONS={MOCK_REDUCER_ACTIONS}
        inCart={false}
      />,
    );

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('This is a test product')).toBeInTheDocument();
    expect(screen.getByText('$9.99')).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('src', 'test-image.jpg');
    expect(screen.getByRole('img')).toHaveAttribute('alt', 'Test Product');
  });

  it('shows "Item in Cart" when inCart is true', () => {
    render(
      <Product
        product={mockProduct}
        dispatch={mockDispatch}
        REDUCER_ACTIONS={MOCK_REDUCER_ACTIONS}
        inCart={true}
      />,
    );

    expect(screen.getByText(/Item in Cart: ✅/)).toBeInTheDocument();
  });

  it('does not show "Item in Cart" when inCart is false', () => {
    render(
      <Product
        product={mockProduct}
        dispatch={mockDispatch}
        REDUCER_ACTIONS={MOCK_REDUCER_ACTIONS}
        inCart={false}
      />,
    );

    expect(screen.queryByText(/Item in Cart: ✅/)).not.toBeInTheDocument();
  });

  it('calls dispatch with ADD action when "Add to Cart" button is clicked', () => {
    render(
      <Product
        product={mockProduct}
        dispatch={mockDispatch}
        REDUCER_ACTIONS={MOCK_REDUCER_ACTIONS}
        inCart={false}
      />,
    );

    const addToCartButton = screen.getByRole('button', {
      name: 'Add Test Product to cart',
    });
    fireEvent.click(addToCartButton);

    expect(mockDispatch).toHaveBeenCalledWith({
      type: MOCK_REDUCER_ACTIONS.ADD,
      payload: { ...mockProduct, qty: 1 },
    });
  });
});
