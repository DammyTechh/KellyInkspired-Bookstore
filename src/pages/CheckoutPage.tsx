import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trash2, CreditCard, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const CheckoutPage = () => {
  const { items, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });

  useEffect(() => {
    // Update page title
    document.title = 'Checkout | KellyInkspired';
    
    // Scroll to top on component mount
    window.scrollTo(0, 0);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!isValidForm()) {
      setMessage({ type: 'error', text: 'Please fill in all required fields correctly' });
      return;
    }
    
    // Process payment
    processPayment();
  };

  const isValidForm = () => {
    // Basic validation
    return Object.values(formData).every(value => value.trim() !== '');
  };

  const processPayment = () => {
    setIsLoading(true);
    setMessage(null);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsLoading(false);
      setMessage({ type: 'success', text: 'Payment successful! Your order has been placed.' });
      
      // Clear cart and redirect after successful payment
      setTimeout(() => {
        clearCart();
        navigate('/');
      }, 3000);
    }, 2000);
  };

  // If cart is empty, show empty cart message
  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="pt-12 pb-20"
      >
        <div className="container-custom max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
            <h1 className="text-2xl font-heading font-bold mb-4 text-gray-800 dark:text-gray-100">
              Your Cart is Empty
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              You haven't added any books to your cart yet.
            </p>
            <Link 
              to="/books" 
              className="btn btn-primary inline-flex items-center"
            >
              <ArrowLeft size={16} className="mr-2" />
              Browse Books
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  // If user is not authenticated, redirect to login
  if (!isAuthenticated) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="pt-12 pb-20"
      >
        <div className="container-custom max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
            <h1 className="text-2xl font-heading font-bold mb-4 text-gray-800 dark:text-gray-100">
              Sign In Required
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Please sign in or create an account to complete your purchase.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                to="/login" 
                className="btn btn-primary inline-block"
              >
                Sign In
              </Link>
              <Link 
                to="/register" 
                className="btn bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 inline-block"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="pt-12 pb-20"
    >
      <div className="container-custom">
        <h1 className="text-3xl font-heading font-bold mb-8 text-gray-800 dark:text-gray-100">
          Checkout
        </h1>
        
        {message && (
          <div 
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' 
                : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
            }`}
          >
            {message.text}
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold mb-0 text-gray-800 dark:text-gray-100">
                  Cart Items
                </h2>
              </div>
              
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {items.map((item) => (
                  <div key={item.book.id} className="p-6 flex flex-col sm:flex-row gap-4">
                    <div className="w-24 h-24 shrink-0 rounded-lg overflow-hidden">
                      <img 
                        src={item.book.coverUrl} 
                        alt={item.book.title} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-grow">
                      <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-1">
                        {item.book.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        ${item.book.price.toFixed(2)}
                      </p>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <label htmlFor={`quantity-${item.book.id}`} className="sr-only">
                            Quantity
                          </label>
                          <select
                            id={`quantity-${item.book.id}`}
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.book.id, parseInt(e.target.value))}
                            className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-800 dark:text-gray-200 px-2 py-1"
                          >
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                              <option key={num} value={num}>
                                {num}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <button
                          onClick={() => removeFromCart(item.book.id)}
                          className="text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                          aria-label="Remove item"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="text-right font-medium text-gray-800 dark:text-gray-100">
                      ${(item.book.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Order Summary */}
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
              <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">
                Order Summary
              </h2>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Tax</span>
                  <span>${(totalPrice * 0.05).toFixed(2)}</span>
                </div>
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                <div className="flex justify-between text-lg font-bold text-gray-800 dark:text-gray-100">
                  <span>Total</span>
                  <span>${(totalPrice + (totalPrice * 0.05)).toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            {/* Payment Form */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">
                Payment Information
              </h2>
              
              <form onSubmit={handleFormSubmit}>
                <div className="space-y-4">
                  <div>
                    <label 
                      htmlFor="fullName" 
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                      required
                    />
                  </div>
                  
                  <div>
                    <label 
                      htmlFor="email" 
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                      required
                    />
                  </div>
                  
                  <div>
                    <label 
                      htmlFor="address" 
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Address
                    </label>
                    <input
                      type="text"
                      id="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label 
                        htmlFor="city" 
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        City
                      </label>
                      <input
                        type="text"
                        id="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                        required
                      />
                    </div>
                    <div>
                      <label 
                        htmlFor="state" 
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        State
                      </label>
                      <input
                        type="text"
                        id="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label 
                      htmlFor="zipCode" 
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      id="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                      required
                    />
                  </div>
                  
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h3 className="text-lg font-bold mb-3 text-gray-800 dark:text-gray-100">
                      Card Details
                    </h3>
                    
                    <div>
                      <label 
                        htmlFor="cardNumber" 
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Card Number
                      </label>
                      <input
                        type="text"
                        id="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                        placeholder="1234 5678 9012 3456"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <label 
                          htmlFor="expiryDate" 
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          id="expiryDate"
                          value={formData.expiryDate}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                          placeholder="MM/YY"
                          required
                        />
                      </div>
                      <div>
                        <label 
                          htmlFor="cvv" 
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                          CVV
                        </label>
                        <input
                          type="text"
                          id="cvv"
                          value={formData.cvv}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                          placeholder="123"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full btn btn-primary py-3 rounded-lg font-medium flex items-center justify-center mt-6 disabled:opacity-70"
                >
                  {isLoading ? (
                    'Processing...'
                  ) : (
                    <>
                      <CreditCard size={18} className="mr-2" />
                      Pay ${(totalPrice + (totalPrice * 0.05)).toFixed(2)}
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CheckoutPage;