import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Calendar, Languages as Language, Tag, ShoppingCart } from 'lucide-react';
import { getBookById } from '../data/books';
import { Book, CartItem } from '../types';
import { useCart } from '../context/CartContext';

const BookDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addToCart, items } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    // Scroll to top on component mount
    window.scrollTo(0, 0);
    
    if (id) {
      const foundBook = getBookById(id);
      setBook(foundBook || null);
      
      if (foundBook) {
        document.title = `${foundBook.title} | KellyInkspired`;
      } else {
        document.title = 'Book Not Found | KellyInkspired';
      }
    }
    
    setLoading(false);
  }, [id]);

  // Check if this book is already in the cart
  const bookInCart = items.find(item => item.book.id === id) as CartItem | undefined;

  const handleAddToCart = () => {
    if (book) {
      // Add the book to cart multiple times based on quantity
      for (let i = 0; i < quantity; i++) {
        addToCart(book);
      }
      
      // Show a temporary success message or toast notification here
      
      // Reset quantity
      setQuantity(1);
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setQuantity(value);
    }
  };

  if (loading) {
    return (
      <div className="container-custom py-20 flex justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-6 w-32 bg-gray-300 dark:bg-gray-700 rounded mb-4"></div>
          <div className="h-4 w-48 bg-gray-200 dark:bg-gray-800 rounded"></div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="container-custom py-20 text-center">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">
          Book Not Found
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          The book you're looking for does not exist or has been removed.
        </p>
        <Link 
          to="/books" 
          className="btn btn-primary inline-flex items-center"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Books
        </Link>
      </div>
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
        {/* Navigation */}
        <div className="mb-8">
          <button 
            onClick={() => navigate(-1)} 
            className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Book Cover */}
          <motion.div 
            className="book-perspective max-w-md mx-auto md:mx-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div 
              className="book-3d"
              whileHover={{ rotateY: 25 }}
              transition={{ type: "spring", stiffness: 100 }}
            >
              <img 
                src={book.coverUrl} 
                alt={book.title} 
                className="w-full h-auto rounded-lg shadow-2xl"
              />
              
              {/* Book spine/side effect */}
              <div className="absolute top-0 left-0 w-10 h-full bg-gray-800 opacity-30 transform origin-left skew-y-12" />
              
              {/* Book highlight effect */}
              <div className="absolute top-0 right-0 w-1/3 h-full bg-white opacity-10 rounded-r-lg" />
            </motion.div>
          </motion.div>
          
          {/* Book Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h1 className="text-3xl md:text-4xl font-heading font-bold mb-4 text-gray-800 dark:text-gray-100">
              {book.title}
            </h1>
            
            <div className="flex items-center space-x-4 mb-6">
              <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                ${book.price.toFixed(2)}
              </span>
              {book.featured && (
                <span className="bg-accent-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  Featured
                </span>
              )}
            </div>
            
            <p className="text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
              {book.description}
            </p>
            
            {/* Book Metadata */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                <BookOpen size={18} className="text-primary-600 dark:text-primary-400" />
                <span>{book.details.pages} pages</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                <Language size={18} className="text-primary-600 dark:text-primary-400" />
                <span>{book.details.language}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                <Calendar size={18} className="text-primary-600 dark:text-primary-400" />
                <span>{new Date(book.releaseDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                <Tag size={18} className="text-primary-600 dark:text-primary-400" />
                <span>{book.details.category}</span>
              </div>
            </div>
            
            {/* Add to Cart Section */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="relative w-24">
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={handleQuantityChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-center bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200"
                />
                <div className="absolute inset-y-0 right-0 flex flex-col">
                  <button 
                    className="flex-1 px-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-tr-lg"
                    onClick={() => setQuantity(prev => prev + 1)}
                  >
                    +
                  </button>
                  <button 
                    className="flex-1 px-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-br-lg"
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  >
                    -
                  </button>
                </div>
              </div>
              
              <button 
                onClick={handleAddToCart}
                className="btn bg-accent-500 hover:bg-accent-600 text-white py-3 px-8 rounded-lg flex items-center justify-center"
              >
                <ShoppingCart size={20} className="mr-2" />
                {bookInCart ? 'Add More to Cart' : 'Add to Cart'}
              </button>
              
              <Link
                to="/checkout"
                className="btn btn-primary py-3 px-8 rounded-lg"
              >
                Buy Now
              </Link>
            </div>
            
            {/* ISBN */}
            <div className="text-sm text-gray-600 dark:text-gray-400">
              ISBN: {book.details.isbn}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default BookDetailPage;