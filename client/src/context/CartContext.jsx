import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => JSON.parse(localStorage.getItem('cart') || '[]'));
  useEffect(() => localStorage.setItem('cart', JSON.stringify(items)), [items]);

  const add = (p, qty = 1) => setItems((cur) => {
    const found = cur.find((i) => i._id === p._id);
    if (found) return cur.map((i) => (i._id === p._id ? { ...i, qty: Math.min(i.qty + qty, p.stock) } : i));
    return [...cur, { _id: p._id, title: p.title, price: p.price, image: p.images?.[0], stock: p.stock, qty }];
  });
  const setQty = (id, qty) => setItems((cur) => cur.map((i) => (i._id === id ? { ...i, qty: Math.max(1, Math.min(qty, i.stock)) } : i)));
  const remove = (id) => setItems((cur) => cur.filter((i) => i._id !== id));
  const clear = () => setItems([]);
  const count = items.reduce((s, i) => s + i.qty, 0);
  const total = items.reduce((s, i) => s + i.qty * i.price, 0);

  return <CartContext.Provider value={{ items, add, setQty, remove, clear, count, total }}>{children}</CartContext.Provider>;
}
