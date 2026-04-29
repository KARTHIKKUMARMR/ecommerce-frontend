import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cart')) || []; }
    catch { return []; }
  });
  const [wishlist, setWishlist] = useState(() => {
    try { return JSON.parse(localStorage.getItem('wishlist')) || []; }
    catch { return []; }
  });

  useEffect(() => {
    try { localStorage.setItem('cart', JSON.stringify(cart)); } catch (e) { console.error('Cart save failed', e); }
  }, [cart]);

  useEffect(() => {
    try { localStorage.setItem('wishlist', JSON.stringify(wishlist)); } catch (e) { console.error('Wishlist save failed', e); }
  }, [wishlist]);

  const addToCart = (product, quantity = 1, size = '', color = '') => {
    setCart(prev => {
      const key = `${product._id}-${size}-${color}`;
      const exists = prev.find(i => `${i._id}-${i.selectedSize}-${i.selectedColor}` === key);
      if (exists) {
        toast.success('Cart updated!');
        return prev.map(i =>
          `${i._id}-${i.selectedSize}-${i.selectedColor}` === key
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      toast.success('Added to cart!');
      return [...prev, { ...product, quantity, selectedSize: size, selectedColor: color }];
    });
  };

  const removeFromCart = (productId, size, color) => {
    setCart(prev => prev.filter(i => !(i._id === productId && i.selectedSize === size && i.selectedColor === color)));
    toast('Removed from cart', { icon: '🗑️' });
  };

  const updateQuantity = (productId, size, color, qty) => {
    if (qty < 1) return;
    setCart(prev => prev.map(i =>
      i._id === productId && i.selectedSize === size && i.selectedColor === color
        ? { ...i, quantity: qty } : i
    ));
  };

  const clearCart = () => setCart([]);

  const toggleWishlist = (product) => {
    setWishlist(prev => {
      const exists = prev.find(p => p._id === product._id);
      if (exists) {
        toast('Removed from wishlist', { icon: '💔' });
        return prev.filter(p => p._id !== product._id);
      }
      toast.success('Added to wishlist! ❤️');
      return [...prev, product];
    });
  };

  const isInWishlist = (id) => wishlist.some(p => p._id === id);

  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{
      cart, wishlist, cartTotal, cartCount,
      addToCart, removeFromCart, updateQuantity, clearCart,
      toggleWishlist, isInWishlist,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
