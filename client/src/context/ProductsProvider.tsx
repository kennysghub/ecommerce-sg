import {
  createContext,
  ReactElement,
  useState,
  useEffect,
  useCallback,
} from 'react';

import { useAuth } from './AuthContext';

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
export type UseProductsContextType = { products: ProductType[]; fetchProducts: () => Promise<void> };

const initContextState: UseProductsContextType = { products: [], fetchProducts: async () => {}};

// ProductsContext- creates a context of products, intialized with an emtpy array.
const ProductsContext = createContext<UseProductsContextType>(initContextState);

type ChildrenType = { children?: ReactElement | ReactElement[] };

export const ProductsProvider = ({ children }: ChildrenType): ReactElement => {
  const [products, setProducts] = useState<ProductType[]>(initState);
  const { isAuthenticated } = useAuth();

  const fetchProducts = useCallback(async (): Promise<void> => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found, user might not be authenticated.');
      return;
    }
    try {
      const response = await fetch('http://localhost:3000/v1/products', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Error! Status: ${response.status}`);
      }
      const data: ProductType[] = await response.json();
      setProducts(data);
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
      }
    }
  }, []);

  useEffect(() => {
    if(isAuthenticated) {
      fetchProducts();
    }
    
  }, [isAuthenticated, fetchProducts]);

  return (
    <ProductsContext.Provider value={{ products, fetchProducts }}>
      {children}
    </ProductsContext.Provider>
  );
};

export default ProductsContext;
