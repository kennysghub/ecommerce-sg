import useCart from "../hooks/useCart";
import useProducts from "../hooks/useProducts";
import { ReactElement, useEffect } from "react";
import Product from "./Product";
import { useAuth } from "../context/AuthContext"; 

const ProductList = () => {
  const { dispatch, REDUCER_ACTIONS, cart } = useCart();
  const { products, fetchProducts } = useProducts();
  const { isAuthenticated } = useAuth(); 

  useEffect(() => {
    console.log('ProductList effect. isAuthenticated:', isAuthenticated);
    if (isAuthenticated) {
      fetchProducts();
    }
  }, [isAuthenticated, fetchProducts]);

  let pageContent: ReactElement | ReactElement[] = <p>Loading...</p>;

  if (products?.length) {
    pageContent = products.map((product) => {
      const inCart: boolean = cart.some((item) => item.sku === product.sku);

      return (
        <Product
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