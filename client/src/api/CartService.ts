import { CartItemType } from '../context/CartProvider';
const API_URL = 'http://localhost:3000/v1';

//*PUT
// Calling replaceCart on backend
export const updateCart = async (cart: CartItemType[]): Promise<void> => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_URL}/cart`, {
    method: 'PUT', // "PATCH" is also possible.
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ cart }),
  });

  if (!response.ok) {
    throw new Error('Failed to update cart');
  }
  return response.json();
};

export const updateCartItemQuantity = async (
  sku: string,
  quantity: number,
): Promise<unknown> => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_URL}/cart`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ update: [{ sku, quantity }] }),
  });

  if (!response.ok) {
    throw new Error('Failed to update cart item quantity');
  }

  return response.json();
};

export const getCart = async (): Promise<CartItemType[]> => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_URL}/cart`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch cart');
  }

  return response.json();
};
