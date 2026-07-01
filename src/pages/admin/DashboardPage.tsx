import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plus, BookOpen, Users, TrendingUp, Wallet, Mail, MessageSquare,
  FileText, Megaphone, Star, Sparkles, Loader2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { formatNaira } from '../../lib/supabaseClient';
import { broadcastBook } from '../../lib/api';

/* eslint-disable @typescript-eslint/no-explicit-any */

type Tab = 'books' | 'blogs' | 'orders' | 'subscribers' | 'messages';

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('books');
  const [loading, setLoading] = useState(true);
  const [books, setBooks] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [broadcasting, setBroadcasting] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [b, bl, o, s, m] = await Promise.all([
      supabase.from('books').select('*, categories(name)').order('created_at', { ascending: false }),
      supabase.from('blogs').select('*').order('created_at', { ascending: false }),
      supabase.from('orders').select('*').order('created_at', { ascending: false }),
      supabase.from('newsletter_subscribers').select('*').order('created_at', { ascending: false }),
      supabase.from('contact_messages').select('*').order('created_at', { ascending: false }),
    ]);
    setBooks(b.data ?? []);
    setBlogs(bl.data ?? []);
    setOrders(o.data ?? []);
    setSubscribers(s.data ?? []);
    setMessages(m.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    document.title = 'Admin Dashboard | KellyInkspired';
    if (!user || user.role !== 'admin') { navigate('/admin'); return; }
    fetchAll();
  }, [user, navigate, fetchAll]);

  const paidOrders = orders.filter((o) => o.status === 'paid');
  const totalSales = paidOrders.reduce((sum, o) => sum + Number(o.total ?? 0), 0);

  // last 6 months sales for the chart
  const monthly = (() => {
    const now = new Date();
    const buckets: { label: string; value: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.push({ label: d.toLocaleString('en-NG', { month: 'short' }), value: 0 });
    }
    paidOrders.forEach((o) => {
      const d = new Date(o.created_at);
      const idx = 5 - (now.getMonth() - d.getMonth() + 12 * (now.getFullYear() - d.getFullYear()));
      if (idx >= 0 && idx < 6) buckets[idx].value += Number(o.total ?? 0);
    });
    return buckets;
  })();
  const maxMonthly = Math.max(...monthly.map((m) => m.value), 1);

  const toggleBook = async (id: string, field: 'is_featured' | 'is_new_release' | 'status', value: any) => {
    await supabase.from('books').update({ [field]: value }).eq('id', id);
    fetchAll();
  };

  const handleBroadcast = async (id: string, status: string) => {
    setBroadcasting(id);
    try {
      await broadcastBook(id, status === 'coming_soon' ? 'coming_soon' : 'new_release');
      alert('Broadcast sent to subscribers.');
    } catch {
      alert('Broadcast failed. Check that the edge function is deployed.');
    } finally {
      setBroadcasting(null);
    }
  };

  const stats = [
    { title: 'Total Sales', value: formatNaira(totalSales), icon: <Wallet className="w-6 h-6" />, color: 'bg-primary-100 text-primary-600 dark:bg-primary-900/40 dark:text-primary-300' },
    { title: 'Paid Orders', value: paidOrders.length, icon: <TrendingUp className="w-6 h-6" />, color: 'bg-secondary-100 text-secondary-600 dark:bg-secondary-900/40 dark:text-secondary-300' },
    { title: 'Books', value: books.length, icon: <BookOpen className="w-6 h-6" />, color: 'bg-accent-100 text-accent-600 dark:bg-accent-900/40 dark:text-accent-300' },
    { title: 'Subscribers', value: subscribers.length, icon: <Users className="w-6 h-6" />, color: 'bg-cream-200 text-primary-700 dark:bg-gray-700 dark:text-gray-200' },
  ];

  const tabs: { id: Tab; label: string; icon: JSX.Element }[] = [
    { id: 'books', label: 'Books', icon: <BookOpen size={16} /> },
    { id: 'blogs', label: 'Blog', icon: <FileText size={16} /> },
    { id: 'orders', label: 'Orders', icon: <Wallet size={16} /> },
    { id: 'subscribers', label: 'Subscribers', icon: <Mail size={16} /> },
    { id: 'messages', label: 'Messages', icon: <MessageSquare size={16} /> },
  ];

  const fmtDate = (d: string) => (d ? new Date(d).toLocaleDateString('en-NG') : '');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="pt-12 pb-20">
      <div className="container-custom">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <h1 className="text-3xl font-heading font-bold">Admin Dashboard</h1>
          <div className="flex gap-3">
            <button onClick={() => navigate('/admin/blogs/new')} className="btn btn-outline flex items-center gap-2">
              <Plus size={18} /> New Post
            </button>
            <button onClick={() => navigate('/admin/books/new')} className="btn btn-primary flex items-center gap-2">
              <Plus size={18} /> New Book
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((s, i) => (
            <motion.div key={s.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="card p-6">
              <div className="flex items-center">
                <div className={`${s.color} p-3 rounded-lg`}>{s.icon}</div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{s.title}</h3>
                  <p className="text-xl font-semibold">{s.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Sales chart */}
        <div className="card p-6 mb-8">
          <h2 className="text-lg font-heading font-bold mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-primary-500" /> Sales (last 6 months)
          </h2>
          <div className="flex items-end justify-between gap-3 h-48">
            {monthly.map((m) => (
              <div key={m.label} className="flex flex-col items-center flex-1">
                <div className="w-full flex items-end justify-center h-40">
                  <div
                    className="w-full max-w-[40px] rounded-t-lg bg-gradient-to-t from-primary-500 to-accent-400 transition-all"
                    style={{ height: `${(m.value / maxMonthly) * 100}%`, minHeight: m.value > 0 ? '6px' : '2px' }}
                    title={formatNaira(m.value)}
                  />
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-2">{m.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map((t) => (
            <button
              key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t.id ? 'bg-primary-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-gray-700'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <div className="card overflow-hidden">
          {loading ? (
            <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-primary-500" size={28} /></div>
          ) : tab === 'books' ? (
            books.length === 0 ? <Empty text="No books yet. Add your first title." /> : (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {books.map((b) => (
                  <div key={b.id} className="p-5 flex flex-wrap items-center gap-4">
                    <img src={b.cover_url || ''} alt={b.title} className="w-14 h-14 rounded object-cover bg-gray-100 dark:bg-gray-700" />
                    <div className="flex-1 min-w-[160px]">
                      <p className="font-semibold">{b.title}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatNaira(Number(b.price ?? 0))} · <span className="capitalize">{b.status?.replace('_', ' ')}</span>
                      </p>
                    </div>
                    <button onClick={() => toggleBook(b.id, 'is_featured', !b.is_featured)} title="Featured"
                      className={`p-2 rounded-lg ${b.is_featured ? 'text-secondary-500' : 'text-gray-400 hover:text-secondary-500'}`}>
                      <Star size={18} className={b.is_featured ? 'fill-secondary-500' : ''} />
                    </button>
                    <button onClick={() => toggleBook(b.id, 'is_new_release', !b.is_new_release)} title="New release"
                      className={`p-2 rounded-lg ${b.is_new_release ? 'text-accent-500' : 'text-gray-400 hover:text-accent-500'}`}>
                      <Sparkles size={18} />
                    </button>
                    <button onClick={() => handleBroadcast(b.id, b.status)} disabled={broadcasting === b.id}
                      className="btn btn-outline text-xs flex items-center gap-1 py-1.5">
                      {broadcasting === b.id ? <Loader2 className="animate-spin" size={14} /> : <Megaphone size={14} />} Notify
                    </button>
                    <button onClick={() => navigate(`/admin/books/${b.id}/edit`)} className="text-primary-600 dark:text-primary-400 text-sm font-medium">Edit</button>
                  </div>
                ))}
              </div>
            )
          ) : tab === 'blogs' ? (
            blogs.length === 0 ? <Empty text="No blog posts yet." /> : (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {blogs.map((b) => (
                  <div key={b.id} className="p-5 flex items-center gap-4">
                    <div className="flex-1">
                      <p className="font-semibold">{b.title}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{b.status} · {fmtDate(b.created_at)}</p>
                    </div>
                    <button onClick={() => navigate(`/admin/blogs/${b.id}/edit`)} className="text-primary-600 dark:text-primary-400 text-sm font-medium">Edit</button>
                  </div>
                ))}
              </div>
            )
          ) : tab === 'orders' ? (
            orders.length === 0 ? <Empty text="No orders yet." /> : (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {orders.map((o) => (
                  <div key={o.id} className="p-5 flex items-center gap-4">
                    <div className="flex-1">
                      <p className="font-semibold">{formatNaira(Number(o.total ?? 0))}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{o.email ?? ''} · {fmtDate(o.created_at)}</p>
                    </div>
                    <span className={`badge ${o.status === 'paid' ? 'badge-new' : 'badge-soon'} capitalize`}>{o.status}</span>
                  </div>
                ))}
              </div>
            )
          ) : tab === 'subscribers' ? (
            subscribers.length === 0 ? <Empty text="No subscribers yet." /> : (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {subscribers.map((s) => (
                  <div key={s.id} className="p-4 flex items-center justify-between">
                    <span>{s.email}</span>
                    <span className="text-sm text-gray-400">{fmtDate(s.created_at)}</span>
                  </div>
                ))}
              </div>
            )
          ) : (
            messages.length === 0 ? <Empty text="No messages yet." /> : (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {messages.map((m) => (
                  <div key={m.id} className="p-5">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold">{m.name} <span className="text-sm text-gray-400 font-normal">· {m.email}</span></p>
                      <span className="text-sm text-gray-400">{fmtDate(m.created_at)}</span>
                    </div>
                    {m.subject && <p className="text-sm font-medium text-primary-600 dark:text-primary-400">{m.subject}</p>}
                    <p className="text-gray-600 dark:text-gray-300 mt-1 whitespace-pre-line">{m.message}</p>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </motion.div>
  );
};

const Empty = ({ text }: { text: string }) => (
  <div className="p-10 text-center text-gray-500 dark:text-gray-400">{text}</div>
);

export default DashboardPage;
