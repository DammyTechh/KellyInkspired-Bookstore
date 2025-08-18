export interface Book {
  id: string;
  title: string;
  description: string;
  coverUrl: string;
  price: number;
  releaseDate: string;
  featured: boolean;
  details: {
    pages: number;
    language: string;
    isbn: string;
    category: string;
  };
  downloadUrl?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

export interface CartItem {
  book: Book;
  quantity: number;
}

export type ThemeMode = 'light' | 'dark';