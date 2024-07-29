import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProductList from '../components/ProductList';
import { AuthProvider } from '../context/AuthContext';
import { ProductsProvider } from '../context/ProductsProvider';
import { CartProvider } from '../context/CartProvider';
import * as useAuthModule from '../context/AuthContext';
import * as useProductsModule from '../hooks/useProducts';
import * as useCartModule from '../hooks/useCart';

vi.mock('../hooks/useProducts');
vi.mock('../hooks/useCart');
vi.mock('../context/AuthContext', async () => {
  const actual = await vi.importActual('../context/AuthContext');
  return {
    ...actual,
    useAuth: vi.fn(),
  };
});

// Define a mock for REDUCER_ACTIONS
const MOCK_REDUCER_ACTIONS = {
  ADD: 'ADD',
  REMOVE: 'REMOVE',
  QUANTITY: 'QUANTITY',
  SUBMIT: 'SUBMIT',
  SET_CART: 'SET_CART',
};

describe('ProductList', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  const setupUseCartMock = (isLoading = false) => {
    vi.mocked(useCartModule.default).mockReturnValue({
      dispatch: vi.fn(),
      REDUCER_ACTIONS: MOCK_REDUCER_ACTIONS,
      cart: [],
      totalItems: 0,
      totalPrice: '',
      cartId: null,
      setCartId: vi.fn(),
      updateItemQuantity: vi.fn(),
      isLoading,
    });
  };

  it('displays "No products found" when authenticated but no products are available', async () => {
    vi.mocked(useAuthModule.useAuth).mockReturnValue({
      isAuthenticated: true,
      setIsAuthenticated: vi.fn(),
    });
    vi.mocked(useProductsModule.default).mockReturnValue({
      products: [],
      fetchProducts: vi.fn(),
    });
    setupUseCartMock();

    render(
      <AuthProvider>
        <ProductsProvider>
          <CartProvider>
            <ProductList />
          </CartProvider>
        </ProductsProvider>
      </AuthProvider>,
    );

    expect(screen.getByText('No products found.')).toBeInTheDocument();
  });

  it('displays products when they are available', async () => {
    const mockProducts = [
      {
        id: '1',
        sku: 'SKU1',
        name: 'Product 1',
        price: 10,
        description: 'Desc 1',
        imageURL: 'img1.jpg',
        createdAt: '2023-01-01',
      },
      {
        id: '2',
        sku: 'SKU2',
        name: 'Product 2',
        price: 20,
        description: 'Desc 2',
        imageURL: 'img2.jpg',
        createdAt: '2023-01-02',
      },
    ];
    vi.mocked(useAuthModule.useAuth).mockReturnValue({
      isAuthenticated: true,
      setIsAuthenticated: vi.fn(),
    });
    vi.mocked(useProductsModule.default).mockReturnValue({
      products: mockProducts,
      fetchProducts: vi.fn(),
    });
    setupUseCartMock();

    render(
      <AuthProvider>
        <ProductsProvider>
          <CartProvider>
            <ProductList />
          </CartProvider>
        </ProductsProvider>
      </AuthProvider>,
    );

    expect(screen.getByText('Product 1')).toBeInTheDocument();
    expect(screen.getByText('Product 2')).toBeInTheDocument();
  });

  it('displays login message when not authenticated', () => {
    vi.mocked(useAuthModule.useAuth).mockReturnValue({
      isAuthenticated: false,
      setIsAuthenticated: vi.fn(),
    });
    vi.mocked(useProductsModule.default).mockReturnValue({
      products: [],
      fetchProducts: vi.fn(),
    });
    setupUseCartMock();

    render(
      <AuthProvider>
        <ProductsProvider>
          <CartProvider>
            <ProductList />
          </CartProvider>
        </ProductsProvider>
      </AuthProvider>,
    );

    expect(
      screen.getByText('Please log in to view products.'),
    ).toBeInTheDocument();
  });
});
