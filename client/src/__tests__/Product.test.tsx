// src/__tests__/Product.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Product from "../components/Product";

describe("Product", () => {
  it("renders product details correctly", () => {
    const mockProduct = {
      sku: "ABC123",
      name: "Test Product",
      price: 9.99,
      description: "This is a test product",
      imageURL: "https://example.com/image.jpg",
    };

    render(<Product product={mockProduct} />);

    expect(screen.getByText("Test Product")).toBeInTheDocument();
    expect(screen.getByText("$9.99")).toBeInTheDocument();
    expect(screen.getByText("This is a test product")).toBeInTheDocument();
    expect(screen.getByRole("img")).toHaveAttribute(
      "src",
      "https://example.com/image.jpg"
    );
  });
});
