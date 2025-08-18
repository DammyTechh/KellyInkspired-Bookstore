import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, BookOpen } from 'lucide-react';
import { Book } from '../../types';
import { useCart } from '../../context/CartContext';
import { formatNaira } from '../../lib/supabaseClient';

interface BookCardProps {
  book: Book;
  index: number;
}

const BookCard = ({ book, index }: BookCardProps) => {
  const { addToCart } = useCart();
  const [isHovered, setIsHovered] = useState(false);

  const handleAddToCart = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    addToCart(book);
  };

  return (
    <motion.div 
      className="card book-card-hover h-full flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/books/${book.id}`} className="block overflow-hidden relative book-perspective">
        <div className="h-64 overflow-hidden">
          <motion.img 
            src={book.coverUrl} 
            alt={book.title} 
            className="w-full h-full object-cover"
            animate={{ 
              scale: isHovered ? 1.1 : 1
            }}
            transition={{ duration: 0.5 }}
          />
        </div>
        
        {/* Hover overlay */}
        <motion.div 
          className="absolute inset-0 bg-primary-900/70 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <button className="bg-white text-primary-600 rounded-full p-3">
            <BookOpen size={24} />
          </button>
        </motion.div>
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
            {formatNaira(book.price)}
          </span>
          <div className="flex space-x-2">
            <button 
              onClick={handleAddToCart}
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
  );
};

export default BookCard;