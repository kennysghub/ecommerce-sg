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

// const initCartState: CartStateType = {
//   cart: [],
// };

// ReducerAction type
const REDUCER_ACTION_TYPE = {
  ADD: "ADD",
  REMOVE: "REMOVE",
  QUANTITY: "QUANTITY",
  SUBMIT: "SUBMIT",
};

export type ReducerActionType = typeof REDUCER_ACTION_TYPE;

export type ReducerAction = {
  type: string;
  payload?: CartItemType;
};

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
      return { ...state, cart: [] };
      // return [{ ...state, cart: [] }, "SUBMIT"];
    }
    default:
      throw new Error("Unidentified reducer action type");
  }
};

const useCartContext = (initCartState: CartStateType) => {
  const [state, dispatch] = useReducer(reducer, initCartState);
  const [cartId, setCartId] = useState<string | null>(null);

  const REDUCER_ACTIONS = useMemo(() => {
    return REDUCER_ACTION_TYPE;
  }, []);

  useEffect(() => {
    const syncCartWithBackend = async () => {
      try {
        await updateCart(state.cart);
      } catch (error) {
        console.error("Failed to sync cart with backend:", error);
      }
    };

    syncCartWithBackend();
  }, [state.cart]);

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
  cartId: null,
  setCartId: () => {},
  updateItemQuantity: async () => {},
};

export const CartContext =
  createContext<UseCartContextType>(initCartContextState);

type ChildrenType = { children?: ReactElement | ReactElement[] };

export const CartProvider = ({ children }: ChildrenType): ReactElement => {
  return (
    <CartContext.Provider value={useCartContext(initCartContextState)}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;