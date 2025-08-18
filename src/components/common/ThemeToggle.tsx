import { Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="h-8 w-8 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 transition-colors duration-300"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <motion.div
        initial={false}
        animate={{ rotate: theme === 'light' ? 0 : 180 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="flex items-center justify-center"
      >
        {theme === 'light' ? (
          <Moon size={18} className="text-gray-700" />
        ) : (
          <Sun size={18} className="text-yellow-300" />
        )}
      </motion.div>
    </button>
  );
};

export default ThemeToggle;