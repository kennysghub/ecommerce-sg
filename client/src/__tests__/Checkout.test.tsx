// src/__tests__/Checkout.test.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Checkout from "../pages/Checkout";
import * as useCartModule from "../hooks/useCart";
import * as OrderServiceModule from "../api/OrderService";

// Mock the hooks and API call
vi.mock("../../hooks/useCart");
vi.mock("../../api/OrderService");

// Mock the CartLineItem component
vi.mock("../../components/CartLineItem", () => ({
  default: ({ item }: { item: { name: string; sku: string } }) => (
    <li data-testid={`cart-item-${item.sku}`}>{item.name}</li>
  ),
}));

describe("Checkout", () => {
  const mockDispatch = vi.fn();
  const mockCart = [
    { sku: "1", name: "Product 1", price: 10, qty: 1 },
    { sku: "2", name: "Product 2", price: 20, qty: 2 },
  ];

  beforeEach(() => {
    vi.spyOn(useCartModule, "default").mockReturnValue({
      dispatch: mockDispatch,
      REDUCER_ACTIONS: { SUBMIT: "SUBMIT" },
      totalItems: 3,
      totalPrice: "$50.00",
      cart: mockCart,
    } as any);

    vi.spyOn(OrderServiceModule, "submitOrder").mockResolvedValue({
      transactionId: "mock-transaction-id",
      amount: 50,
    });
  });

  it("renders checkout page with cart items", () => {
    render(<Checkout />);

    expect(screen.getByText("Checkout Page")).toBeInTheDocument();
    expect(screen.getByTestId("cart-item-1")).toBeInTheDocument();
    expect(screen.getByTestId("cart-item-2")).toBeInTheDocument();
    expect(screen.getByText("Total Items:3")).toBeInTheDocument();
    expect(screen.getByText("Total Price:$50.00")).toBeInTheDocument();
  });

  it("enables place order button when cart has items", () => {
    render(<Checkout />);

    const placeOrderButton = screen.getByRole("button", {
      name: /place order/i,
    });
    expect(placeOrderButton).toBeEnabled();
  });

  it("disables place order button when cart is empty", () => {
    vi.spyOn(useCartModule, "default").mockReturnValue({
      dispatch: mockDispatch,
      REDUCER_ACTIONS: { SUBMIT: "SUBMIT" },
      totalItems: 0,
      totalPrice: "$0.00",
      cart: [],
    } as any);

    render(<Checkout />);

    const placeOrderButton = screen.getByRole("button", {
      name: /place order/i,
    });
    expect(placeOrderButton).toBeDisabled();
  });

  it("submits order and displays confirmation", async () => {
    render(<Checkout />);

    const placeOrderButton = screen.getByRole("button", {
      name: /place order/i,
    });
    fireEvent.click(placeOrderButton);

    await waitFor(() => {
      expect(OrderServiceModule.submitOrder).toHaveBeenCalled();
      expect(mockDispatch).toHaveBeenCalledWith({ type: "SUBMIT" });
      expect(
        screen.getByText("Transaction ID: mock-transaction-id")
      ).toBeInTheDocument();
      expect(screen.getByText("Order Amount: 50")).toBeInTheDocument();
    });
  });

  it("handles submitOrder failure", async () => {
    vi.spyOn(OrderServiceModule, "submitOrder").mockRejectedValue(
      new Error("Order submission failed")
    );

    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    render(<Checkout />);

    const placeOrderButton = screen.getByRole("button", {
      name: /place order/i,
    });
    fireEvent.click(placeOrderButton);

    await waitFor(() => {
      expect(OrderServiceModule.submitOrder).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith("TransactionID: ", undefined);
      expect(consoleSpy).toHaveBeenCalledWith("Total Amount: ", undefined);
    });

    consoleSpy.mockRestore();
  });
});
