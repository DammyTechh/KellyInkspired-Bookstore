import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Heart, MessageCircle, Calendar, ArrowLeft, Send, Loader2,
  Facebook, Twitter, Linkedin, Link2, Check,
} from 'lucide-react';
import { getBlogBySlug, getComments, addComment, toggleLike } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import type { Blog, BlogComment } from '../types';

const formatDate = (d: string) =>
  d ? new Date(d).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' }) : '';

const BlogDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [blog, setBlog] = useState<Blog | null>(null);
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [posting, setPosting] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    getBlogBySlug(slug)
      .then(async (b) => {
        setBlog(b);
        setLikeCount(b?.likeCount ?? 0);
        if (b) setComments(await getComments(b.id));
      })
      .catch(() => setBlog(null))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleLike = async () => {
    if (!isAuthenticated || !user || !blog) {
      navigate('/login');
      return;
    }
    const optimistic = !liked;
    setLiked(optimistic);
    setLikeCount((c) => c + (optimistic ? 1 : -1));
    try {
      const now = await toggleLike(blog.id, user.id);
      setLiked(now);
    } catch {
      setLiked(!optimistic);
      setLikeCount((c) => c + (optimistic ? -1 : 1));
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !user || !blog) {
      navigate('/login');
      return;
    }
    if (!commentText.trim()) return;
    setPosting(true);
    try {
      await addComment(blog.id, user.id, user.name, commentText.trim());
      setComments(await getComments(blog.id));
      setCommentText('');
    } finally {
      setPosting(false);
    }
  };

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = blog ? encodeURIComponent(blog.title) : '';
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  if (loading) {
    return (
      <div className="pt-28 pb-20 min-h-screen container-custom">
        <div className="h-96 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-xl" />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="pt-28 pb-20 min-h-screen container-custom text-center">
        <h1 className="text-3xl font-heading font-bold mb-4">Post not found</h1>
        <Link to="/blog" className="btn btn-primary inline-flex items-center gap-2">
          <ArrowLeft size={18} /> Back to blog
        </Link>
      </div>
    );
  }

  return (
    <article className="pt-28 pb-20 min-h-screen">
      <div className="container-custom max-w-3xl">
        <Link to="/blog" className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 mb-6 hover:underline">
          <ArrowLeft size={18} /> Back to blog
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
            <Calendar size={15} /> {formatDate(blog.publishedAt)} · {blog.authorName}
          </div>
          <h1 className="text-3xl md:text-5xl font-heading font-bold mb-6">{blog.title}</h1>

          {blog.coverUrl && (
            <img src={blog.coverUrl} alt={blog.title} className="w-full rounded-2xl mb-8 object-cover max-h-[420px]" />
          )}

          <div className="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
            {blog.content}
          </div>

          {/* Media attachments */}
          {blog.media.length > 0 && (
            <div className="mt-8 space-y-6">
              {blog.media.map((m, i) => (
                <figure key={i} className="rounded-xl overflow-hidden">
                  {m.type === 'image' && <img src={m.url} alt={m.caption ?? ''} className="w-full rounded-xl" />}
                  {m.type === 'video' && (
                    <video src={m.url} controls className="w-full rounded-xl" />
                  )}
                  {m.type === 'audio' && <audio src={m.url} controls className="w-full" />}
                  {m.type === 'file' && (
                    <a href={m.url} target="_blank" rel="noopener noreferrer" className="btn btn-outline inline-flex">
                      Download attachment
                    </a>
                  )}
                  {m.caption && (
                    <figcaption className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
                      {m.caption}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          )}
        </motion.div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 mt-10 py-6 border-y border-gray-200 dark:border-gray-700">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 font-medium transition-colors ${
              liked ? 'text-accent-500' : 'text-gray-600 dark:text-gray-400 hover:text-accent-500'
            }`}
          >
            <Heart size={20} className={liked ? 'fill-accent-500' : ''} /> {likeCount} {likeCount === 1 ? 'Like' : 'Likes'}
          </button>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 dark:text-gray-400 mr-1">Share:</span>
            <a aria-label="Share on Facebook" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors">
              <Facebook size={18} />
            </a>
            <a aria-label="Share on X" href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${shareText}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors">
              <Twitter size={18} />
            </a>
            <a aria-label="Share on LinkedIn" href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors">
              <Linkedin size={18} />
            </a>
            <button aria-label="Copy link" onClick={copyLink} className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors">
              {copied ? <Check size={18} className="text-secondary-500" /> : <Link2 size={18} />}
            </button>
          </div>
        </div>

        {/* Comments */}
        <section className="mt-10">
          <h3 className="text-2xl font-heading font-bold mb-6 flex items-center gap-2">
            <MessageCircle size={22} /> Comments ({comments.length})
          </h3>

          {isAuthenticated ? (
            <form onSubmit={handleComment} className="mb-8">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows={3}
                placeholder="Share your thoughts..."
                className="input resize-none mb-3"
              />
              <button type="submit" disabled={posting} className="btn btn-primary inline-flex items-center gap-2">
                {posting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />} Post Comment
              </button>
            </form>
          ) : (
            <p className="mb-8 text-gray-600 dark:text-gray-400">
              <Link to="/login" className="text-primary-600 dark:text-primary-400 font-medium">Sign in</Link> to like and comment.
            </p>
          )}

          <div className="space-y-5">
            {comments.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">Be the first to comment.</p>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="card p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white font-bold text-sm">
                      {c.authorName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{c.authorName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(c.createdAt)}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{c.content}</p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </article>
  );
};

export default BlogDetailPage;
