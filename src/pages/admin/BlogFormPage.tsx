import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Trash2, Upload, Loader2, X, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import type { BlogMedia } from '../../types';

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

interface BlogForm {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_url: string;
  media: BlogMedia[];
  status: 'published' | 'draft';
}

const empty: BlogForm = {
  title: '', slug: '', excerpt: '', content: '', cover_url: '', media: [], status: 'published',
};

const mediaKind = (file: File): BlogMedia['type'] => {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  if (file.type.startsWith('audio/')) return 'audio';
  return 'file';
};

const BlogFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState<BlogForm>(empty);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [error, setError] = useState('');

  const fetchBlog = useCallback(async () => {
    const { data, error } = await supabase.from('blogs').select('*').eq('id', id).single();
    if (error) { setError('Failed to load post'); return; }
    if (data) {
      setForm({
        title: data.title ?? '', slug: data.slug ?? '', excerpt: data.excerpt ?? '',
        content: data.content ?? '', cover_url: data.cover_url ?? '',
        media: Array.isArray(data.media) ? data.media : [], status: data.status ?? 'published',
      });
    }
  }, [id]);

  useEffect(() => {
    document.title = id ? 'Edit Post | KellyInkspired' : 'New Post | KellyInkspired';
    if (!user || user.role !== 'admin') { navigate('/admin'); return; }
    if (id) fetchBlog();
  }, [id, user, navigate, fetchBlog]);

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((p) => {
      const next = { ...p, [name]: value };
      if (name === 'title' && !id && (!p.slug || p.slug === slugify(p.title))) {
        next.slug = slugify(value);
      }
      return next;
    });
  };

  const uploadTo = async (file: File) => {
    const path = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    const { error } = await supabase.storage.from('blog-media').upload(path, file, { upsert: true });
    if (error) throw error;
    return supabase.storage.from('blog-media').getPublicUrl(path).data.publicUrl;
  };

  const handleCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true); setError('');
    try { const url = await uploadTo(file); setForm((p) => ({ ...p, cover_url: url })); }
    catch { setError('Cover upload failed.'); }
    finally { setUploadingCover(false); }
  };

  const handleMedia = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploadingMedia(true); setError('');
    try {
      const uploaded: BlogMedia[] = [];
      for (const f of files) {
        const url = await uploadTo(f);
        uploaded.push({ type: mediaKind(f), url, caption: '' });
      }
      setForm((p) => ({ ...p, media: [...p.media, ...uploaded] }));
    } catch { setError('Media upload failed.'); }
    finally { setUploadingMedia(false); }
  };

  const updateCaption = (i: number, caption: string) =>
    setForm((p) => ({ ...p, media: p.media.map((m, idx) => (idx === i ? { ...m, caption } : m)) }));

  const removeMedia = (i: number) =>
    setForm((p) => ({ ...p, media: p.media.filter((_, idx) => idx !== i) }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setIsLoading(true);
    try {
      const payload = {
        title: form.title,
        slug: form.slug || slugify(form.title),
        excerpt: form.excerpt,
        content: form.content,
        cover_url: form.cover_url,
        media: form.media,
        status: form.status,
        author_id: user?.id ?? null,
        published_at: form.status === 'published' ? new Date().toISOString() : null,
      };
      if (id) {
        const { error } = await supabase.from('blogs').update(payload).eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('blogs').insert([payload]);
        if (error) throw error;
      }
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save post');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !window.confirm('Delete this post permanently?')) return;
    setIsLoading(true);
    try {
      const { error } = await supabase.from('blogs').delete().eq('id', id);
      if (error) throw error;
      navigate('/admin/dashboard');
    } catch { setError('Failed to delete post'); }
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
            <h1 className="text-2xl font-heading font-bold">{id ? 'Edit Post' : 'New Post'}</h1>
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
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Excerpt</label>
              <textarea name="excerpt" value={form.excerpt} onChange={onChange} rows={2} className="input resize-none" placeholder="Short summary shown on the blog list" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Content</label>
              <textarea name="content" value={form.content} onChange={onChange} rows={10} className="input resize-none" required placeholder="Write your post… (line breaks are preserved)" />
            </div>

            {/* Cover */}
            <div>
              <label className="block text-sm font-medium mb-1.5">Cover Image</label>
              <div className="flex items-center gap-3">
                <label className="btn btn-outline cursor-pointer flex items-center gap-2">
                  {uploadingCover ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />} Upload
                  <input type="file" accept="image/*" onChange={handleCover} className="hidden" />
                </label>
                {form.cover_url && <img src={form.cover_url} alt="cover" className="h-12 w-12 rounded object-cover" />}
              </div>
            </div>

            {/* Media gallery */}
            <div>
              <label className="block text-sm font-medium mb-1.5">Media (images, video, audio, flyers, files)</label>
              <label className="btn btn-outline cursor-pointer flex items-center gap-2 w-fit">
                {uploadingMedia ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />} Add media
                <input type="file" multiple onChange={handleMedia} className="hidden" />
              </label>
              {form.media.length > 0 && (
                <div className="mt-4 space-y-3">
                  {form.media.map((m, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                      <span className="badge badge-soon capitalize">{m.type}</span>
                      <input
                        value={m.caption ?? ''} onChange={(e) => updateCaption(i, e.target.value)}
                        placeholder="Caption (optional)" className="input flex-grow"
                      />
                      <button type="button" onClick={() => removeMedia(i)} className="text-red-500 p-1">
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Status</label>
              <select name="status" value={form.status} onChange={onChange} className="input max-w-xs">
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            <div className="flex justify-end">
              <button type="submit" disabled={isLoading} className="btn btn-primary flex items-center gap-2">
                {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                {isLoading ? 'Saving...' : 'Save Post'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default BlogFormPage;
