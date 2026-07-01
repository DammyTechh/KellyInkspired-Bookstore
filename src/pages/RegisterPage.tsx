import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, KeyRound, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const [step, setStep] = useState<'details' | 'code'>('details');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { requestOtp, verifyOtp, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Create Account | KellyInkspired';
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  const sendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setInfo('');
    if (!name || !email) { setError('Please enter your name and email'); return; }
    try {
      setIsLoading(true);
      await requestOtp(email, name);
      setStep('code');
      setInfo(`We've sent a 6-digit code to ${email}.`);
    } catch {
      setError('Could not start sign-up. Please try again.');
    } finally { setIsLoading(false); }
  };

  const confirmCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (code.length < 6) { setError('Enter the 6-digit code from your email'); return; }
    try {
      setIsLoading(true);
      await verifyOtp(email, code);
      navigate('/');
    } catch {
      setError('That code is invalid or has expired. Please try again.');
    } finally { setIsLoading(false); }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }} className="pt-12 pb-20"
    >
      <div className="container-custom max-w-md mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-accent-100 dark:bg-accent-900/40 mb-4">
              {step === 'details'
                ? <UserPlus className="text-accent-600 dark:text-accent-300" size={26} />
                : <KeyRound className="text-accent-600 dark:text-accent-300" size={26} />}
            </div>
            <h1 className="text-2xl font-heading font-bold mb-2 text-gray-800 dark:text-gray-100">
              {step === 'details' ? 'Create an Account' : 'Enter your code'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {step === 'details'
                ? 'Join us — no password to remember, just a one-time code.'
                : 'Check your inbox for the verification code.'}
            </p>
          </div>

          {error && (
            <div className="bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}
          {info && !error && (
            <div className="bg-accent-50 dark:bg-accent-900/20 text-accent-700 dark:text-accent-300 p-3 rounded-lg mb-6 text-sm">
              {info}
            </div>
          )}

          {step === 'details' ? (
            <form onSubmit={sendCode}>
              <div className="mb-6">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text" id="name" value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-400"
                  placeholder="Your name" required
                />
              </div>
              <div className="mb-6">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email" id="email" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-400"
                  placeholder="you@example.com" required
                />
              </div>
              <button type="submit" disabled={isLoading}
                className="w-full btn btn-primary py-3 rounded-lg font-medium disabled:opacity-70">
                {isLoading ? 'Sending code...' : 'Continue'}
              </button>
            </form>
          ) : (
            <form onSubmit={confirmCode}>
              <div className="mb-6">
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  6-digit code
                </label>
                <input
                  type="text" inputMode="numeric" maxLength={6} id="code" value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 py-3 text-center text-2xl tracking-[0.5em] rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-400"
                  placeholder="••••••" required
                />
              </div>
              <button type="submit" disabled={isLoading}
                className="w-full btn btn-primary py-3 rounded-lg font-medium disabled:opacity-70">
                {isLoading ? 'Verifying...' : 'Verify & create account'}
              </button>
              <button type="button" onClick={() => { setStep('details'); setCode(''); setError(''); }}
                className="mt-4 w-full flex items-center justify-center text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600">
                <ArrowLeft size={14} className="mr-1" /> Edit details
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 dark:text-primary-400 hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default RegisterPage;
