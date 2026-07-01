import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Calendar, Languages as Language, Tag, ShoppingCart, Sparkles, Clock } from 'lucide-react';
import { getBookById } from '../lib/api';
import { formatNaira } from '../lib/supabaseClient';
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
    window.scrollTo(0, 0);
    if (!id) return;
    setLoading(true);
    getBookById(id)
      .then((b) => {
        setBook(b);
        document.title = b ? `${b.title} | KellyInkspired` : 'Book Not Found | KellyInkspired';
      })
      .catch(() => setBook(null))
      .finally(() => setLoading(false));
  }, [id]);

  const bookInCart = items.find((item) => item.book.id === id) as CartItem | undefined;
  const isComingSoon = book?.status === 'coming_soon';

  const handleAddToCart = () => {
    if (!book) return;
    for (let i = 0; i < quantity; i++) addToCart(book);
    setQuantity(1);
  };

  if (loading) {
    return (
      <div className="container-custom py-32 flex justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-6 w-32 bg-gray-300 dark:bg-gray-700 rounded mb-4" />
          <div className="h-4 w-48 bg-gray-200 dark:bg-gray-800 rounded" />
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="container-custom py-32 text-center">
        <h2 className="text-2xl font-bold mb-4">Book Not Found</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          The book you're looking for does not exist or has been removed.
        </p>
        <Link to="/books" className="btn btn-primary inline-flex items-center">
          <ArrowLeft size={16} className="mr-2" /> Back to Books
        </Link>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="pt-28 pb-20">
      <div className="container-custom">
        <button onClick={() => navigate(-1)} className="mb-8 inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-primary-600">
          <ArrowLeft size={16} className="mr-2" /> Back
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Cover */}
          <motion.div className="book-perspective max-w-md mx-auto md:mx-0" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="relative">
              <img src={book.coverUrl} alt={book.title} className="w-full h-auto rounded-2xl shadow-2xl" />
              {book.isNewRelease && (
                <div className="absolute -top-4 -right-4 bg-accent-500 text-white text-sm font-bold px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                  <Sparkles size={14} /> New
                </div>
              )}
            </div>
          </motion.div>

          {/* Details */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
            <h1 className="text-3xl md:text-4xl font-heading font-bold mb-4">{book.title}</h1>

            <div className="flex items-center gap-4 mb-6">
              <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">{formatNaira(book.price)}</span>
              {book.featured && <span className="badge badge-new">Featured</span>}
              {isComingSoon && <span className="badge badge-soon flex items-center gap-1"><Clock size={13} /> Coming Soon</span>}
            </div>

            <p className="text-gray-700 dark:text-gray-300 mb-8 leading-relaxed whitespace-pre-line">{book.description}</p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <BookOpen size={18} className="text-primary-500" /> <span>{book.details.pages} pages</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Language size={18} className="text-primary-500" /> <span>{book.details.language}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Calendar size={18} className="text-primary-500" /> <span>{book.releaseDate ? new Date(book.releaseDate).toLocaleDateString('en-NG') : 'TBA'}</span>
              </div>
              {book.details.category && (
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Tag size={18} className="text-primary-500" /> <span>{book.details.category}</span>
                </div>
              )}
            </div>

            {isComingSoon ? (
              <div className="rounded-xl bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 p-6 mb-8">
                <p className="font-heading font-semibold text-lg mb-1 flex items-center gap-2">
                  <Clock size={18} className="text-primary-500" /> Stay tuned
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  This title is coming soon. Subscribe to our newsletter to be notified the moment it launches.
                </p>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <div className="flex items-center rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden w-fit">
                  <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="px-4 py-2 bg-gray-100 dark:bg-gray-700">-</button>
                  <span className="px-5 py-2 min-w-[3rem] text-center">{quantity}</span>
                  <button onClick={() => setQuantity((q) => q + 1)} className="px-4 py-2 bg-gray-100 dark:bg-gray-700">+</button>
                </div>
                <button onClick={handleAddToCart} className="btn btn-accent py-3 px-8 flex items-center justify-center">
                  <ShoppingCart size={20} className="mr-2" /> {bookInCart ? 'Add More' : 'Add to Cart'}
                </button>
                <Link to="/checkout" className="btn btn-primary py-3 px-8 flex items-center justify-center">Buy Now</Link>
              </div>
            )}

            {book.details.isbn && (
              <div className="text-sm text-gray-600 dark:text-gray-400">ISBN: {book.details.isbn}</div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default BookDetailPage;
