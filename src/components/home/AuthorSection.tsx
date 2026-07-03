import { motion } from 'framer-motion';
import { Award, BookOpen, Users, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const AuthorSection = () => {
  const authorStats = [
    { icon: <BookOpen size={24} />, value: '5+', label: 'Published Books' },
    { icon: <Award size={24} />, value: 'Award', label: 'Winning Author' },
    { icon: <Users size={24} />, value: '1000+', label: 'Lives Inspired' },
    { icon: <Heart size={24} />, value: 'Faith', label: 'Based Stories' },
  ];

  return (
    <section className="section relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-primary-100 dark:bg-primary-900/20 rounded-full opacity-50 -z-10" />
      <div className="absolute -top-10 -left-10 w-40 h-40 bg-accent-100 dark:bg-accent-900/20 rounded-full opacity-50 -z-10" />
      
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Author Image */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="relative z-10 rounded-lg overflow-hidden shadow-xl">
              <img 
                src="https://imgur.com/erlnoGm.png" 
                alt="Awokunle M. Kelechi" 
                className="w-full h-auto object-cover"
              />
            </div>
            {/* Decorative elements */}
            <div className="absolute -left-4 -bottom-4 w-full h-full border-2 border-primary-500 dark:border-primary-400 rounded-lg z-0" />
            <div className="absolute top-4 -right-4 w-24 h-24 bg-accent-500/20 rounded-full z-0 blur-lg" />
          </motion.div>
          
          {/* Author Info */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6 text-gray-800 dark:text-gray-100">
              About the Author
            </h2>
            
            <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
              Awokunle M. Kelechi is an award-winning writer, storyteller, public speaker, 
              and teenage coach dedicated to inspiring lives through faith-based storytelling 
              and transformational messages.
            </p>
            
            <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
              With five published books to her name, she has collaborated with numerous 
              authors and writers in bringing impactful stories to life. She is the visionary 
              behind Hearts and Purpose, an event designed to empower individuals in discovering 
              their purpose, deepening their faith, and embracing personal growth.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {authorStats.map((stat, index) => (
                <motion.div 
                  key={index}
                  className="flex flex-col items-center justify-center p-3 rounded-lg bg-white dark:bg-gray-800 shadow-sm"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="text-primary-600 dark:text-primary-400 mb-2">
                    {stat.icon}
                  </div>
                  <p className="text-xl font-bold text-gray-800 dark:text-gray-100">
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </div>
            
            <Link 
              to="/about" 
              className="btn btn-primary inline-block px-6 py-3"
            >
              Learn More
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AuthorSection;