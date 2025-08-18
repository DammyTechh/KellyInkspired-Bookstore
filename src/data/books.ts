import { Book } from '../types';

export const books: Book[] = [
  {
    id: '1',
    title: 'Walking in Divine Wisdom',
    description: 'A profound exploration of how to navigate life\'s challenges with spiritual guidance and divine wisdom. This book offers practical insights for finding purpose and direction in a complex world.',
    coverUrl: 'https://images.pexels.com/photos/3747139/pexels-photo-3747139.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    price: 19.99,
    releaseDate: '2023-04-15',
    featured: true,
    details: {
      pages: 248,
      language: 'English',
      isbn: '978-1234567890',
      category: 'Spirituality',
    },
  },
  {
    id: '2',
    title: 'Discovering Your Purpose',
    description: 'A transformative journey to uncovering your unique purpose and calling in life. Through powerful storytelling and practical exercises, this book guides readers toward living a more meaningful and intentional life.',
    coverUrl: 'https://images.pexels.com/photos/4170629/pexels-photo-4170629.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    price: 22.95,
    releaseDate: '2022-07-10',
    featured: true,
    details: {
      pages: 312,
      language: 'English',
      isbn: '978-0987654321',
      category: 'Self-Help',
    },
  },
  {
    id: '3',
    title: 'Faith Beyond Borders',
    description: 'An inspiring account of how faith can transcend cultural, social, and personal boundaries to create positive change in the world. This book combines personal stories with theological insights.',
    coverUrl: 'https://images.pexels.com/photos/4153146/pexels-photo-4153146.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    price: 18.50,
    releaseDate: '2021-11-22',
    featured: false,
    details: {
      pages: 186,
      language: 'English',
      isbn: '978-2468013579',
      category: 'Spirituality',
    },
  },
  {
    id: '4',
    title: 'Teenage Faith: A Guide for Young Hearts',
    description: 'Written specifically for teenagers navigating the complexities of faith in modern times. This compassionate guide addresses the unique challenges and questions young people face in their spiritual journey.',
    coverUrl: 'https://images.pexels.com/photos/3771089/pexels-photo-3771089.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    price: 16.99,
    releaseDate: '2024-01-30',
    featured: true,
    details: {
      pages: 224,
      language: 'English',
      isbn: '978-1357924680',
      category: 'Teen & Young Adult',
    },
  },
  {
    id: '5',
    title: 'Stories of Grace',
    description: 'A collection of inspiring true stories that illustrate the transformative power of grace in everyday life. Each narrative reveals how ordinary people experienced extraordinary moments of divine intervention.',
    coverUrl: 'https://images.pexels.com/photos/8349837/pexels-photo-8349837.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    price: 21.50,
    releaseDate: '2022-03-18',
    featured: false,
    details: {
      pages: 276,
      language: 'English',
      isbn: '978-0246813579',
      category: 'Inspirational',
    },
  }
];

export const getFeaturedBooks = (): Book[] => {
  return books.filter(book => book.featured);
};

export const getBookById = (id: string): Book | undefined => {
  return books.find(book => book.id === id);
};