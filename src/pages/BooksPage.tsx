import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, BookOpen } from 'lucide-react';
import BookCard from '../components/books/BookCard';
import { getPublishedBooks } from '../lib/api';
import { supabase } from '../lib/supabaseClient';
import type { Book } from '../types';

const BooksPage = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const load = () =>
    getPublishedBooks()
      .then(setBooks)
      .catch(() => setBooks([]))
      .finally(() => setLoading(false));

  useEffect(() => {
    document.title = 'Books | KellyInkspired';
    window.scrollTo(0, 0);
    load();

    const subscription = supabase
      .channel('books_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'books' }, () => load())
      .subscribe();

    return () => { subscription.unsubscribe(); };
  }, []);

  const categories = useMemo(() => {
    const set = new Set(books.map((b) => b.details.category).filter(Boolean));
    return ['all', ...Array.from(set)];
  }, [books]);

  const filtered = books.filter((book) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = book.title.toLowerCase().includes(q) || book.description.toLowerCase().includes(q);
    const matchesCategory = selectedCategory === 'all' || book.details.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="pb-20">
      {/* Banner */}
      <div className="bg-cream-100 dark:bg-gray-800 pt-28 pb-12 mb-12">
        <div className="container-custom">
          <h1 className="text-3xl md:text-4xl font-heading font-bold mb-4">
            Explore Our <span className="text-gradient">Books</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl">
            Awokunle M. Kelechi's collection of transformative books that inspire
            faith, purpose, and spiritual growth.
          </p>
        </div>
      </div>

      <div className="container-custom">
        {/* Search + filter */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="flex-grow relative">
            <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text" placeholder="Search books..." value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10"
            />
          </div>
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="input md:w-56">
            {categories.map((c) => (
              <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card h-96 animate-pulse bg-gray-100 dark:bg-gray-800" />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((book, i) => <BookCard key={book.id} book={book} index={i} />)}
          </div>
        ) : (
          <div className="text-center py-16">
            <BookOpen className="mx-auto text-primary-400 mb-4" size={48} />
            <h3 className="text-xl font-medium mb-2">
              {books.length === 0 ? 'No books available yet' : 'No books found'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {books.length === 0 ? 'New titles are on the way. Stay tuned!' : 'Try adjusting your search or filter.'}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default BooksPage;
