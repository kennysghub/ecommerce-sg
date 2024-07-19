import { ProductType } from "../context/ProductsProvider";
import { ReducerActionType, ReducerAction } from "../context/CartProvider";
import { ReactElement, memo } from "react";
import { updateCart } from "../api/CartService";

type PropsType = {
  product: ProductType;
  dispatch: React.Dispatch<ReducerAction>;
  REDUCER_ACTIONS: ReducerActionType;
  inCart: boolean;
};

const Product = ({
  product,
  dispatch,
  REDUCER_ACTIONS,
  inCart,
}: PropsType): ReactElement => {
  // const syncCart = async () => {
  //   try {
  //     console.log('SYNCING CART: ')
  //     await updateCart([product.sku], []);
  //   } catch (error) {
  //     console.error("Failed to sync cart with backend:", error);
  //     // You might want to show an error message to the user here
  //   }
  // };

  // const onAddToCart = async () => {
  //   await syncCart();

  //   return dispatch({
  //     type: REDUCER_ACTIONS.ADD,
  //     payload: { ...product, qty: 1 },
  //   });
  // };
  // const onAddToCart = async () => {
  //   try {
  //     // Call the backend to add the item to the cart
  //     // const updatedCart = await updateCart([product.sku], []);

  //     // console.log("UPDATED CART: ", updatedCart);
  //     // Update the frontend state based on the backend response
  //     dispatch({
  //       type: REDUCER_ACTIONS.ADD,
  //       payload: { ...product, qty: 1 }, // Set initial quantity to 1
  //     });
  //   } catch (error) {
  //     console.error("Failed to add item to cart:", error);
  //     // Show an error message to the user
  //   }
  // };
  const onAddToCart = () => {
    dispatch({
      type: REDUCER_ACTIONS.ADD,
      payload: { ...product, qty: 1 },
    });
  };

  const itemInCart = inCart ? " -> Item in Cart: ✅" : null;

  const content = (
    <article className="product">
      <h3>{product.name}</h3>
      <img className="product__img" src={product.imageURL} alt={product.name} />
      <p>
        {new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(product.price)}
        {itemInCart}
      </p>
      <p>{product.description}</p>
      <button onClick={onAddToCart}>Add to Cart</button>
    </article>
  );

  return content;
};

const areProductsEqual = (
  { product: prevProduct, inCart: prevInCart }: PropsType,
  { product: nextProduct, inCart: nextInCart }: PropsType
) => {
  return Object.keys(prevProduct).every((key) => {
    return (
      prevProduct[key as keyof ProductType] ===
        nextProduct[key as keyof ProductType] && prevInCart === nextInCart
    );
  });
};

const MemoizedProduct = memo<typeof Product>(Product, areProductsEqual);

export default MemoizedProduct;
