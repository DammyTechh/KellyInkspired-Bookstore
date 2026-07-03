import { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import { Book, CartItem } from '../types';
import { useAuth } from './AuthContext';

type CartContextType = {
  items: CartItem[];
  addToCart: (book: Book) => void;
  removeFromCart: (bookId: string) => void;
  updateQuantity: (bookId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

// Each user (and the logged-out "guest") gets their own cart bucket in storage,
// so carts never leak between accounts on the same device.
const keyFor = (userId?: string | null) => `cart:${userId ?? 'guest'}`;

const readCart = (userId?: string | null): CartItem[] => {
  try {
    const raw = localStorage.getItem(keyFor(userId));
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [items, setItems] = useState<CartItem[]>(() => readCart(null));
  // Track which user the current `items` belong to, so we know when to switch.
  const loadedFor = useRef<string | null>(null);

  // When the signed-in user changes (login / logout / switch account),
  // load THAT user's cart instead of keeping the previous one.
  useEffect(() => {
    if (loadedFor.current === userId) return;
    loadedFor.current = userId;
    setItems(readCart(userId));
  }, [userId]);

  // Persist changes to the current user's bucket only.
  useEffect(() => {
    if (loadedFor.current !== userId) return; // avoid writing during a switch
    try {
      localStorage.setItem(keyFor(userId), JSON.stringify(items));
    } catch {
      /* ignore quota / serialization errors */
    }
  }, [items, userId]);

  const addToCart = (book: Book) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.book.id === book.id);
      if (existingItem) {
        return prevItems.map((item) =>
          item.book.id === book.id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }
      return [...prevItems, { book, quantity: 1 }];
    });
  };

  const removeFromCart = (bookId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.book.id !== bookId));
  };

  const updateQuantity = (bookId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(bookId);
      return;
    }
    setItems((prevItems) =>
      prevItems.map((item) => (item.book.id === bookId ? { ...item, quantity } : item)),
    );
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = items.reduce((total, item) => total + item.book.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
