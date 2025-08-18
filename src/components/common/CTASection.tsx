import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const CTASection = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-primary-900 z-0"></div>
      
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-10 left-[10%] w-64 h-64 bg-accent-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-[10%] w-80 h-80 bg-secondary-500/20 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container-custom relative z-10">
        <motion.div 
          className="max-w-3xl mx-auto text-center text-white"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">
            Ready to Discover Your Purpose?
          </h2>
          <p className="text-xl text-gray-100 mb-8 leading-relaxed">
            Explore Awokunle M. Kelechi's transformative books and begin your 
            journey toward a more purposeful and faith-driven life.
          </p>
          <motion.div 
            className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <Link 
              to="/books" 
              className="btn bg-white hover:bg-gray-100 text-primary-700 px-8 py-3 rounded-lg flex items-center justify-center group"
            >
              Explore Books
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
      </div>
    </section>
  );
};

export default CTASection;