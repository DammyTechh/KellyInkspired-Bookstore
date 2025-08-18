# 📚 KellyInkspired Bookstore

A modern, full-stack web application for selling faith-based books by award-winning author **Awokunle M. Kelechi**. Built with React, TypeScript, Supabase, and integrated with Paystack for Nigerian payments.

![KellyInkspired Banner](https://imgur.com/FqlGSpU.jpg)

## 🌟 Features

### 🛍️ **Customer Features**
- **Browse Books**: Explore a curated collection of faith-based books
- **Search & Filter**: Find books by title, description, or category
- **Shopping Cart**: Add multiple books and manage quantities
- **Secure Checkout**: Pay with Paystack (Nigerian payment gateway)
- **User Authentication**: Register, login with email verification
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Dark/Light Theme**: Toggle between themes for better user experience

### 👨‍💼 **Admin Features**
- **Complete Dashboard**: Manage books, view statistics, and user data
- **Book Management**: Add, edit, delete, and feature books
- **Price Management**: Set prices in USD, display in Nigerian Naira
- **User Management**: View registered users and their roles
- **Real-time Updates**: Changes reflect immediately across the platform
- **Analytics**: Track total books, featured books, revenue, and users

### 💳 **Payment Integration**
- **Paystack Integration**: Secure Nigerian payment processing
- **Currency Conversion**: Automatic USD to NGN conversion
- **Digital Delivery**: Books delivered via email after purchase
- **Transaction Security**: Secure payment handling with reference tracking

## 🚀 Tech Stack

### **Frontend**
- **React 18** - Modern React with hooks and context
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **React Router** - Client-side routing
- **Lucide React** - Beautiful icons

### **Backend & Database**
- **Supabase** - Backend-as-a-Service
- **PostgreSQL** - Robust relational database
- **Row Level Security** - Database-level security
- **Real-time Subscriptions** - Live data updates

### **Payment & Email**
- **Paystack** - Nigerian payment gateway
- **SMTP Integration** - Email verification and notifications

## 📋 Prerequisites

Before running this project, make sure you have:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Supabase Account** ([supabase.com](https://supabase.com))
- **Paystack Account** ([paystack.com](https://paystack.com))

## 🛠️ Installation & Setup

### 1. **Clone the Repository**
```bash
git clone https://github.com/dammytechh/kellyinkspired-bookstore.git
cd kellyinkspired-bookstore
```

### 2. **Install Dependencies**
```bash
npm install
```

### 3. **Environment Configuration**
Create a `.env` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Admin Configuration
VITE_ADMIN_CODE=your_admin_registration_code

# Email Configuration (Optional)
VITE_SMTP_URL=smtp.gmail.com
VITE_SMTP_KEY=your_smtp_key
```

### 4. **Supabase Setup**

#### **Database Setup**
The project includes migration files that will set up your database schema automatically. In your Supabase dashboard:

1. Go to **SQL Editor**
2. Run the migration files in order (they're already included in the project)
3. Enable **Row Level Security** on all tables

#### **Authentication Setup**
1. Go to **Authentication** → **Settings**
2. Enable **Email Confirmations**
3. Configure **SMTP Settings** for email verification
4. Set **Site URL** to your domain (for production)

#### **Storage Setup** (Optional)
If you plan to store book PDFs:
1. Go to **Storage**
2. Create a bucket named `books`
3. Set appropriate policies for file access

### 5. **Paystack Configuration**

1. **Get Paystack Keys**:
   - Sign up at [paystack.com](https://paystack.com)
   - Get your **Public Key** from the dashboard
   - For production, get your **Live Public Key**

2. **Update Paystack Configuration**:
   ```typescript
   // In src/lib/paystack.ts
   const PAYSTACK_PUBLIC_KEY = 'pk_test_your_actual_paystack_public_key';
   ```

### 6. **Start Development Server**
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🔐 Admin Access

### **Default Admin Credentials**
- **URL**: `http://localhost:5173/admin`
- **Email**: `admin@kellyinkspired.com`
- **Password**: `KellyAdmin2025!`

### **Admin Registration**
For additional admin users:
- Use the admin registration code: `20251998`
- Access: `http://localhost:5173/admin/register`

## 📖 Usage Guide

### **For Customers**

1. **Browse Books**: Visit the homepage or books page
2. **Create Account**: Register with email verification
3. **Add to Cart**: Select books and add to shopping cart
4. **Checkout**: Complete purchase with Paystack
5. **Receive Books**: Digital books delivered via email

### **For Admins**

1. **Login**: Access admin dashboard at `/admin`
2. **Add Books**: Use the "Add New Book" button
3. **Manage Books**: Edit, delete, or feature books
4. **View Analytics**: Monitor sales and user statistics
5. **User Management**: View registered users

### **Book Management**
When adding books, provide:
- **Title** and **Description**
- **Cover Image URL** (use Pexels or similar)
- **Price in USD** (displays as NGN to customers)
- **Category**, **Pages**, **ISBN**
- **Download URL** (for digital delivery)

## 🏗️ Project Structure

```
kellyinkspired-bookstore/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── common/         # Common components (buttons, modals)
│   │   ├── home/           # Homepage components
│   │   ├── books/          # Book-related components
│   │   └── layout/         # Layout components (header, footer)
│   ├── context/            # React context providers
│   │   ├── AuthContext.tsx # Authentication state
│   │   ├── CartContext.tsx # Shopping cart state
│   │   └── ThemeContext.tsx# Theme management
│   ├── pages/              # Page components
│   │   ├── admin/          # Admin pages
│   │   ├── HomePage.tsx    # Landing page
│   │   ├── BooksPage.tsx   # Books catalog
│   │   └── CheckoutPage.tsx# Payment page
│   ├── lib/                # Utility libraries
│   │   ├── supabaseClient.ts# Supabase configuration
│   │   └── paystack.ts     # Paystack integration
│   ├── types/              # TypeScript type definitions
│   └── data/               # Static data and helpers
├── supabase/
│   └── migrations/         # Database migration files
├── public/                 # Static assets
└── package.json           # Project dependencies
```

## 🔒 Security Features

- **Row Level Security (RLS)**: Database-level access control
- **Email Verification**: Required for user registration
- **Role-based Access**: Admin and user role separation
- **Secure Payments**: Paystack handles sensitive payment data
- **Environment Variables**: Sensitive data stored securely

## 🚀 Deployment

### **Frontend Deployment**

#### **Vercel (Recommended)**
```bash
npm install -g vercel
vercel --prod
```

#### **Netlify**
```bash
npm run build
# Upload dist/ folder to Netlify
```

### **Environment Variables for Production**
Update your production environment with:
- Production Supabase URL and keys
- Live Paystack public key
- Production SMTP settings

### **Supabase Production Setup**
1. **Database**: Ensure all migrations are applied
2. **Authentication**: Configure production email settings
3. **RLS Policies**: Verify all security policies are active
4. **API Keys**: Use production keys in environment variables

## 📧 Email Configuration

### **SMTP Setup**
For email verification and book delivery:

1. **Gmail SMTP**:
   ```env
   VITE_SMTP_URL=smtp.gmail.com
   VITE_SMTP_KEY=your_app_password
   ```

2. **Supabase SMTP**:
   - Go to Authentication → Settings
   - Configure SMTP settings
   - Test email delivery

## 💰 Payment Testing

### **Paystack Test Cards**
Use these test cards for development:

- **Successful Payment**: `4084084084084081`
- **Insufficient Funds**: `4084084084084081` (amount > 300000)
- **Invalid Card**: `4084084084084082`

### **Test Flow**
1. Add books to cart
2. Proceed to checkout
3. Use test card details
4. Verify payment success/failure handling

## 🐛 Troubleshooting

### **Common Issues**

#### **Supabase Connection Errors**
- Verify environment variables are correct
- Check Supabase project status
- Ensure RLS policies allow required operations

#### **Email Verification Not Working**
- Configure SMTP settings in Supabase
- Check spam folder for verification emails
- Verify email templates are set up

#### **Payment Failures**
- Confirm Paystack public key is correct
- Test with Paystack test cards
- Check browser console for errors

#### **Admin Access Issues**
- Use default credentials provided
- Ensure admin role is set in database
- Check RLS policies for admin operations

### **Development Tips**
- Use browser dev tools for debugging
- Check Supabase logs for database errors
- Monitor network requests for API issues
- Use React DevTools for component debugging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Support

For support and questions:
- **Email**: hello@kellyinkspired.com
- **Phone**: +234 801 234 5678
- **Website**: [kellyinkspired.com](https://kellyinkspired.com)

## 🙏 Acknowledgments

- **Awokunle M. Kelechi** - Author and content creator
- **Supabase** - Backend infrastructure
- **Paystack** - Payment processing
- **Pexels** - Stock images for book covers
- **React Community** - Amazing ecosystem and tools

---

**Built with ❤️ for inspiring faith-based literature**

*© 2025 KellyInkspired. All rights reserved.*