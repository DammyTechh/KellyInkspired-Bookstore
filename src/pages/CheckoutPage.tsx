import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trash2, ArrowLeft, Loader2, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatNaira } from '../lib/supabaseClient';
import { startPaystackCheckout, verifyPaystack, startOpayCheckout, verifyOpay } from '../lib/api';

type Provider = 'paystack' | 'opay';

const CheckoutPage = () => {
  const { items, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [provider, setProvider] = useState<Provider>('paystack');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // On return from the payment provider, verify the transaction.
  useEffect(() => {
    document.title = 'Checkout | KellyInkspired';
    window.scrollTo(0, 0);

    const params = new URLSearchParams(window.location.search);
    let reference = params.get('reference') || params.get('trxref');
    let pendingProvider: Provider = (params.get('provider') as Provider) || 'paystack';

    // Fall back to what we stored right before redirecting (robust across providers).
    try {
      const raw = localStorage.getItem('ki_pending_payment');
      if (raw) {
        const saved = JSON.parse(raw) as { reference: string; provider: Provider };
        if (!reference) reference = saved.reference;
        if (!params.get('provider')) pendingProvider = saved.provider;
      }
    } catch { /* ignore */ }

    if (reference) {
      setIsLoading(true);
      const verify = pendingProvider === 'opay' ? verifyOpay : verifyPaystack;
      verify(reference)
        .then((res) => {
          if (res.status === 'paid' || res.status === 'success') {
            setMessage({ type: 'success', text: 'Payment confirmed! Check your email for download links.' });
            localStorage.removeItem('ki_pending_payment');
            clearCart();
            setTimeout(() => navigate('/'), 3500);
          } else if (res.status === 'pending') {
            setMessage({ type: 'error', text: 'Your payment is still processing. We will email your books once it clears.' });
          } else {
            setMessage({ type: 'error', text: 'Payment could not be confirmed. If you were charged, contact support.' });
          }
        })
        .catch(() => setMessage({ type: 'error', text: 'Verification failed. Please contact support.' }))
        .finally(() => setIsLoading(false));
    }
  }, [clearCart, navigate]);

  const handlePay = async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      const payload = items.map((i) => ({
        book_id: i.book.id, title: i.book.title, price: i.book.price, quantity: i.quantity,
      }));
      const callbackUrl = `${window.location.origin}/checkout?provider=${provider}`;
      const start = provider === 'opay' ? startOpayCheckout : startPaystackCheckout;
      const { authorization_url, reference } = await start(payload, callbackUrl);
      // Remember what to verify when the user returns.
      localStorage.setItem('ki_pending_payment', JSON.stringify({ reference, provider }));
      window.location.href = authorization_url;
    } catch (err) {
      setIsLoading(false);
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Could not start payment. Please try again.',
      });
    }
  };

  if (items.length === 0 && !message) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="pt-28 pb-20">
        <div className="container-custom max-w-3xl">
          <div className="card p-10 text-center">
            <h1 className="text-2xl font-heading font-bold mb-4">Your Cart is Empty</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">You haven't added any books yet.</p>
            <Link to="/books" className="btn btn-primary inline-flex items-center">
              <ArrowLeft size={16} className="mr-2" /> Browse Books
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  if (!isAuthenticated) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="pt-28 pb-20">
        <div className="container-custom max-w-3xl">
          <div className="card p-10 text-center">
            <h1 className="text-2xl font-heading font-bold mb-4">Sign In Required</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Please sign in to complete your purchase. Your books will be emailed to you after payment.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/login" className="btn btn-primary">Sign In</Link>
              <Link to="/register" className="btn btn-outline">Create Account</Link>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="pt-28 pb-20">
      <div className="container-custom">
        <h1 className="text-3xl font-heading font-bold mb-8">Checkout</h1>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
              : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
          }`}>
            {message.text}
          </div>
        )}

        {items.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart */}
            <div className="lg:col-span-2">
              <div className="card overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-bold">Cart Items</h2>
                </div>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {items.map((item) => (
                    <div key={item.book.id} className="p-6 flex flex-col sm:flex-row gap-4">
                      <div className="w-20 h-28 shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                        <img src={item.book.coverUrl} alt={item.book.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-bold mb-1">{item.book.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{formatNaira(item.book.price)}</p>
                        <div className="flex justify-between items-center">
                          <select
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.book.id, parseInt(e.target.value))}
                            className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1"
                          >
                            {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
                          </select>
                          <button onClick={() => removeFromCart(item.book.id)} className="text-gray-400 hover:text-red-500" aria-label="Remove">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                      <div className="text-right font-medium">{formatNaira(item.book.price * item.quantity)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Summary + payment */}
            <div>
              <div className="card p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                <div className="flex justify-between text-gray-600 dark:text-gray-400 mb-2">
                  <span>Subtotal</span><span>{formatNaira(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400 mb-4">
                  <span>Delivery</span><span>Digital · Free</span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between text-lg font-bold">
                  <span>Total</span><span>{formatNaira(totalPrice)}</span>
                </div>
              </div>

              <div className="card p-6">
                <h2 className="text-xl font-bold mb-4">Payment Method</h2>
                <div className="space-y-3 mb-6">
                  <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    provider === 'paystack' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-300 dark:border-gray-700'
                  }`}>
                    <input type="radio" name="provider" checked={provider === 'paystack'} onChange={() => setProvider('paystack')} className="accent-primary-500" />
                    <span className="font-medium">Paystack</span>
                    <span className="ml-auto text-xs text-gray-500">Card · Bank · USSD</span>
                  </label>
                  <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    provider === 'opay' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-300 dark:border-gray-700'
                  }`}>
                    <input type="radio" name="provider" checked={provider === 'opay'} onChange={() => setProvider('opay')} className="accent-primary-500" />
                    <span className="font-medium">Opay</span>
                    <span className="ml-auto text-xs text-gray-500">Opay wallet · Card · Bank</span>
                  </label>
                </div>

                <button onClick={handlePay} disabled={isLoading} className="btn btn-primary w-full py-3 flex items-center justify-center gap-2">
                  {isLoading ? <><Loader2 className="animate-spin" size={18} /> Processing...</> : <><ShieldCheck size={18} /> Pay {formatNaira(totalPrice)}</>}
                </button>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
                  Secured by {provider === 'opay' ? 'Opay' : 'Paystack'}. Your books are emailed instantly after payment.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default CheckoutPage;
