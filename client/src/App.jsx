import React, { Suspense, lazy } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { LoyaltyProvider } from './context/LoyaltyContext';
import { ToastProvider } from './context/ToastContext';

// Components (Keep static for immediate load)
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import AIChatbot from './components/AIChatbot';
import BottomNav from './components/BottomNav';
import ScrollToTop from './components/ScrollToTop';
import InstallPrompt from './components/InstallPrompt';
import LoadingSpinner from './components/LoadingSpinner';

// Pages (Lazy Load)
const Home = lazy(() => import('./pages/Home'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Login = lazy(() => import('./pages/Login'));
const MyOrders = lazy(() => import('./pages/MyOrders'));
const OrderDetail = lazy(() => import('./pages/OrderDetail'));
const Profile = lazy(() => import('./pages/Profile'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const SellerDashboard = lazy(() => import('./pages/SellerDashboard'));
const AddProduct = lazy(() => import('./pages/AddProduct'));
const EditProduct = lazy(() => import('./pages/EditProduct'));
const SellerOrders = lazy(() => import('./pages/SellerOrders'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const VisualSearch = lazy(() => import('./pages/VisualSearch'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Checkout = lazy(() => import('./pages/Checkout'));

function App() {
  return (
    <HelmetProvider>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <LoyaltyProvider>
              <Router>
                <ScrollToTop />
                <NavBar />
                <div className="container" style={{ minHeight: '80vh' }}>
                  <Suspense fallback={<LoadingSpinner />}>
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
                      <Route path="/forgot-password" element={<ForgotPassword />} />
                      <Route path="/reset-password/:token" element={<ResetPassword />} />
                    </Routes>
                  </Suspense>
                </div>
                <Footer />
                <BottomNav />
                <InstallPrompt />
                <AIChatbot />
              </Router>
            </LoyaltyProvider>
          </CartProvider>
        </AuthProvider >
      </ToastProvider >
    </HelmetProvider>
  );
}

export default App;

