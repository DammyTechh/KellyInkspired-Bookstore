import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Clock, Sparkles } from 'lucide-react';
import { getComingSoon } from '../../lib/api';
import type { Book } from '../../types';

const ComingSoon = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getComingSoon()
      .then(setBooks)
      .catch(() => setBooks([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading || books.length === 0) return null;

  return (
    <section className="section bg-gradient-to-b from-cream-100 to-cream-50 dark:from-gray-900 dark:to-gray-800/50">
      <div className="container-custom">
        <div className="text-center mb-12">
          <span className="badge badge-soon mb-4 inline-flex items-center gap-1">
            <Clock size={14} /> Stay Tuned
          </span>
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
            Coming <span className="text-gradient">Soon</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            New stories are on the way. Here's a glimpse of what's next.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {books.map((book, i) => (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="card book-card-hover overflow-hidden"
            >
              <Link to={`/books/${book.id}`} className="block relative">
                <div className="h-64 overflow-hidden">
                  <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover opacity-90" />
                </div>
                <div className="absolute top-4 left-4 badge badge-soon flex items-center gap-1">
                  <Sparkles size={13} /> Coming Soon
                </div>
              </Link>
              <div className="p-6">
                <h3 className="text-xl font-heading font-bold mb-2">{book.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 line-clamp-2">{book.description}</p>
                {book.releaseDate && (
                  <p className="text-sm text-primary-600 dark:text-primary-400 mt-3 flex items-center gap-1">
                    <Clock size={14} /> Expected {new Date(book.releaseDate).toLocaleDateString('en-NG', { month: 'long', year: 'numeric' })}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ComingSoon;
