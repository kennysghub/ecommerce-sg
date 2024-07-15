import useCart from "../hooks/useCart";
import useProducts from "../hooks/useProducts";
// import { UseProductsContextType } from "../context/ProductsProvider";
// import { UseProductsContextType } from "../context/ProductsProvider";

import { ReactElement } from "react";
import Product from "./Product";

const ProductList = () => {
  const { dispatch, REDUCER_ACTIONS, cart } = useCart();

  const { products } = useProducts();

  let pageContent: ReactElement | ReactElement[] = <p>Loading...</p>;

  if (products?.length) {
    pageContent = products.map((product) => {
      const inCart: boolean = cart.some((item) => item.sku === product.sku);

      return (
        <Product
          key={product.sku}
          product={product} // We'll have to deal w this for optimization.
          // Dispatch does not have to worry about the referential equality, because it already is. So we dont' need to memoize it, it's already going to be equal to that.
          dispatch={dispatch}
          // We memoized reducer actions, so it wont' cause another render either.
          REDUCER_ACTIONS={REDUCER_ACTIONS}
          inCart={inCart}
        />
      );
    });
  }
  const content = <main className="main main--products">{pageContent}</main>;

  return content;
};

export default ProductList;
