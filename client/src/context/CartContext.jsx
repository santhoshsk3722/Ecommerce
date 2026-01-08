import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);

    // Load cart from localStorage on init
    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            setCart(JSON.parse(savedCart));
        }
    }, []);

    // Save cart to localStorage on change
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product) => {
        setCart(currentCart => {
            const variantKey = product.selectedVariants ? JSON.stringify(product.selectedVariants) : '';
            const uniqueId = `${product.id}-${variantKey}`;

            const existingItem = currentCart.find(item => item.uniqueId === uniqueId);

            if (existingItem) {
                return currentCart.map(item =>
                    item.uniqueId === uniqueId
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...currentCart, { ...product, uniqueId, quantity: 1 }];
        });
    };

    const removeFromCart = (uniqueId) => {
        setCart(currentCart => currentCart.filter(item => item.uniqueId !== uniqueId));
    };

    const updateQuantity = (uniqueId, quantity) => {
        if (quantity < 1) {
            removeFromCart(uniqueId);
            return;
        }
        setCart(currentCart =>
            currentCart.map(item =>
                item.uniqueId === uniqueId ? { ...item, quantity } : item
            )
        );
    };

    const clearCart = () => {
        setCart([]);
    };

    const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount }}>
            {children}
        </CartContext.Provider>
    );
};

