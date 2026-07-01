import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MessageCircle, Instagram, Facebook, Send, CheckCircle, Loader2 } from 'lucide-react';
import { sendContactMessage } from '../lib/api';

const SOCIALS = {
  facebook: 'https://www.facebook.com/share/1JJbXGHFPz/?mibextid=wwXIfr',
  instagram: 'https://www.instagram.com/truth.by.lens?igsh=MWMybHpweW1kcW43aQ%3D%3D&utm_source=qr',
  whatsapp: 'https://wa.me/2347048475128',
  email: 'kellyinkspired@gmail.com',
};

const ContactPage = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setError('');
    try {
      await sendContactMessage(form);
      setStatus('sent');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  };

  return (
    <div className="pt-28 pb-20 min-h-screen">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
            Get in <span className="text-gradient">Touch</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Have a question, a speaking invitation, or want to collaborate on Hearts and Purpose?
            Send a message and it will land straight in our inbox.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-8 max-w-5xl mx-auto">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-3 card p-8"
          >
            {status === 'sent' ? (
              <div className="flex flex-col items-center justify-center text-center py-12">
                <CheckCircle className="text-secondary-500 mb-4" size={56} />
                <h3 className="text-2xl font-heading font-bold mb-2">Message Sent</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Thank you for reaching out. We'll get back to you very soon.
                </p>
                <button onClick={() => setStatus('idle')} className="btn btn-outline">
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Name</label>
                    <input
                      name="name" required value={form.name} onChange={handleChange}
                      className="input" placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Email</label>
                    <input
                      type="email" name="email" required value={form.email} onChange={handleChange}
                      className="input" placeholder="you@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Subject</label>
                  <input
                    name="subject" value={form.subject} onChange={handleChange}
                    className="input" placeholder="What is this about?"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Message</label>
                  <textarea
                    name="message" required rows={6} value={form.message} onChange={handleChange}
                    className="input resize-none" placeholder="Write your message..."
                  />
                </div>
                {status === 'error' && (
                  <p className="text-sm text-red-500">{error}</p>
                )}
                <button
                  type="submit" disabled={status === 'sending'}
                  className="btn btn-primary w-full flex items-center justify-center gap-2"
                >
                  {status === 'sending' ? (
                    <><Loader2 className="animate-spin" size={18} /> Sending...</>
                  ) : (
                    <><Send size={18} /> Send Message</>
                  )}
                </button>
              </form>
            )}
          </motion.div>

          {/* Contact details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2 space-y-4"
          >
            <a
              href={`mailto:${SOCIALS.email}`}
              className="card p-5 flex items-center gap-4 hover:shadow-lg transition-shadow"
            >
              <span className="p-3 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-300">
                <Mail size={22} />
              </span>
              <div>
                <p className="font-semibold">Email</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 break-all">{SOCIALS.email}</p>
              </div>
            </a>

            <a
              href={SOCIALS.whatsapp} target="_blank" rel="noopener noreferrer"
              className="card p-5 flex items-center gap-4 hover:shadow-lg transition-shadow"
            >
              <span className="p-3 rounded-full bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-300">
                <MessageCircle size={22} />
              </span>
              <div>
                <p className="font-semibold">WhatsApp</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">+234 704 847 5128</p>
              </div>
            </a>

            <a
              href={SOCIALS.instagram} target="_blank" rel="noopener noreferrer"
              className="card p-5 flex items-center gap-4 hover:shadow-lg transition-shadow"
            >
              <span className="p-3 rounded-full bg-accent-100 dark:bg-accent-900/40 text-accent-600 dark:text-accent-300">
                <Instagram size={22} />
              </span>
              <div>
                <p className="font-semibold">Instagram</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">@truth.by.lens</p>
              </div>
            </a>

            <a
              href={SOCIALS.facebook} target="_blank" rel="noopener noreferrer"
              className="card p-5 flex items-center gap-4 hover:shadow-lg transition-shadow"
            >
              <span className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300">
                <Facebook size={22} />
              </span>
              <div>
                <p className="font-semibold">Facebook</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">KellyInkspired</p>
              </div>
            </a>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
