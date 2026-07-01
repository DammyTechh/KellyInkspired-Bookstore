import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Trash2, Upload, Loader2, Megaphone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { getCategories, broadcastBook } from '../../lib/api';
import type { Category } from '../../types';

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

interface BookForm {
  title: string;
  slug: string;
  description: string;
  cover_url: string;
  price: number;
  release_date: string;
  pages: number;
  language: string;
  isbn: string;
  category_id: string;
  download_url: string;
  status: 'published' | 'coming_soon' | 'draft';
  is_featured: boolean;
  is_new_release: boolean;
}

const empty: BookForm = {
  title: '', slug: '', description: '', cover_url: '', price: 0,
  release_date: new Date().toISOString().split('T')[0],
  pages: 0, language: 'English', isbn: '', category_id: '', download_url: '',
  status: 'published', is_featured: false, is_new_release: false,
};

const BookFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState<BookForm>(empty);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [error, setError] = useState('');
  const [notify, setNotify] = useState(false);

  const fetchBook = useCallback(async () => {
    const { data, error } = await supabase.from('books').select('*').eq('id', id).single();
    if (error) { setError('Failed to load book details'); return; }
    if (data) {
      setForm({
        title: data.title ?? '', slug: data.slug ?? '', description: data.description ?? '',
        cover_url: data.cover_url ?? '', price: Number(data.price ?? 0),
        release_date: data.release_date ?? empty.release_date,
        pages: data.pages ?? 0, language: data.language ?? 'English', isbn: data.isbn ?? '',
        category_id: data.category_id ?? '', download_url: data.download_url ?? '',
        status: data.status ?? 'published', is_featured: !!data.is_featured,
        is_new_release: !!data.is_new_release,
      });
    }
  }, [id]);

  useEffect(() => {
    document.title = id ? 'Edit Book | KellyInkspired' : 'Add New Book | KellyInkspired';
    if (!user || user.role !== 'admin') { navigate('/admin'); return; }
    getCategories().then(setCategories).catch(() => setCategories([]));
    if (id) fetchBook();
  }, [id, user, navigate, fetchBook]);

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    const v = type === 'number' ? Number(value) : value;
    setForm((p) => {
      const next = { ...p, [name]: v };
      if (name === 'title' && !id && (!p.slug || p.slug === slugify(p.title))) {
        next.slug = slugify(value);
      }
      return next;
    });
  };

  const onCheck = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.checked }));

  const uploadTo = async (bucket: string, file: File) => {
    const path = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  };

  const handleCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true); setError('');
    try {
      const url = await uploadTo('book-covers', file);
      setForm((p) => ({ ...p, cover_url: url }));
    } catch { setError('Cover upload failed.'); }
    finally { setUploadingCover(false); }
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFile(true); setError('');
    try {
      // book-files is a private bucket — store the path; signed URLs are issued at delivery
      const path = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
      const { error } = await supabase.storage.from('book-files').upload(path, file, { upsert: true });
      if (error) throw error;
      setForm((p) => ({ ...p, download_url: path }));
    } catch { setError('File upload failed.'); }
    finally { setUploadingFile(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setIsLoading(true);
    try {
      const payload = {
        title: form.title,
        slug: form.slug || slugify(form.title),
        description: form.description,
        cover_url: form.cover_url,
        price: Number(form.price),
        release_date: form.release_date,
        pages: Number(form.pages),
        language: form.language,
        isbn: form.isbn,
        category_id: form.category_id || null,
        download_url: form.download_url || null,
        status: form.status,
        is_featured: form.is_featured,
        is_new_release: form.is_new_release,
      };

      let bookId = id;
      if (id) {
        const { error } = await supabase.from('books').update(payload).eq('id', id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('books').insert([payload]).select('id').single();
        if (error) throw error;
        bookId = data.id;
      }

      if (notify && bookId) {
        const type = form.status === 'coming_soon' ? 'coming_soon' : 'new_release';
        try { await broadcastBook(bookId, type); } catch { /* non-blocking */ }
      }

      navigate('/admin/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save book');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !window.confirm('Delete this book permanently?')) return;
    setIsLoading(true);
    try {
      const { error } = await supabase.from('books').delete().eq('id', id);
      if (error) throw error;
      navigate('/admin/dashboard');
    } catch { setError('Failed to delete book'); }
    finally { setIsLoading(false); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="pt-12 pb-20">
      <div className="container-custom max-w-4xl">
        <button onClick={() => navigate('/admin/dashboard')} className="mb-8 flex items-center text-gray-600 dark:text-gray-400 hover:text-primary-600">
          <ArrowLeft size={20} className="mr-2" /> Back to Dashboard
        </button>

        <div className="card p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-heading font-bold">{id ? 'Edit Book' : 'Add New Book'}</h1>
            {id && (
              <button onClick={handleDelete} disabled={isLoading} className="btn bg-red-500 hover:bg-red-600 text-white flex items-center">
                <Trash2 size={18} className="mr-2" /> Delete
              </button>
            )}
          </div>

          {error && <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1.5">Title</label>
                <input name="title" value={form.title} onChange={onChange} className="input" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Slug</label>
                <input name="slug" value={form.slug} onChange={onChange} className="input" required />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1.5">Description</label>
                <textarea name="description" value={form.description} onChange={onChange} rows={4} className="input resize-none" required />
              </div>

              {/* Cover upload */}
              <div>
                <label className="block text-sm font-medium mb-1.5">Cover Image</label>
                <div className="flex items-center gap-3">
                  <label className="btn btn-outline cursor-pointer flex items-center gap-2">
                    {uploadingCover ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                    Upload
                    <input type="file" accept="image/*" onChange={handleCover} className="hidden" />
                  </label>
                  {form.cover_url && <img src={form.cover_url} alt="cover" className="h-12 w-12 rounded object-cover" />}
                </div>
                <input name="cover_url" value={form.cover_url} onChange={onChange} placeholder="…or paste a URL" className="input mt-2" />
              </div>

              {/* Book file upload */}
              <div>
                <label className="block text-sm font-medium mb-1.5">Book File (private)</label>
                <label className="btn btn-outline cursor-pointer flex items-center gap-2 w-fit">
                  {uploadingFile ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                  Upload PDF/ePub
                  <input type="file" accept=".pdf,.epub,.mobi" onChange={handleFile} className="hidden" />
                </label>
                {form.download_url && <p className="text-xs text-gray-500 mt-1 break-all">Stored: {form.download_url}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Price (₦)</label>
                <input type="number" name="price" value={form.price} onChange={onChange} min="0" step="1" className="input" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Release Date</label>
                <input type="date" name="release_date" value={form.release_date} onChange={onChange} className="input" required />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Category</label>
                <select name="category_id" value={form.category_id} onChange={onChange} className="input">
                  <option value="">— Select —</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Status</label>
                <select name="status" value={form.status} onChange={onChange} className="input">
                  <option value="published">Published</option>
                  <option value="coming_soon">Coming Soon</option>
                  <option value="draft">Draft</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Pages</label>
                <input type="number" name="pages" value={form.pages} onChange={onChange} min="0" className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Language</label>
                <input name="language" value={form.language} onChange={onChange} className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">ISBN</label>
                <input name="isbn" value={form.isbn} onChange={onChange} className="input" />
              </div>
            </div>

            <div className="flex flex-wrap gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="is_featured" checked={form.is_featured} onChange={onCheck} className="w-4 h-4 accent-primary-500" />
                <span className="text-sm font-medium">Featured</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="is_new_release" checked={form.is_new_release} onChange={onCheck} className="w-4 h-4 accent-accent-500" />
                <span className="text-sm font-medium">New Release (hero banner)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} className="w-4 h-4 accent-secondary-500" />
                <span className="text-sm font-medium flex items-center gap-1"><Megaphone size={15} /> Email all subscribers</span>
              </label>
            </div>

            <div className="flex justify-end">
              <button type="submit" disabled={isLoading} className="btn btn-primary flex items-center gap-2">
                {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                {isLoading ? 'Saving...' : 'Save Book'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default BookFormPage;
