import { useState } from 'react';
import { Link } from 'react-router-dom';
import {Instagram, Facebook, Mail, MessageCircle } from 'lucide-react';
import { subscribeNewsletter } from '../../lib/api';

const SOCIALS = {
  instagram: 'https://www.instagram.com/truth.by.lens?igsh=MWMybHpweW1kcW43aQ%3D%3D&utm_source=qr',
  facebook: 'https://www.facebook.com/share/1JJbXGHFPz/?mibextid=wwXIfr',
  whatsapp: 'https://wa.me/2347048475128',
  email: 'kellyinkspired@gmail.com',
};

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    try {
      await subscribeNewsletter(email);
      setStatus('done');
      setEmail('');
    } catch {
      setStatus('error');
    }
  };

  return (
    <footer className="bg-cream-100 dark:bg-gray-800 pt-16 pb-8 border-t border-primary-100 dark:border-gray-700">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="inline-flex items-center mb-4">
              <span className="text-2xl font-heading font-bold text-gradient">KellyInkspired</span>
            </Link>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Transforming lives through faith-based storytelling and inspirational messages.
            </p>
            <div className="flex space-x-4">
              <a href={SOCIALS.instagram} target="_blank" rel="noopener noreferrer"
                className="text-gray-500 dark:text-gray-400 hover:text-accent-500 transition-colors" aria-label="Instagram">
                <Instagram size={20} />
              </a>
              <a href={SOCIALS.facebook} target="_blank" rel="noopener noreferrer"
                className="text-gray-500 dark:text-gray-400 hover:text-accent-500 transition-colors" aria-label="Facebook">
                <Facebook size={20} />
              </a>
              <a href={SOCIALS.whatsapp} target="_blank" rel="noopener noreferrer"
                className="text-gray-500 dark:text-gray-400 hover:text-accent-500 transition-colors" aria-label="WhatsApp">
                <MessageCircle size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-200">Quick Links</h3>
            <ul className="space-y-3">
              {[['Home', '/'], ['Books', '/books'], ['Blog', '/blog'], ['About', '/about'], ['Contact', '/contact']].map(([label, to]) => (
                <li key={to}>
                  <Link to={to} className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Events */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-200">Hearts &amp; Purpose</h3>
            <ul className="space-y-3 text-gray-600 dark:text-gray-400">
              <li>Hearts and Purpose Conference</li>
              <li>Book Signings</li>
              <li>Writing Workshops</li>
              <li>Youth Mentorship</li>
              <li>Speaking Engagements</li>
            </ul>
          </div>

          {/* Contact + Newsletter */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-200">Stay in touch</h3>
            <ul className="space-y-3">
              <li>
                <a href={`mailto:${SOCIALS.email}`} className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center space-x-2">
                  <Mail size={16} /><span>{SOCIALS.email}</span>
                </a>
              </li>
              <li>
                <a href={SOCIALS.whatsapp} target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center space-x-2">
                  <MessageCircle size={16} /><span>+234 704 847 5128</span>
                </a>
              </li>
              <li className="pt-3">
                <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">Newsletter</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">New releases &amp; coming-soon reveals.</p>
                {status === 'done' ? (
                  <p className="text-sm text-primary-600 dark:text-primary-400 font-medium">Subscribed! Check your inbox 💌</p>
                ) : (
                  <form onSubmit={subscribe} className="flex">
                    <input
                      type="email" placeholder="Your email" value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="px-3 py-2 w-full bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-l-lg focus:border-primary-500"
                      required
                    />
                    <button type="submit" disabled={status === 'loading'}
                      className="bg-primary-500 hover:bg-primary-600 text-white px-3 py-2 rounded-r-lg transition-colors disabled:opacity-70 whitespace-nowrap">
                      {status === 'loading' ? '…' : 'Subscribe'}
                    </button>
                  </form>
                )}
                {status === 'error' && <p className="text-xs text-red-500 mt-1">Something went wrong. Try again.</p>}
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            &copy; {currentYear} KellyInkspired. All rights reserved.
          </p>
         
        </div>
      </div>
    </footer>
  );
};

export default Footer;
