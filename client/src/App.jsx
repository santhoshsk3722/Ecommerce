import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { LoyaltyProvider } from './context/LoyaltyContext';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Login from './pages/Login';
import NavBar from './components/NavBar'; // Will create next
import Footer from './components/Footer';
import AIChatbot from './components/AIChatbot';

import { ToastProvider } from './context/ToastContext';
import MyOrders from './pages/MyOrders';
import Wishlist from './pages/Wishlist';
import SellerDashboard from './pages/SellerDashboard';
import AddProduct from './pages/AddProduct';
import EditProduct from './pages/EditProduct';
import SellerOrders from './pages/SellerOrders';
import Checkout from './pages/Checkout';
import OrderDetail from './pages/OrderDetail';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import VisualSearch from './pages/VisualSearch';

import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <LoyaltyProvider>
            <Router>
              <ScrollToTop />
              <NavBar />
              <div className="container" style={{ minHeight: '80vh' }}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/orders" element={<MyOrders />} />
                  <Route path="/order/:id" element={<OrderDetail />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/seller" element={<SellerDashboard />} />
                  <Route path="/seller/add-product" element={<AddProduct />} />
                  <Route path="/seller/product/edit/:id" element={<EditProduct />} />
                  <Route path="/seller/orders" element={<SellerOrders />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/visual-search" element={<VisualSearch />} />
                </Routes>
              </div>
              <Footer />
              <AIChatbot />
            </Router>
          </LoyaltyProvider>
        </CartProvider>
      </AuthProvider >
    </ToastProvider >
  );
}

export default App;
