import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Login from './pages/Login';
import NavBar from './components/NavBar'; // Will create next

import { ToastProvider } from './context/ToastContext';
import MyOrders from './pages/MyOrders';
import Wishlist from './pages/Wishlist';
import SellerDashboard from './pages/SellerDashboard';
import EditProduct from './pages/EditProduct';
import SellerOrders from './pages/SellerOrders';
import Checkout from './pages/Checkout';
import OrderDetail from './pages/OrderDetail';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
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
                <Route path="/seller/product/edit/:id" element={<EditProduct />} />
                <Route path="/seller/orders" element={<SellerOrders />} />
                <Route path="/admin" element={<AdminDashboard />} />
              </Routes>
            </div>
            {/* Simple Footer */}
            <footer style={{ background: '#172337', color: 'white', padding: '40px 0', marginTop: '50px' }}>
              <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                <div>
                  <h3 style={{ marginBottom: '15px', fontSize: '14px', color: '#878787' }}>ABOUT</h3>
                  <div style={{ fontSize: '12px', lineHeight: '2' }}>Contact Us</div>
                  <div style={{ fontSize: '12px', lineHeight: '2' }}>About Us</div>
                  <div style={{ fontSize: '12px', lineHeight: '2' }}>Careers</div>
                </div>
                <div>
                  <h3 style={{ marginBottom: '15px', fontSize: '14px', color: '#878787' }}>HELP</h3>
                  <div style={{ fontSize: '12px', lineHeight: '2' }}>Payments</div>
                  <div style={{ fontSize: '12px', lineHeight: '2' }}>Shipping</div>
                  <div style={{ fontSize: '12px', lineHeight: '2' }}>Cancellation & Returns</div>
                </div>
                <div>
                  <h3 style={{ marginBottom: '15px', fontSize: '14px', color: '#878787' }}>CONSUMER POLICY</h3>
                  <div style={{ fontSize: '12px', lineHeight: '2' }}>Terms Of Use</div>
                  <div style={{ fontSize: '12px', lineHeight: '2' }}>Security</div>
                  <div style={{ fontSize: '12px', lineHeight: '2' }}>Privacy</div>
                </div>
                <div style={{ borderLeft: '1px solid #454d5e', paddingLeft: '20px' }}>
                  <h3 style={{ marginBottom: '15px', fontSize: '14px', color: '#878787' }}>Mail Us:</h3>
                  <p style={{ fontSize: '12px', lineHeight: '1.5' }}>E-Shop Private Limited,<br /> Buildings Alyssa, Begonia &<br /> Clove Embassy Tech Village,<br /> Bengaluru, 560103,<br /> Karnataka, India</p>
                </div>
              </div>
            </footer>
          </Router>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
