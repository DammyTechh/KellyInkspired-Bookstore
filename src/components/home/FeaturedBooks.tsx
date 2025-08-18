import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingCart } from 'lucide-react';
import { getFeaturedBooks } from '../../data/books';
import { useCart } from '../../context/CartContext';
import { Book } from '../../types';

const FeaturedBooks = () => {
  const [featuredBooks, setFeaturedBooks] = useState<Book[]>([]);
  const { addToCart } = useCart();

  useEffect(() => {
    setFeaturedBooks(getFeaturedBooks());
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6 }
    }
  };

  const handleAddToCart = (book: Book, event: React.MouseEvent) => {
    event.preventDefault();
    addToCart(book);
    
    // Show visual feedback (could be replaced with a toast notification)
    const button = event.currentTarget as HTMLButtonElement;
    const originalText = button.innerText;
    button.innerText = 'Added!';
    setTimeout(() => {
      button.innerText = originalText;
    }, 1500);
  };

  return (
    <section className="section bg-gray-50 dark:bg-gray-800/50">
      <div className="container-custom">
        <div className="text-center mb-12">
          <motion.h2 
            className="text-3xl md:text-4xl font-heading font-bold mb-4 text-gray-800 dark:text-gray-100"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Featured Books
          </motion.h2>
          <motion.p 
            className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Discover the most inspiring works by Awokunle M. Kelechi that have touched 
            countless lives with profound spiritual wisdom and transformative messages.
          </motion.p>
        </div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {featuredBooks.map((book) => (
            <motion.div 
              key={book.id}
              variants={itemVariants}
              className="card book-card-hover h-full flex flex-col"
            >
              <Link to={`/books/${book.id}`} className="block overflow-hidden relative book-perspective">
                <div className="h-64 overflow-hidden">
                  <img 
                    src={book.coverUrl} 
                    alt={book.title} 
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                  />
                </div>
              </Link>
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-100">
                  {book.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4 flex-grow line-clamp-3">
                  {book.description}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                    ${book.price.toFixed(2)}
                  </span>
                  <div className="flex space-x-2">
                    <button 
                      onClick={(e) => handleAddToCart(book, e)}
                      className="btn bg-accent-500 hover:bg-accent-600 text-white p-2 rounded-full"
                      aria-label="Add to cart"
                    >
                      <ShoppingCart size={18} />
                    </button>
                    <Link 
                      to={`/books/${book.id}`}
                      className="btn btn-primary flex items-center"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="text-center mt-12">
          <Link 
            to="/books" 
            className="btn btn-primary inline-flex items-center px-6 py-3"
          >
            View All Books
            <ArrowRight size={16} className="ml-2" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedBooks;