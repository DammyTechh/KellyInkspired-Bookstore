import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Book, Users, DollarSign, TrendingUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Book as BookType } from '../../types';
import { supabase } from '../../lib/supabaseClient';

const DashboardPage = () => {
  const [books, setBooks] = useState<BookType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Admin Dashboard | KellyInkspired';
    
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }

    fetchBooks();
  }, [user, navigate]);

  const fetchBooks = async () => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBooks(data || []);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const stats = [
    {
      title: 'Total Books',
      value: books.length,
      icon: <Book className="w-6 h-6" />,
      color: 'bg-primary-100 text-primary-600',
    },
    {
      title: 'Featured Books',
      value: books.filter(book => book.featured).length,
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'bg-secondary-100 text-secondary-600',
    },
    {
      title: 'Total Sales',
      value: '$0.00',
      icon: <DollarSign className="w-6 h-6" />,
      color: 'bg-accent-100 text-accent-600',
    },
    {
      title: 'Active Users',
      value: '0',
      icon: <Users className="w-6 h-6" />,
      color: 'bg-gray-100 text-gray-600',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="pt-12 pb-20"
    >
      <div className="container-custom">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-heading font-bold text-gray-800 dark:text-gray-100">
            Admin Dashboard
          </h1>
          <button
            onClick={() => navigate('/admin/books/new')}
            className="btn btn-primary flex items-center"
          >
            <Plus size={20} className="mr-2" />
            Add New Book
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
            >
              <div className="flex items-center">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  {stat.icon}
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {stat.title}
                  </h3>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                    {stat.value}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Recent Books */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
              Recent Books
            </h2>
          </div>

          {isLoading ? (
            <div className="p-6">
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : books.length > 0 ? (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {books.map((book) => (
                <div
                  key={book.id}
                  className="p-6 flex items-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <img
                    src={book.coverUrl}
                    alt={book.title}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100">
                      {book.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Added on {new Date(book.releaseDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                      ${book.price}
                    </p>
                    <button
                      onClick={() => navigate(`/admin/books/${book.id}/edit`)}
                      className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              No books found. Add your first book to get started.
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardPage;