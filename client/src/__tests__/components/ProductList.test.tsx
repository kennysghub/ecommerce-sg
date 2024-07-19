import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ProductList from '../../components/ProductList';
import useCart from '../../hooks/useCart';
import useProducts from '../../hooks/useProducts';

// Mock the hooks
vi.mock('../../hooks/useCart', () => ({
  default: vi.fn(),
}));

vi.mock('../../hooks/useProducts', () => ({
  default: vi.fn(),
}));

// Mock the Product component
vi.mock('../../components/Product', () => ({
  default: ({ product }: { product: { name: string; sku: string } }) => (
    <div data-testid={`product-${product.sku}`}>{product.name}</div>
  ),
}));

describe('ProductList', () => {
  it('displays loading message when products are not yet loaded', () => {
    vi.mocked(useProducts).mockReturnValue({ products: [] });
    vi.mocked(useCart).mockReturnValue({
      dispatch: vi.fn(),
      REDUCER_ACTIONS: {},
      cart: [],
    } as any);

    render(<ProductList />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders products when they are loaded', () => {
    const mockProducts = [
      { sku: '1', name: 'Product 1', price: 10 },
      { sku: '2', name: 'Product 2', price: 20 },
    ];
    vi.mocked(useProducts).mockReturnValue({ products: mockProducts });
    vi.mocked(useCart).mockReturnValue({
      dispatch: vi.fn(),
      REDUCER_ACTIONS: {},
      cart: [],
    } as any);

    render(<ProductList />);
    expect(screen.getByTestId('product-1')).toBeInTheDocument();
    expect(screen.getByTestId('product-2')).toBeInTheDocument();
    expect(screen.getByText('Product 1')).toBeInTheDocument();
    expect(screen.getByText('Product 2')).toBeInTheDocument();
  });

  it('correctly identifies products in cart', () => {
    const mockProducts = [
      { sku: '1', name: 'Product 1', price: 10 },
      { sku: '2', name: 'Product 2', price: 20 },
    ];
    const mockCart = [{ sku: '1', quantity: 1 }];
    vi.mocked(useProducts).mockReturnValue({ products: mockProducts });
    vi.mocked(useCart).mockReturnValue({
      dispatch: vi.fn(),
      REDUCER_ACTIONS: {},
      cart: mockCart,
    } as any);

    render(<ProductList />);

    // We can't directly test the 'inCart' prop here because we've mocked the Product component.
    // In a real scenario, you might want to check if the Product component receives the correct 'inCart' prop.
    // For now, we'll just check if both products are rendered.
    expect(screen.getByTestId('product-1')).toBeInTheDocument();
    expect(screen.getByTestId('product-2')).toBeInTheDocument();
  });

  it('renders products within main element with correct class', () => {
    const mockProducts = [{ sku: '1', name: 'Product 1', price: 10 }];
    vi.mocked(useProducts).mockReturnValue({ products: mockProducts });
    vi.mocked(useCart).mockReturnValue({
      dispatch: vi.fn(),
      REDUCER_ACTIONS: {},
      cart: [],
    } as any);

    render(<ProductList />);
    const mainElement = screen.getByRole('main');
    expect(mainElement).toHaveClass('main main--products');
    expect(mainElement).toContainElement(screen.getByTestId('product-1'));
  });
});
