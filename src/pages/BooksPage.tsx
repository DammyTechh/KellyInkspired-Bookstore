import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import BookCard from '../components/books/BookCard';
import { Book } from '../types';
import { supabase } from '../lib/supabaseClient';

const BooksPage = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState<string[]>(['all']);

  useEffect(() => {
    document.title = 'Books | KellyInkspired';
    window.scrollTo(0, 0);
    
    // Subscribe to real-time updates
    const subscription = supabase
      .channel('books_channel')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'books' 
      }, payload => {
        if (payload.eventType === 'INSERT') {
          setBooks(prev => [...prev, payload.new as Book]);
        } else if (payload.eventType === 'DELETE') {
          setBooks(prev => prev.filter(book => book.id !== payload.old.id));
        } else if (payload.eventType === 'UPDATE') {
          setBooks(prev => prev.map(book => 
            book.id === payload.new.id ? payload.new as Book : book
          ));
        }
      })
      .subscribe();

    // Initial fetch
    fetchBooks();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchBooks = async () => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setBooks(data || []);
      // Extract unique categories
      const uniqueCategories = ['all', ...new Set(data?.map(book => book.details.category) || [])];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         book.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || book.details.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="pt-12 pb-20">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-200 dark:bg-gray-700 h-64 rounded-lg mb-4"></div>
                <div className="space-y-3">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
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
      {/* Header Banner */}
      <div className="bg-primary-700 dark:bg-primary-800 text-white py-12 mb-12">
        <div className="container-custom">
          <h1 className="text-3xl md:text-4xl font-heading font-bold mb-4">
            Explore Our Books
          </h1>
          <p className="text-lg text-gray-100 max-w-2xl">
            Discover Awokunle M. Kelechi's collection of transformative books that inspire 
            faith, purpose, and spiritual growth.
          </p>
        </div>
      </div>
      
      <div className="container-custom">
        {/* Search and Filter */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="flex-grow relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400" />
            <input
              type="text"
              placeholder="Search books..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-2 focus:ring-primary-400 dark:focus:ring-primary-600"
            />
          </div>
          
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="pl-4 pr-8 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-2 focus:ring-primary-400 dark:focus:ring-primary-600"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Books Grid */}
        {filteredBooks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBooks.map((book, index) => (
              <BookCard key={book.id} book={book} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-4">
              No books found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search or filter to find what you're looking for.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default BooksPage;