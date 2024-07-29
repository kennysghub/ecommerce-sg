import { ReactElement, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import useProducts from '../hooks/useProducts';
import useCart from '../hooks/useCart';
import MemoizedProduct from './Product';

const ProductList = () => {
  const { dispatch, REDUCER_ACTIONS, cart } = useCart();
  const { products, fetchProducts } = useProducts();
  const { isAuthenticated } = useAuth();

  let pageContent: ReactElement | ReactElement[] = <p>Loading...</p>;

  if (products?.length) {
    pageContent = products.map((product) => {
      const inCart: boolean = cart.some((item) => item.sku === product.sku);

      return (
        <MemoizedProduct
          key={product.sku}
          product={product}
          dispatch={dispatch}
          REDUCER_ACTIONS={REDUCER_ACTIONS}
          inCart={inCart}
        />
      );
    });
  } else if (isAuthenticated) {
    pageContent = <p>No products found.</p>;
  } else {
    pageContent = <p>Please log in to view products.</p>;
  }

  console.log('ProductList rendering. Products:', products);

  const content = <main className="main main--products">{pageContent}</main>;

  return content;
};

export default ProductList;
