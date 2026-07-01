import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import BooksPage from './pages/BooksPage';
import BookDetailPage from './pages/BookDetailPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import BlogPage from './pages/BlogPage';
import BlogDetailPage from './pages/BlogDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminLoginPage from './pages/admin/LoginPage';
import CheckoutPage from './pages/CheckoutPage';
import DashboardPage from './pages/admin/DashboardPage';
import BookFormPage from './pages/admin/BookFormPage';
import BlogFormPage from './pages/admin/BlogFormPage';
import ProtectedAdminRoute from './components/common/ProtectedAdminRoute';
import Preloader from './components/common/Preloader';

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2200);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <Preloader />;

  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <Layout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/books" element={<BooksPage />} />
                <Route path="/books/:id" element={<BookDetailPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/blog" element={<BlogPage />} />
                <Route path="/blog/:slug" element={<BlogDetailPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />

                {/* Secure admin area — entry point is /admin */}
                <Route path="/admin" element={<AdminLoginPage />} />
                <Route path="/admin/dashboard" element={<ProtectedAdminRoute><DashboardPage /></ProtectedAdminRoute>} />
                <Route path="/admin/books/new" element={<ProtectedAdminRoute><BookFormPage /></ProtectedAdminRoute>} />
                <Route path="/admin/books/:id/edit" element={<ProtectedAdminRoute><BookFormPage /></ProtectedAdminRoute>} />
                <Route path="/admin/blogs/new" element={<ProtectedAdminRoute><BlogFormPage /></ProtectedAdminRoute>} />
                <Route path="/admin/blogs/:id/edit" element={<ProtectedAdminRoute><BlogFormPage /></ProtectedAdminRoute>} />
              </Routes>
            </Layout>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
