import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getNewReleases } from '../../lib/api';
import { formatNaira } from '../../lib/supabaseClient';
import type { Book } from '../../types';

const Hero = () => {
  const [release, setRelease] = useState<Book | null>(null);

  useEffect(() => {
    getNewReleases()
      .then((books) => setRelease(books[0] ?? null))
      .catch(() => setRelease(null));
  }, []);

  return (
    <section className="relative overflow-hidden bg-cream-100 dark:bg-gray-900 py-28 lg:py-36">
      {/* Soft decorative blobs */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-16 right-[8%] w-72 h-72 bg-primary-300/40 dark:bg-primary-700/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-[5%] w-80 h-80 bg-accent-300/40 dark:bg-accent-800/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/2 w-40 h-40 bg-secondary-200/40 dark:bg-secondary-800/20 rounded-full blur-2xl" />
      </div>

      <div className="container-custom relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-xl"
          >
            <span className="badge badge-new mb-6 inline-flex items-center gap-1">
              <Sparkles size={14} /> Faith · Purpose · Storytelling
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold leading-tight mb-6 text-gray-900 dark:text-white">
              Inspiring Stories <br />
              <span className="text-gradient">for a Purposeful Life</span>
            </h1>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
              Discover the transformative writings of Awokunle M. Kelechi —
              award-winning author, storyteller, and teenage coach devoted to
              inspiring lives through faith-based stories.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/books" className="btn btn-primary px-8 py-3 flex items-center justify-center group">
                Browse Books
                <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/about" className="btn btn-outline px-8 py-3 flex items-center justify-center">
                About the Author
              </Link>
            </div>
          </motion.div>

          {/* New release ad banner */}
          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            {release ? (
              <Link to={`/books/${release.id}`} className="book-perspective group">
                <div className="relative max-w-xs">
                  <motion.img
                    src={release.coverUrl}
                    alt={release.title}
                    className="rounded-2xl shadow-2xl w-full object-cover"
                    whileHover={{ rotateY: 12 }}
                    transition={{ type: 'spring', stiffness: 100 }}
                  />
                  <div className="absolute -top-4 -right-4 bg-accent-500 text-white text-sm font-bold px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                    <Sparkles size={14} /> New Release
                  </div>
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent rounded-b-2xl p-4">
                    <p className="text-white font-heading font-semibold text-lg leading-snug line-clamp-2">{release.title}</p>
                    <p className="text-accent-200 font-bold">{formatNaira(release.price)}</p>
                  </div>
                </div>
              </Link>
            ) : (
              <div className="relative max-w-xs w-full aspect-[3/4] rounded-2xl bg-gradient-to-br from-primary-200 to-accent-200 dark:from-primary-900/40 dark:to-accent-900/40 flex flex-col items-center justify-center text-center p-8 shadow-2xl">
                <Sparkles className="text-primary-500 mb-3" size={40} />
                <p className="font-heading font-bold text-xl text-gray-800 dark:text-gray-100">New releases coming soon</p>
                <p className="text-gray-600 dark:text-gray-300 mt-2">Stay tuned for something beautiful.</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
