import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

import Header from './components/Header';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';
import ErrorBoundary from './components/ErrorBoundary';

import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ProfilePage from './pages/ProfilePage';
import WishlistPage from './pages/WishlistPage';
import OrderConfirmPage from './pages/OrderConfirmPage';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';

import './index.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <Toaster position="top-right" />
          <ErrorBoundary>
            <Routes>
            {/* Admin routes (no header/footer) */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="orders" element={<AdminOrders />} />
            </Route>

            {/* Public routes */}
            <Route path="/*" element={
              <>
                <Header />
                <main>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/products" element={<ProductsPage />} />
                    <Route path="/products/:id" element={<ProductDetailPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/wishlist" element={<WishlistPage />} />
                    <Route path="/order-confirm/:id" element={<OrderConfirmPage />} />
                  </Routes>
                </main>
                <Footer />
                <Chatbot />
              </>
            } />
            </Routes>
          </ErrorBoundary>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
