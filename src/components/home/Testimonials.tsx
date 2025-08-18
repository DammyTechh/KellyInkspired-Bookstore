import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Quote, ChevronLeft, ChevronRight } from 'lucide-react';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  quote: string;
  avatarUrl: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Sarah Johnson',
    role: 'Avid Reader',
    quote: 'Kelechi\'s books have transformed my perspective on faith and purpose. Her storytelling is both captivating and deeply insightful.',
    avatarUrl: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  },
  {
    id: 2,
    name: 'Michael Thompson',
    role: 'Youth Pastor',
    quote: 'I\'ve used Kelechi\'s books in our youth ministry, and the impact has been incredible. Her writing speaks directly to young hearts.',
    avatarUrl: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  },
  {
    id: 3,
    name: 'Chioma Nwosu',
    role: 'Book Club Founder',
    quote: 'Our book club has discussed several of Kelechi\'s works, and they always spark the most profound conversations about faith and purpose.',
    avatarUrl: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  },
  {
    id: 4,
    name: 'David Okafor',
    role: 'Student',
    quote: 'As a teenager navigating life\'s challenges, Kelechi\'s books have been a guiding light for me. They\'ve helped me find my purpose.',
    avatarUrl: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  }
];

const Testimonials = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const timerRef = useRef<number | null>(null);
  
  const nextTestimonial = () => {
    setActiveIndex(prev => (prev + 1) % testimonials.length);
  };
  
  const prevTestimonial = () => {
    setActiveIndex(prev => (prev - 1 + testimonials.length) % testimonials.length);
  };
  
  // Autoplay functionality
  useEffect(() => {
    if (autoplay) {
      timerRef.current = window.setInterval(() => {
        nextTestimonial();
      }, 5000);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [autoplay]);

  // Pause autoplay when user interacts with navigation
  const handleNavigation = (callback: () => void) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      setAutoplay(false);
    }
    callback();
    
    // Resume autoplay after 10 seconds of inactivity
    setTimeout(() => {
      setAutoplay(true);
    }, 10000);
  };
  
  return (
    <section className="section bg-primary-50 dark:bg-primary-900/10">
      <div className="container-custom">
        <div className="text-center mb-12">
          <motion.h2 
            className="text-3xl md:text-4xl font-heading font-bold mb-4 text-gray-800 dark:text-gray-100"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Reader Testimonials
          </motion.h2>
          <motion.p 
            className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Hear what readers are saying about Awokunle M. Kelechi's 
            transformative and inspiring books.
          </motion.p>
        </div>
        
        <div className="relative max-w-4xl mx-auto">
          {/* Testimonial Content */}
          <motion.div 
            key={activeIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center relative"
          >
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-accent-500 rounded-full p-3 text-white">
              <Quote size={24} />
            </div>
            
            <div className="mt-8 mb-6">
              <p className="text-xl text-gray-700 dark:text-gray-300 italic leading-relaxed">
                "{testimonials[activeIndex].quote}"
              </p>
            </div>
            
            <div className="flex items-center justify-center">
              <div className="mr-4">
                <img 
                  src={testimonials[activeIndex].avatarUrl} 
                  alt={testimonials[activeIndex].name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-primary-500"
                />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-gray-800 dark:text-gray-100">
                  {testimonials[activeIndex].name}
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  {testimonials[activeIndex].role}
                </p>
              </div>
            </div>
          </motion.div>
          
          {/* Navigation Buttons */}
          <div className="flex justify-between absolute -left-4 -right-4 top-1/2 transform -translate-y-1/2">
            <button
              onClick={() => handleNavigation(prevTestimonial)}
              className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 p-2 rounded-full shadow-md hover:bg-primary-100 dark:hover:bg-primary-800 transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={() => handleNavigation(nextTestimonial)}
              className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 p-2 rounded-full shadow-md hover:bg-primary-100 dark:hover:bg-primary-800 transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
        
        {/* Dots Indicator */}
        <div className="flex justify-center space-x-2 mt-8">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => handleNavigation(() => setActiveIndex(index))}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === activeIndex 
                  ? 'bg-primary-600 dark:bg-primary-400' 
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;