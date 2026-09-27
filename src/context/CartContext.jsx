import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'swiggy-clone-cart';

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (dish) => {
    setCartItems((current) => {
      const existing = current.find((item) => item.id === dish.id && item.restaurantId === dish.restaurantId);

      if (existing) {
        return current.map((item) =>
          item.id === dish.id && item.restaurantId === dish.restaurantId
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      return [...current, { ...dish, quantity: 1 }];
    });
  };

  const updateQuantity = (dishId, restaurantId, delta) => {
    setCartItems((current) =>
      current
        .map((item) =>
          item.id === dishId && item.restaurantId === restaurantId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const removeFromCart = (dishId, restaurantId) => {
    setCartItems((current) =>
      current.filter((item) => !(item.id === dishId && item.restaurantId === restaurantId)),
    );
  };

  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems],
  );

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems],
  );

  const value = {
    cartItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    cartCount,
    subtotal,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }

  return context;
}
