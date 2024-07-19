// src/__tests__/components/Cart.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Cart from "../../components/Cart";
import useCart from "../../hooks/useCart";

// Mock the useCart hook
vi.mock("../../hooks/useCart", () => ({
  default: vi.fn(() => ({
    dispatch: vi.fn(),
    REDUCER_ACTIONS: {
      SUBMIT: "SUBMIT",
    },
    totalItems: 2,
    totalPrice: "$20.00",
    cart: [
      { sku: "1", name: "Product 1", price: 10, qty: 1 },
      { sku: "2", name: "Product 2", price: 10, qty: 1 },
    ],
  })),
}));

// Mock the CartLineItem component
vi.mock("../../components/CartLineItem", () => ({
  default: ({
    item,
  }: {
    item: { name: string; price: number; qty: number };
  }) => (
    <li>
      {item.name} - ${item.price} x {item.qty}
    </li>
  ),
}));

describe("Cart", () => {
  it("renders cart items and totals", () => {
    render(<Cart />);

    expect(screen.getByText("Product 1 - $10 x 1")).toBeInTheDocument();
    expect(screen.getByText("Product 2 - $10 x 1")).toBeInTheDocument();
    expect(screen.getByText("Total Items:2")).toBeInTheDocument();
    expect(screen.getByText("Total Price:$20.00")).toBeInTheDocument();
  });

  it("enables place order button when cart has items", () => {
    render(<Cart />);

    const placeOrderButton = screen.getByRole("button", {
      name: /place order/i,
    });
    expect(placeOrderButton).toBeEnabled();
  });

  it("disables place order button when cart is empty", () => {
    vi.mocked(useCart).mockReturnValue({
      dispatch: vi.fn(),
      REDUCER_ACTIONS: {
        SUBMIT: "SUBMIT",
      },
      totalItems: 0,
      totalPrice: "$0.00",
      cart: [],
    } as any);

    render(<Cart />);

    const placeOrderButton = screen.getByRole("button", {
      name: /place order/i,
    });
    expect(placeOrderButton).toBeDisabled();
  });

  it("shows confirmation message after placing order", () => {
    const mockDispatch = vi.fn();
    vi.mocked(useCart).mockReturnValue({
      dispatch: mockDispatch,
      REDUCER_ACTIONS: {
        SUBMIT: "SUBMIT",
      },
      totalItems: 2,
      totalPrice: "$20.00",
      cart: [
        { sku: "1", name: "Product 1", price: 10, qty: 1 },
        { sku: "2", name: "Product 2", price: 10, qty: 1 },
      ],
    } as any);

    render(<Cart />);

    const placeOrderButton = screen.getByRole("button", {
      name: /place order/i,
    });
    fireEvent.click(placeOrderButton);

    expect(mockDispatch).toHaveBeenCalledWith({ type: "SUBMIT" });
    expect(screen.getByText("Thank you for your order!")).toBeInTheDocument();
  });
});
