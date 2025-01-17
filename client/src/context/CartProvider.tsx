import {
  useReducer,
  useMemo,
  createContext,
  ReactElement,
  useCallback,
  useEffect,
  useState,
} from 'react';
import {
  updateCart,
  updateCartItemQuantity,
  getCart,
} from '../api/CartService';

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

const REDUCER_ACTION_TYPE = {
  ADD: 'ADD',
  REMOVE: 'REMOVE',
  QUANTITY: 'QUANTITY',
  SUBMIT: 'SUBMIT',
  SET_CART: 'SET_CART',
};

export type ReducerActionType = typeof REDUCER_ACTION_TYPE;

export type ReducerAction = {
  type: string;
  payload?: CartItemType;
};

const reducer = (
  state: CartStateType,
  action: ReducerAction,
): CartStateType => {
  switch (action.type) {
    /* ----------------------------------- ADD ---------------------------------- */
    case REDUCER_ACTION_TYPE.ADD: {
      if (!action.payload) {
        throw new Error('action.payload missing in ADD action');
      }
      const { sku, name, price, imageURL } = action.payload;
      // Creates a new array, that contains all items in the current cart EXCEPT  the item with the same SKU as the one being added. This prepares for the possibility that the item already exists in  the cart.
      const filteredCart: CartItemType[] = state.cart.filter(
        (item) => item.sku !== sku,
      );
      // Then we check if the item already exists in the cart by looking for an item that has the same SKU as the item being added. If we don't find it, itemExists will be undefined.
      const itemExists: CartItemType | undefined = state.cart.find(
        (item) => item.sku === sku,
      );
      // If itemExists is a CartItemType object(truthy), then we increment its quantity by 1. If itemExists is undefined(falsy), then the item wasn't in the cart previously, so we set the quantity to 1.
      const qty: number = itemExists ? itemExists.qty + 1 : 1;
      // We are returning the new cart array that includes all the items from filteredCart(which is the original cart minus the item being added if it existed) plus the new or updated item.
      return {
        ...state,
        cart: [...filteredCart, { sku, name, price, qty, imageURL }],
      };
    }
    /* --------------------------------- REMOVE --------------------------------- */
    case REDUCER_ACTION_TYPE.REMOVE: {
      if (!action.payload) {
        throw new Error('action.payload missing in REMOVE action');
      }
      const { sku } = action.payload;
      const filteredCart: CartItemType[] = state.cart.filter(
        (item) => item.sku !== sku,
      );
      return { ...state, cart: [...filteredCart] };
    }
    /* -------------------------------- QUANTITY -------------------------------- */
    case REDUCER_ACTION_TYPE.QUANTITY: {
      if (!action.payload) {
        throw new Error('action.payload missing in QUANTITY action');
      }
      const { sku, qty } = action.payload;
      const itemExists: CartItemType | undefined = state.cart.find(
        (item) => item.sku === sku,
      );
      if (!itemExists) {
        throw new Error('Item must exist in order to update quantity');
      }
      // This creates a new object updatedItem by spreading the properties of the existing item and overwriting the qty with the new qty.

      const updatedItem: CartItemType = { ...itemExists, qty };
      const filteredCart: CartItemType[] = state.cart.filter(
        (item) => item.sku !== sku,
      );
      // This sets the cart property to a new array that includes all items from filteredCart plus the updatedItem.

      return { ...state, cart: [...filteredCart, updatedItem] };
    }
    /* --------------------------------- SUBMIT --------------------------------- */
    case REDUCER_ACTION_TYPE.SUBMIT: {
      return { ...state, cart: [] };
    }
    /* -------------------------------- SET_CART -------------------------------- */
    case REDUCER_ACTION_TYPE.SET_CART: {
      if (!action.payload) {
        throw new Error('action.payload missing in SET_CART action');
      }
      return { ...state, cart: action.payload as unknown as CartItemType[] };
    }
    default:
      throw new Error('Unidentified reducer action type');
  }
};
// Custom hook that encapsulates all the logic for managing the cart state in the application.

const useCartContext = (initCartState: CartStateType) => {
  const [state, dispatch] = useReducer(reducer, initCartState);
  const [cartId, setCartId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const REDUCER_ACTIONS = useMemo(() => {
    return REDUCER_ACTION_TYPE;
  }, []);
  // This is the initial cart fetching. it runs once when the component mounts to fetch the initial cart data from the server.

  useEffect(() => {
    const fetchCart = async () => {
      setIsLoading(true);
      try {
        const fetchedCart = await getCart();
        dispatch({
          type: REDUCER_ACTION_TYPE.SET_CART,
          payload: fetchedCart as unknown as CartItemType,
        });
      } catch (error) {
        console.error('Failed to fetch cart:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCart();
  }, []);

  useEffect(() => {
    const syncCartWithBackend = async () => {
      if (isLoading) return; // Don't sync while initial load is happening
      try {
        const res = await updateCart(state.cart);
      } catch (error) {
        console.error('Failed to sync cart with backend:', error);
      }
    };

    syncCartWithBackend();
  }, [state.cart, isLoading]);
  // useCallback returns a memoized function of the callback function that only changes if one of the dependencies has changed.
  // The function updateCartItemQuantity  is wrapped in useCallback, React will return the same function instance between re-renders as long as the dependencies haven't changed.
  //? Why memoize this function?
  // If this function is passed as a prop to child components, memoizing it can prevent those components from re-rendering unnecessarily.
  // It ensures that the same function instance is used across renders, which can be important for hooks that depend on stable function references (like useEffect)
  const updateItemQuantity = useCallback(
    async (sku: string, quantity: number) => {
      try {
        await updateCartItemQuantity(sku, quantity);
        dispatch({
          type: REDUCER_ACTION_TYPE.QUANTITY,
          payload: { sku, qty: quantity } as CartItemType,
        });
      } catch (error) {
        console.error('Failed to update item quantity:', error);
      }
    },
    [dispatch],
  );

  const totalItems: number = state.cart.reduce((previousValue, cartItem) => {
    return previousValue + cartItem.qty;
  }, 0);

  const totalPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(
    state.cart.reduce((previousValue, cartItem) => {
      return previousValue + cartItem.qty * cartItem.price;
    }, 0),
  );

  const cart = state.cart.sort((a, b) => {
    const itemA = Number(a.sku.slice(-4));
    const itemB = Number(b.sku.slice(-4));
    return itemA - itemB;
  });
  // Returns an object with all the necessary state values and functions to manage the cart.

  return {
    dispatch,
    REDUCER_ACTIONS,
    totalItems,
    totalPrice,
    cart,
    cartId,
    setCartId,
    updateItemQuantity,
    isLoading,
  };
};

export type UseCartContextType = ReturnType<typeof useCartContext>;

const initCartContextState: UseCartContextType = {
  dispatch: () => {},
  REDUCER_ACTIONS: REDUCER_ACTION_TYPE,
  totalItems: 0,
  totalPrice: '',
  cart: [],
  cartId: null,
  setCartId: () => {},
  updateItemQuantity: async () => {},
  isLoading: true,
};
// CartContext will provide the cart state and functions to child components.

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
