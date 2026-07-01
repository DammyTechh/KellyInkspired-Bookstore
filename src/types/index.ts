export interface Book {
  id: string;
  slug: string;
  title: string;
  description: string;
  coverUrl: string;
  price: number;
  releaseDate: string;
  featured: boolean;
  isNewRelease: boolean;
  status: 'published' | 'coming_soon' | 'draft';
  details: {
    pages: number;
    language: string;
    isbn: string;
    category: string;
  };
  downloadUrl?: string;
}

export interface BlogMedia {
  type: 'image' | 'video' | 'audio' | 'file';
  url: string;
  caption?: string;
}

export interface Blog {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverUrl: string;
  media: BlogMedia[];
  status: 'published' | 'draft';
  authorName: string;
  publishedAt: string;
  likeCount: number;
  commentCount: number;
}

export interface BlogComment {
  id: string;
  blogId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
}

export interface CartItem {
  book: Book;
  quantity: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export type ThemeMode = 'light' | 'dark';
