import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, KeyRound, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { requestOtp, verifyOtp, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Sign In | KellyInkspired';
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  const sendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setInfo('');
    if (!email) { setError('Please enter your email address'); return; }
    try {
      setIsLoading(true);
      await requestOtp(email);
      setStep('code');
      setInfo(`We've sent a code to ${email}.`);
    } catch {
      setError('Could not send the code. Please check the email and try again.');
    } finally { setIsLoading(false); }
  };

  const confirmCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (code.length < 6) { setError('Enter the code from your email'); return; }
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
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary-100 dark:bg-primary-900/40 mb-4">
              {step === 'email'
                ? <Mail className="text-primary-600 dark:text-primary-300" size={26} />
                : <KeyRound className="text-primary-600 dark:text-primary-300" size={26} />}
            </div>
            <h1 className="text-2xl font-heading font-bold mb-2 text-gray-800 dark:text-gray-100">
              {step === 'email' ? 'Welcome Back' : 'Enter your code'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {step === 'email'
                ? 'Sign in with a one-time code — no password needed.'
                : 'Check your inbox for the verification code.'}
            </p>
          </div>

          {error && (
            <div className="bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}
          {info && !error && (
            <div className="bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 p-3 rounded-lg mb-6 text-sm">
              {info}
            </div>
          )}

          {step === 'email' ? (
            <form onSubmit={sendCode}>
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
                {isLoading ? 'Sending code...' : 'Send code'}
              </button>
            </form>
          ) : (
            <form onSubmit={confirmCode}>
              <div className="mb-6">
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Verification code
                </label>
                <input
                  type="text" inputMode="numeric" maxLength={8} id="code" value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 py-3 text-center text-2xl tracking-[0.35em] rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-400"
                  placeholder="••••••••" required
                />
              </div>
              <button type="submit" disabled={isLoading}
                className="w-full btn btn-primary py-3 rounded-lg font-medium disabled:opacity-70">
                {isLoading ? 'Verifying...' : 'Verify & sign in'}
              </button>
              <button type="button" onClick={() => { setStep('email'); setCode(''); setError(''); }}
                className="mt-4 w-full flex items-center justify-center text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600">
                <ArrowLeft size={14} className="mr-1" /> Use a different email
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              New here?{' '}
              <Link to="/register" className="text-primary-600 dark:text-primary-400 hover:underline">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default LoginPage;
