import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="relative bg-gradient-to-r from-primary-900 to-primary-800 text-white py-24 lg:py-32 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 right-[10%] w-40 h-40 bg-accent-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-[5%] w-60 h-60 bg-secondary-500/20 rounded-full blur-3xl" />
        <div className="absolute top-40 left-[30%] w-20 h-20 bg-accent-300/30 rounded-full blur-xl" />
      </div>

      <div className="container-custom relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-xl"
          >
            <motion.h1 
              className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold leading-tight mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              Inspiring Stories <br />
              <span className="text-accent-400">for a Purposeful Life</span>
            </motion.h1>
            
            <motion.p 
              className="text-lg text-gray-100 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
            >
              Discover the transformative writings of Awokunle M. Kelechi, 
              award-winning author and faith-based storyteller dedicated to 
              inspiring lives through powerful narratives.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.6 }}
            >
              <Link 
                to="/books" 
                className="btn bg-accent-500 hover:bg-accent-600 text-white px-8 py-3 rounded-lg flex items-center justify-center group"
              >
                Browse Books
                <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                to="/about" 
                className="btn bg-transparent border-2 border-white hover:bg-white/10 text-white px-8 py-3 rounded-lg flex items-center justify-center"
              >
                About the Author
              </Link>
            </motion.div>
          </motion.div>
          
          {/* 3D Book Display */}
          <motion.div 
            className="book-perspective flex justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            <motion.div 
              className="book-3d relative max-w-xs"
              whileHover={{ rotateY: 25 }}
              transition={{ type: "spring", stiffness: 100 }}
            >
              <img 
                src="https://imgur.com/QZ1ZDAX.png"
                alt="Featured Book Cover" 
                className="rounded-lg shadow-2xl"
              />
              
              {/* Book spine/side effect */}
              <div className="absolute top-0 left-0 w-10 h-full bg-gray-800 opacity-30 transform origin-left skew-y-12" />
              
              {/* Book highlight effect */}
              <div className="absolute top-0 right-0 w-1/3 h-full bg-white opacity-10 rounded-r-lg" />
              
              {/* Featured badge */}
              <div className="absolute -top-4 -right-4 bg-accent-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg">
                New Release
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;