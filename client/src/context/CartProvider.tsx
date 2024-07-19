import {
  useReducer,
  useMemo,
  createContext,
  ReactElement,
  useCallback,
  useEffect,
  useState,
} from "react";

import { updateCart, updateCartItemQuantity } from "../api/CartService";

/* ---------------------------- Type Definitions ---------------------------- */
// Represents individual items.
export type CartItemType = {
  sku: string;
  name: string;
  price: number;
  qty: number;
  imageURL: string;
};

// CartStateType, is an object with a cart property that holds an array of CartItemType.
type CartStateType = { cart: CartItemType[] };

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const initCartState: CartStateType = {
  cart: [],
};
/* -------------------------------------------------------------------------- */

// ReducerAction is a type. It's an object with string constants for each action type.
const REDUCER_ACTION_TYPE = {
  ADD: "ADD",
  REMOVE: "REMOVE",
  QUANTITY: "QUANTITY",
  SUBMIT: "SUBMIT",
};

export type ReducerActionType = typeof REDUCER_ACTION_TYPE;

// - It defines the structure of the actions. The actions have a type and a payload.
export type ReducerAction = {
  type: string;
  payload?: CartItemType;
};
// reducer is function that takes in the CURRENT state and an action.
// This reducer function handles -state updates- based on dispatched actions.
// It uses a switch statement to figure out which action to perform, then returns a new state object.
//* This reducer function is pure and stateless. It does NOT modify existing state. Instead, it creates and returns and new state object.

const reducer = (
  state: CartStateType,
  action: ReducerAction
): CartStateType => {
  switch (action.type) {
    /* ----------------------------------- ADD ---------------------------------- */
    case REDUCER_ACTION_TYPE.ADD: {
      if (!action.payload) {
        // Message we'd expect in development before anything went into production
        throw new Error("action.payload missing in ADD action");
      }
      const { sku, name, price, imageURL } = action.payload;
      const filteredCart: CartItemType[] = state.cart.filter(
        (item) => item.sku !== sku
      );
      const itemExists: CartItemType | undefined = state.cart.find(
        (item) => item.sku === sku
      );
      const qty: number = itemExists ? itemExists.qty + 1 : 1;
      return {
        ...state,
        cart: [...filteredCart, { sku, name, price, qty, imageURL }],
      };
    }

    /* --------------------------------- REMOVE --------------------------------- */
    case REDUCER_ACTION_TYPE.REMOVE: {
      if (!action.payload) {
        // Message we'd expect in development before anything went into production
        throw new Error("action.payload missing in REMOVE action");
      }
      //
      const { sku } = action.payload;
      const filteredCart: CartItemType[] = state.cart.filter(
        (item) => item.sku !== sku
      );
      return { ...state, cart: [...filteredCart] };
      // return [{ ...state, cart: [...filteredCart] }, "REMOVE"];
    }
    /* -------------------------------- QUANTITY -------------------------------- */
    case REDUCER_ACTION_TYPE.QUANTITY: {
      if (!action.payload) {
        // Message we'd expect in development before anything went into production
        throw new Error("action.payload missing in QUANTITY action");
      }
      const { sku, qty } = action.payload;

      const itemExists: CartItemType | undefined = state.cart.find(
        (item) => item.sku === sku
      );
      // Guard
      if (!itemExists) {
        throw new Error("Item must exist in order to update quantity");
      }
      const updatedItem: CartItemType = { ...itemExists, qty };
      const filteredCart: CartItemType[] = state.cart.filter(
        (item) => item.sku !== sku
      );
      return { ...state, cart: [...filteredCart, updatedItem] };
      // return [{ ...state, cart: [...filteredCart, updatedItem] }, "QUANTITY"];
    }
    /* --------------------------------- SUBMIT --------------------------------- */
    case REDUCER_ACTION_TYPE.SUBMIT: {
      // Emptying the cart, include logic if submitting to server or somewhere
      //TODO: Submit the cart to backend.

      console.log("Submitting cart...");
      console.log("Cart State: ", state.cart);
      return { ...state, cart: [] };
      // return [{ ...state, cart: [] }, "SUBMIT"];
    }
    default:
      throw new Error("Unidentified reducer action type");
  }
};

const useCartContext = (initCartState: CartStateType) => {
  // The useReducer hook takes in two arguments:
  // 1. reducer function
  // 2. initial state
  // It returns an array with
  //  1. Current state
  //  2. Dispatch function
  // The dispatch function is used to send actions to the reducer. When you call dispatch(action), React will call the reducer function we created with the current state, and the action we provide to the function call, then it will replace the state with the return value.
  const [state, dispatch] = useReducer(reducer, initCartState);
  // Added state for cartId
  const [cartId, setCartId] = useState<string | null>(null);

  //TODO: To update the cart on backend database, we can use React's useEffect(). This will auto sync cart w/ db whenever it changes.

  const REDUCER_ACTIONS = useMemo(() => {
    return REDUCER_ACTION_TYPE;
  }, []);

  // Updated useEffect to handle the updateCart response correctly
  // Updated useEffect to work with your existing updateCart function
  // useEffect(() => {
  //   const syncCartWithBackend = async () => {
  //     try {
  //       const itemsToAdd = state.cart.map((item) => item.sku);
  //       const res = await updateCart(itemsToAdd, []); // Passing an array of SKUs to add, and an empty array for removals
  //       console.log("syncing cart with backend.... updateCart res: ", res);
  //     } catch (error) {
  //       console.error("Failed to sync cart with backend:", error);
  //     }
  //   };

  //   syncCartWithBackend();
  // }, [state.cart]);
  useEffect(() => {
    const syncCartWithBackend = async () => {
      try {
        // Assuming your updateCart function can handle the entire cart state
        await updateCart(state.cart);
      } catch (error) {
        console.error("Failed to sync cart with backend:", error);
      }
    };

    syncCartWithBackend();
  }, [state.cart]);
  // New function to handle quantity updates
  const updateItemQuantity = useCallback(
    async (sku: string, quantity: number) => {
      try {
        await updateCartItemQuantity(sku, quantity);
        dispatch({
          type: REDUCER_ACTION_TYPE.QUANTITY,
          payload: { sku, qty: quantity } as CartItemType,
        });
      } catch (error) {
        console.error("Failed to update item quantity:", error);
      }
    },
    []
  );
  //

  // Defining total items to display.
  const totalItems: number = state.cart.reduce((previousValue, cartItem) => {
    return previousValue + cartItem.qty;
  }, 0);

  const totalPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(
    state.cart.reduce((previousValue, cartItem) => {
      return previousValue + cartItem.qty * cartItem.price;
    }, 0)
  );

  // Sorting cart in order
  const cart = state.cart.sort((a, b) => {
    const itemA = Number(a.sku.slice(-4));
    const itemB = Number(b.sku.slice(-4));
    return itemA - itemB;
  });

  // Dispatch won't cause re-renders.
  return {
    dispatch,
    REDUCER_ACTIONS,
    totalItems,
    totalPrice,
    cart,
    cartId,
    setCartId,
    updateItemQuantity,
  };
};

export type UseCartContextType = ReturnType<typeof useCartContext>;

const initCartContextState: UseCartContextType = {
  dispatch: () => {},
  REDUCER_ACTIONS: REDUCER_ACTION_TYPE,
  totalItems: 0,
  totalPrice: "",
  cart: [],
  updateItemQuantity: async () => {},
};

export const CartContext =
  createContext<UseCartContextType>(initCartContextState);

// Same as other file.
type ChildrenType = { children?: ReactElement | ReactElement[] };

export const CartProvider = ({ children }: ChildrenType): ReactElement => {
  return (
    <CartContext.Provider value={useCartContext(initCartContextState)}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
