import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Calendar, BookOpen } from 'lucide-react';
import { getBlogs } from '../lib/api';
import type { Blog } from '../types';

const formatDate = (d: string) =>
  d ? new Date(d).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' }) : '';

const BlogPage = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBlogs()
      .then(setBlogs)
      .catch(() => setBlogs([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="pt-28 pb-20 min-h-screen">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
            The <span className="text-gradient">Blog</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Faith, purpose, and storytelling — reflections and updates from Awokunle M. Kelechi.
          </p>
        </motion.div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card h-80 animate-pulse bg-gray-100 dark:bg-gray-800" />
            ))}
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="mx-auto text-primary-400 mb-4" size={56} />
            <h3 className="text-2xl font-heading font-bold mb-2">No posts yet</h3>
            <p className="text-gray-600 dark:text-gray-400">
              New writeups are on the way. Stay tuned!
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog, i) => (
              <motion.article
                key={blog.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="card book-card-hover flex flex-col"
              >
                <Link to={`/blog/${blog.slug}`} className="block overflow-hidden h-48">
                  {blog.coverUrl ? (
                    <img src={blog.coverUrl} alt={blog.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary-200 to-accent-200 dark:from-primary-900/50 dark:to-accent-900/50 flex items-center justify-center">
                      <BookOpen className="text-primary-500" size={40} />
                    </div>
                  )}
                </Link>
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-2">
                    <Calendar size={14} /> {formatDate(blog.publishedAt)}
                  </div>
                  <Link to={`/blog/${blog.slug}`}>
                    <h3 className="text-xl font-heading font-bold mb-2 hover:text-primary-600 dark:hover:text-primary-400 transition-colors line-clamp-2">
                      {blog.title}
                    </h3>
                  </Link>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 flex-grow line-clamp-3">
                    {blog.excerpt}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1"><Heart size={15} /> {blog.likeCount}</span>
                      <span className="flex items-center gap-1"><MessageCircle size={15} /> {blog.commentCount}</span>
                    </div>
                    <Link to={`/blog/${blog.slug}`} className="text-sm font-medium text-primary-600 dark:text-primary-400">
                      Read more →
                    </Link>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogPage;
