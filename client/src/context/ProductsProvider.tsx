import {
  createContext,
  ReactElement,
  useState,
  useEffect,
  useCallback,
} from "react";

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

// Defines the shape of the context value.
export type UseProductsContextType = { products: ProductType[] };

const initContextState: UseProductsContextType = { products: [] };

// Now we need to create our context.
// ProductsContext- creates a context of products, intialized with an emtpy array.
const ProductsContext = createContext<UseProductsContextType>(initContextState);

type ChildrenType = { children?: ReactElement | ReactElement[] };

export const ProductsProvider = ({ children }: ChildrenType): ReactElement => {
  const [products, setProducts] = useState<ProductType[]>(initState);

  const fetchProducts = useCallback(async (): Promise<void> => {
    console.log("Fetching products...");
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("No token found, user might not be authenticated.");
      return;
    }

    const data = await fetch("http://localhost:3000/v1/products", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .catch((err) => {
        if (err instanceof Error) console.log(err.message);
      });
    console.log("data: ", data);
    setProducts(data);
  }, []);

  // useEffect(() => {
  //   console.log("Fetching products...");
  //   // const fetchProducts = async (): Promise<ProductType[]> => {
  //   //   const token = localStorage.getItem("token");
  //   //   if (!token) {
  //   //     console.log("No token found, user might not be authenticated.");
  //   //     return [];
  //   //   }

  //   //   const data = await fetch("http://localhost:3000/v1/products", {
  //   //     headers: {
  //   //       Authorization: `Bearer ${token}`,
  //   //     },
  //   //   })
  //   //     .then((res) => res.json())

  //   //     .catch((err) => {
  //   //       if (err instanceof Error) console.log(err.message);
  //   //     });
  //   //   console.log("data: ", data);
  //   //   return data;
  //   // };

  //   // fetchProducts().then((products) => setProducts(products));
  // }, []);
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <ProductsContext.Provider value={{ products }}>
      {children}
    </ProductsContext.Provider>
  );
};

export default ProductsContext;
// When the app starts, ProductsProvider component is rendered, near root.
// It initializes with an empty products array. Immediately after mounting, it triggers the API call to fetch products.
// Once products are fetched, it updates its internal state with the fetched products.
// This causes ProductsProvider to re-render, which in turn updates the value provided to all consuming components.
// Any component that uses this context will have access to the products array and will re-render when it changes.
