import { createContext, ReactElement, useState, useEffect } from "react";

export type ProductType = {
  id: string;
  sku: string;
  name: string;
  price: number;
  description: string;
  imageURL: string;
  createdAt: string;
};
const initState: ProductType[] = [];
// const initState: ProductType[] = [
//   {
//     sku: "item0001",
//     name: "Widget",
//     price: 9.99,
//   },
//   {
//     sku: "item0002",
//     name: "Premium Widget",
//     price: 19.99,
//   },
//   {
//     sku: "item0003",
//     name: "Deluxe Widget",
//     price: 29.99,
//   },
// ];

export type UseProductsContextType = { products: ProductType[] }; // This is not the same as initState I think?

const initContextState: UseProductsContextType = { products: [] };

// Now we need to create our context.

const ProductsContext = createContext<UseProductsContextType>(initContextState);

// Now that we created our context, we now need to create a children type. (React 18+)
// React element or an array of ReactElements
type ChildrenType = { children?: ReactElement | ReactElement[] };

// Now that we have the type, we can start creating the provider.
// Recall that children are what's between JSX tags, not the same as props that's being passed down and used, although it is a prop??
// Lexical scope ---
// Small project so I didn't want to use ReactQuery instead of useEffect
export const ProductsProvider = ({ children }: ChildrenType): ReactElement => {
  const [products, setProducts] = useState<ProductType[]>(initState);

  useEffect(() => {
    console.log("Fetching products...");
    const fetchProducts = async (): Promise<ProductType[]> => {
      const data = await fetch("http://localhost:3000/api/products")
        .then((res) => res.json())

        .catch((err) => {
          if (err instanceof Error) console.log(err.message);
        });
      console.log("data: ", data);
      return data;
    };

    fetchProducts().then((products) => setProducts(products));
  }, []);

  return (
    <ProductsContext.Provider value={{ products }}>
      {children}
    </ProductsContext.Provider>
  );
};

export default ProductsContext;
