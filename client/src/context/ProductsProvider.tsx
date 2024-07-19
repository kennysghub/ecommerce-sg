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
    try {
      const response = await fetch("http://localhost:3000/v1/products", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Error! Status: ${response.status}`);
      }
      const data: ProductType[] = await response.json();
      console.log("data: ", data);
      setProducts(data);
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
      }
    }
    // const data = await fetch("http://localhost:3000/v1/products", {
    //   headers: {
    //     Authorization: `Bearer ${token}`,
    //   },
    // })
    //   .then((res) => res.json())
    //   .catch((err) => {
    //     if (err instanceof Error) console.log(err.message);
    //   });
    // console.log("data: ", data);
    // setProducts(data);
  }, []);

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
