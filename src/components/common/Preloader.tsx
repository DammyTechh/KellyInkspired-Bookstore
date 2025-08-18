import { motion } from 'framer-motion';
import { Book } from 'lucide-react';

const Preloader = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.3
      }
    }
  };

  const logoVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  const textVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: "spring",
        stiffness: 100,
        duration: 0.7
      }
    }
  };

  return (
    <motion.div 
      className="fixed inset-0 flex flex-col justify-center items-center bg-white dark:bg-gray-900 z-50"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div 
        className="relative mb-6"
        variants={logoVariants}
      >
        <motion.div 
          animate={{ 
            rotateY: [0, 360],
            transition: { repeat: Infinity, duration: 2.5, ease: "easeInOut" }
          }}
          className="text-primary-600 dark:text-primary-400"
        >
          <Book size={64} />
        </motion.div>
        <motion.div 
          className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-16 h-2 bg-accent-500 dark:bg-accent-400 rounded-full"
          animate={{ 
            scaleX: [1, 1.5, 1],
            opacity: [0.7, 1, 0.7],
            transition: { repeat: Infinity, duration: 2, ease: "easeInOut" }
          }}
        />
      </motion.div>
      
      <motion.h1 
        className="text-3xl font-heading font-bold text-primary-700 dark:text-primary-300 tracking-wider"
        variants={textVariants}
      >
        kellyinkspired
      </motion.h1>
      
      <motion.div 
        className="mt-8"
        variants={textVariants}
      >
        <motion.div 
          className="flex space-x-2 items-center"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <div className="w-2 h-2 bg-primary-600 dark:bg-primary-400 rounded-full"></div>
          <div className="w-2 h-2 bg-secondary-600 dark:bg-secondary-400 rounded-full"></div>
          <div className="w-2 h-2 bg-accent-500 dark:bg-accent-400 rounded-full"></div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Preloader;