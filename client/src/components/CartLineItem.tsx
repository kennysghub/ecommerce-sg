import { ChangeEvent, ReactElement, memo } from "react";
import { CartItemType } from "../context/CartProvider";
import { ReducerAction } from "../context/CartProvider";
import { ReducerActionType } from "../context/CartProvider";

type PropsType = {
  item: CartItemType;
  dispatch: React.Dispatch<ReducerAction>;
  REDUCER_ACTIONS: ReducerActionType;
};

const CartLineItem = ({ item, dispatch, REDUCER_ACTIONS }: PropsType) => {
  // const img: string = new URL(`../images/${item.sku}.jpg`, import.meta.url)
  //   .href;
  console.log("itemimg: ", item);
  // Not really an expensive function, I wouldn't bring in useMemo to memoize.
  const lineTotal: number = item.qty * item.price;
  const highestQty: number = 20 > item.qty ? 20 : item.qty;
  const optionValues: number[] = [...Array(highestQty).keys()].map(
    (i) => i + 1
  );
  const options: ReactElement[] = optionValues.map((val) => {
    return (
      <option key={`opt${val}`} value={val}>
        {val}
      </option>
    );
  });

  const onChangeQty = (e: ChangeEvent<HTMLSelectElement>) => {
    dispatch({
      type: REDUCER_ACTIONS.QUANTITY,
      payload: { ...item, qty: Number(e.target.value) },
    });
  };

  const onRemoveFromCart = () =>
    dispatch({
      type: REDUCER_ACTIONS.REMOVE,
      payload: item,
    });

  const content = (
    <li className="cart__item">
      <img src={item.imageURL} alt={item.name} />
      <div aria-label="Item Name">{item.name}</div>
      <div aria-label="Price Per Item">
        {new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(item.price)}
      </div>
      <label htmlFor="itemQty" className="offscreen">
        Item Quantity
      </label>
      <select
        name="itemQty"
        className="cart__select"
        id="itemQty"
        value={item.qty}
        aria-label="Item Quantity"
        onChange={onChangeQty}
      >
        {options}
      </select>
      <div className="cart__item-subtotal" aria-label="Line Item Subtotal">
        {new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(lineTotal)}
        <button
          className="cart__button"
          aria-label="Remove Item From Cart"
          title="Remove Item From Cart"
          onClick={onRemoveFromCart}
        >
          ❌
        </button>
      </div>
    </li>
  );

  return content;
};

// Optimization
// Function to compare:

const areItemsEqual = (
  { item: prevItem }: PropsType,
  { item: nextItem }: PropsType
) => {
  return Object.keys(prevItem).every((key) => {
    // Comparing every key, returns true if items equal.
    // dispatch and reducer_actions already memoized.
    // item object was the only thing we were worried about.
    return (
      prevItem[key as keyof CartItemType] ===
      nextItem[key as keyof CartItemType]
    );
  });
};

// Always new object passed in so you won't have referential equality.
const MemoizedCartLineItem = memo<typeof CartLineItem>(
  CartLineItem,
  areItemsEqual
);
// If you change the quantity of one of the CartLineItems, the others should not re-render.

export default MemoizedCartLineItem;
