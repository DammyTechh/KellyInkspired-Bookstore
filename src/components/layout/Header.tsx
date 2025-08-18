import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingCart, Book, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';
import { useTheme } from '../../context/ThemeContext';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../common/ThemeToggle';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme } = useTheme();
  const { totalItems } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    closeMenu();
  }, [location]);

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Books', href: '/books' },
    { name: 'About', href: '/about' },
  ];

  return (
    <header 
      className={twMerge(
        'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
        isScrolled 
          ? 'bg-white dark:bg-gray-900 shadow-md py-2' 
          : 'bg-transparent py-4'
      )}
    >
      <div className="container-custom flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <Book 
            size={28} 
            className="text-primary-600 dark:text-primary-400" 
          />
          <span className="text-xl font-heading font-bold text-primary-700 dark:text-primary-300">
            kellyinkspired
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={twMerge(
                'font-medium transition-colors duration-300',
                location.pathname === item.href
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400'
              )}
            >
              {item.name}
            </Link>
          ))}
          {user?.role === 'admin' && (
            <Link
              to="/admin/dashboard"
              className="text-accent-500 dark:text-accent-400 font-medium hover:text-accent-600 dark:hover:text-accent-500"
            >
              Dashboard
            </Link>
          )}
        </nav>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center space-x-6">
          <ThemeToggle />

          <Link to="/checkout" className="relative">
            <ShoppingCart size={22} className="text-gray-700 dark:text-gray-300" />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-accent-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <div className="relative group">
              <button className="flex items-center space-x-2">
                <User size={22} className="text-gray-700 dark:text-gray-300" />
              </button>
              <div className="absolute right-0 mt-2 w-48 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user?.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                </div>
                <button
                  onClick={logout}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary py-1.5 px-4 text-sm">
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center space-x-4 md:hidden">
          <ThemeToggle />
          
          <Link to="/checkout" className="relative">
            <ShoppingCart size={22} className="text-gray-700 dark:text-gray-300" />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-accent-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>
          
          <button 
            className="text-gray-700 dark:text-gray-300"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <motion.div 
          className="md:hidden bg-white dark:bg-gray-900 shadow-lg absolute top-full left-0 right-0"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          <div className="container-custom py-4">
            <nav className="flex flex-col space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={twMerge(
                    'font-medium p-2 transition-colors duration-300',
                    location.pathname === item.href
                      ? 'text-primary-600 dark:text-primary-400 bg-gray-100 dark:bg-gray-800 rounded-lg'
                      : 'text-gray-700 dark:text-gray-300'
                  )}
                  onClick={closeMenu}
                >
                  {item.name}
                </Link>
              ))}
              {user?.role === 'admin' && (
                <Link
                  to="/admin/dashboard"
                  className="text-accent-500 dark:text-accent-400 font-medium p-2"
                  onClick={closeMenu}
                >
                  Dashboard
                </Link>
              )}
              {isAuthenticated ? (
                <>
                  <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                    <p className="font-medium text-gray-900 dark:text-gray-100">{user?.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      closeMenu();
                    }}
                    className="text-left p-2 text-gray-700 dark:text-gray-300"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="btn btn-primary text-center"
                  onClick={closeMenu}
                >
                  Sign In
                </Link>
              )}
            </nav>
          </div>
        </motion.div>
      )}
    </header>
  );
};

export default Header;