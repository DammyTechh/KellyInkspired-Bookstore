import { Link } from 'react-router-dom';
import { Book, Heart, Instagram, Twitter, Facebook, Mail, Phone } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-100 dark:bg-gray-800 pt-16 pb-8">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <Book 
                size={28} 
                className="text-primary-600 dark:text-primary-400" 
              />
              <span className="text-xl font-heading font-bold text-primary-700 dark:text-primary-300">
                kellyinkspired
              </span>
            </Link>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Transforming lives through faith-based storytelling and inspirational messages.
            </p>
            <div className="flex space-x-4">
              <a 
                href="http://instagram.com/Kelechi_Awokunle" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a 
                href="https://x.com/awokunlekelechi?s=11" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
              <a 
                href="https://www.facebook.com/awokunle.modupekelechi?mibextid=LQQJ4d" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-200">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/" 
                  className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  to="/books" 
                  className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  Books
                </Link>
              </li>
              <li>
                <Link 
                  to="/about" 
                  className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  About the Author
                </Link>
              </li>
              <li>
                <Link 
                  to="/register" 
                  className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  Create Account
                </Link>
              </li>
              <li>
                <Link 
                  to="/login" 
                  className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Events */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-200">Events</h3>
            <ul className="space-y-3">
              <li className="text-gray-600 dark:text-gray-400">
                Hearts and Purpose Conference
              </li>
              <li className="text-gray-600 dark:text-gray-400">
                Book Signings
              </li>
              <li className="text-gray-600 dark:text-gray-400">
                Writing Workshops
              </li>
              <li className="text-gray-600 dark:text-gray-400">
                Youth Mentorship Programs
              </li>
              <li className="text-gray-600 dark:text-gray-400">
                Speaking Engagements
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-200">Contact</h3>
            <ul className="space-y-3">
              <li>
                <a 
                  href="mailto:hello@kellyinkspired.com" 
                  className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center space-x-2"
                >
                  <Mail size={16} />
                  <span>Kellyinkspired@gmail.com</span>
                </a>
              </li>
              <li>
                <a 
                  href="tel:+2348012345678" 
                  className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center space-x-2"
                >
                  <Phone size={16} />
                  <span>+234 704 847 5128</span>
                </a>
              </li>
              <li className="text-gray-600 dark:text-gray-400 pt-4">
                <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">Newsletter</p>
                <p className="text-sm mb-2">Subscribe for updates and new releases</p>
                <div className="flex">
                  <input 
                    type="email" 
                    placeholder="Your email" 
                    className="px-3 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-l-lg focus:outline-none focus:border-primary-500 dark:focus:border-primary-400"
                  />
                  <button className="bg-primary-600 hover:bg-primary-700 text-white px-3 py-2 rounded-r-lg transition-colors">
                    Subscribe
                  </button>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            &copy; {currentYear} KellyInkspired. All rights reserved.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link 
              to="/privacy-policy" 
              className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-sm"
            >
              Privacy Policy
            </Link>
            <Link 
              to="/terms-of-service" 
              className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-sm"
            >
              Terms of Service
            </Link>
          </div>
          <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm mt-4 md:mt-0">
            <span>Made with</span>
            <Heart size={14} className="mx-1 text-red-500" />
            <span>in Nigeria</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;