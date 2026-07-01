import { supabase } from './supabaseClient';
import type { Book, Blog, BlogComment, Category } from '../types';

/* ── Row → app-shape mappers ─────────────────────────────────────────── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapBook(row: any): Book {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description ?? '',
    coverUrl: row.cover_url ?? '',
    price: Number(row.price ?? 0),
    releaseDate: row.release_date ?? '',
    featured: !!row.is_featured,
    isNewRelease: !!row.is_new_release,
    status: row.status,
    details: {
      pages: row.pages ?? 0,
      language: row.language ?? 'English',
      isbn: row.isbn ?? '',
      category: row.categories?.name ?? '',
    },
    downloadUrl: row.download_url ?? undefined,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapBlog(row: any): Blog {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt ?? '',
    content: row.content ?? '',
    coverUrl: row.cover_url ?? '',
    media: Array.isArray(row.media) ? row.media : [],
    status: row.status,
    authorName: row.profiles?.full_name ?? 'KellyInkspired',
    publishedAt: row.published_at ?? row.created_at,
    likeCount: row.blog_likes?.[0]?.count ?? 0,
    commentCount: row.blog_comments?.[0]?.count ?? 0,
  };
}

const BOOK_SELECT = '*, categories(name)';

/* ── Books ───────────────────────────────────────────────────────────── */
export async function getPublishedBooks(): Promise<Book[]> {
  const { data, error } = await supabase
    .from('books').select(BOOK_SELECT)
    .eq('status', 'published')
    .order('release_date', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapBook);
}

export async function getNewReleases(): Promise<Book[]> {
  const { data, error } = await supabase
    .from('books').select(BOOK_SELECT)
    .eq('status', 'published').eq('is_new_release', true)
    .order('release_date', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapBook);
}

export async function getComingSoon(): Promise<Book[]> {
  const { data, error } = await supabase
    .from('books').select(BOOK_SELECT)
    .eq('status', 'coming_soon')
    .order('release_date', { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapBook);
}

export async function getFeaturedBooks(): Promise<Book[]> {
  const { data, error } = await supabase
    .from('books').select(BOOK_SELECT)
    .eq('status', 'published').eq('is_featured', true)
    .order('release_date', { ascending: false }).limit(6);
  if (error) throw error;
  return (data ?? []).map(mapBook);
}

export async function getBookById(id: string): Promise<Book | null> {
  const { data, error } = await supabase
    .from('books').select(BOOK_SELECT).eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? mapBook(data) : null;
}

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase.from('categories').select('*').order('name');
  if (error) throw error;
  return data ?? [];
}

/* ── Blogs ───────────────────────────────────────────────────────────── */
export async function getBlogs(): Promise<Blog[]> {
  const { data, error } = await supabase
    .from('blogs')
    .select('*, profiles(full_name), blog_likes(count), blog_comments(count)')
    .eq('status', 'published')
    .order('published_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapBlog);
}

export async function getBlogBySlug(slug: string): Promise<Blog | null> {
  const { data, error } = await supabase
    .from('blogs')
    .select('*, profiles(full_name), blog_likes(count), blog_comments(count)')
    .eq('slug', slug).maybeSingle();
  if (error) throw error;
  return data ? mapBlog(data) : null;
}

export async function getComments(blogId: string): Promise<BlogComment[]> {
  const { data, error } = await supabase
    .from('blog_comments').select('*').eq('blog_id', blogId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((r: any) => ({
    id: r.id, blogId: r.blog_id, authorName: r.author_name,
    content: r.content, createdAt: r.created_at,
  }));
}

export async function addComment(blogId: string, userId: string, authorName: string, content: string) {
  const { error } = await supabase.from('blog_comments')
    .insert({ blog_id: blogId, user_id: userId, author_name: authorName, content });
  if (error) throw error;
}

export async function toggleLike(blogId: string, userId: string) {
  const { data: existing } = await supabase.from('blog_likes')
    .select('id').eq('blog_id', blogId).eq('user_id', userId).maybeSingle();
  if (existing) {
    await supabase.from('blog_likes').delete().eq('id', existing.id);
    return false;
  }
  await supabase.from('blog_likes').insert({ blog_id: blogId, user_id: userId });
  return true;
}

/* ── Newsletter & contact (via edge functions) ───────────────────────── */
async function invoke(fn: string, body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke(fn, { body });
  if (error) throw error;
  return data;
}

export const subscribeNewsletter = (email: string, name?: string) =>
  invoke('subscribe-newsletter', { email, name });

export const sendContactMessage = (payload: {
  name: string; email: string; subject?: string; message: string;
}) => invoke('contact', payload);

export const broadcastBook = (bookId: string, type: 'new_release' | 'coming_soon') =>
  invoke('notify-new-release', { bookId, type });

/* ── Payments (Paystack) ─────────────────────────────────────────────── */
export async function startPaystackCheckout(
  items: { book_id: string; title: string; price: number; quantity: number }[],
  callbackUrl: string,
) {
  return invoke('paystack-init', { items, callbackUrl }) as Promise<{
    authorization_url: string; reference: string; order_id: string;
  }>;
}

export const verifyPaystack = (reference: string) =>
  invoke('paystack-verify', { reference }) as Promise<{ status: string }>;

/* ── Payments (Opay) ─────────────────────────────────────────────────── */
export async function startOpayCheckout(
  items: { book_id: string; title: string; price: number; quantity: number }[],
  callbackUrl: string,
) {
  return invoke('opay-init', { items, callbackUrl }) as Promise<{
    authorization_url: string; reference: string; order_id: string;
  }>;
}

export const verifyOpay = (reference: string) =>
  invoke('opay-verify', { reference }) as Promise<{ status: string }>;
