import { useEffect } from 'react';
import { motion } from 'framer-motion';
import Hero from '../components/home/Hero';
import FeaturedBooks from '../components/home/FeaturedBooks';
import AuthorSection from '../components/home/AuthorSection';
import Testimonials from '../components/home/Testimonials';
import CTASection from '../components/common/CTASection';

const HomePage = () => {
  useEffect(() => {
    // Update page title
    document.title = 'KellyInkspired | Faith-Based Books by Awokunle M. Kelechi';
    // Scroll to top on component mount
    window.scrollTo(0, 0);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Hero />
      <FeaturedBooks />
      <AuthorSection />
      <Testimonials />
      <CTASection />
    </motion.div>
  );
};

export default HomePage;