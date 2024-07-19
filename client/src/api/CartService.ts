// src/api/CartService.ts
import { CartItemType } from "../context/CartProvider";
const API_URL = "http://localhost:3000/v1";

interface CartResponse {
  // Add the properties you expect from your API response
  cartId: string;
  items?: CartItemType[];
  // Add other properties as needed
}

// export const updateCart = async (
//   add: string[] = [],
//   remove: string[] = []
// ): Promise<CartResponse> => {
//   const token = localStorage.getItem("token");
//   if (!token) {
//     throw new Error("No authentication token found");
//   }

//   const response = await fetch(`${API_URL}/cart`, {
//     method: "PATCH",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${token}`,
//     },
//     body: JSON.stringify({ add, remove }),
//   });

//   if (!response.ok) {
//     throw new Error("Failed to update cart");
//   }

//   return response.json();
// };
export const updateCart = async (cart: CartItemType[]): Promise<void> => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(`${API_URL}/cart`, {
    method: "PUT", // or "PATCH", depending on your backend implementation
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ cart }),
  });

  if (!response.ok) {
    throw new Error("Failed to update cart");
  }
};

export const updateCartItemQuantity = async (
  sku: string,
  quantity: number
): Promise<unknown> => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(`${API_URL}/cart`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ update: [{ sku, quantity }] }),
  });

  if (!response.ok) {
    throw new Error("Failed to update cart item quantity");
  }

  return response.json();
};
