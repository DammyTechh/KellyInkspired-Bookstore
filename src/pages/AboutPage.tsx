import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BookOpen, MessageSquare, Users, Heart, Sparkles, ArrowRight } from 'lucide-react';

const roles = [
  { icon: <BookOpen size={16} />, label: 'Writer', cls: 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300' },
  { icon: <MessageSquare size={16} />, label: 'Public Speaker', cls: 'bg-secondary-50 dark:bg-secondary-900/20 text-secondary-700 dark:text-secondary-300' },
  { icon: <Users size={16} />, label: 'Teenage Coach', cls: 'bg-accent-50 dark:bg-accent-900/20 text-accent-700 dark:text-accent-300' },
  { icon: <Heart size={16} />, label: 'Storyteller', cls: 'bg-cream-200 dark:bg-gray-800 text-primary-700 dark:text-gray-300' },
];

const pillars = [
  { icon: <Sparkles size={30} />, title: 'Discovering Purpose', description: 'Helping individuals uncover the calling and meaning written into their lives.' },
  { icon: <Heart size={30} />, title: 'Deepening Faith', description: 'Encouraging a richer, more grounded walk of faith through story and truth.' },
  { icon: <Users size={30} />, title: 'Embracing Growth', description: 'Empowering personal growth and transformation, especially among young people.' },
];

const AboutPage = () => {
  useEffect(() => {
    document.title = 'About the Author | KellyInkspired';
    window.scrollTo(0, 0);
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="pb-20">
      {/* Banner */}
      <div className="bg-cream-100 dark:bg-gray-800 pt-28 pb-12 mb-12">
        <div className="container-custom">
          <h1 className="text-3xl md:text-4xl font-heading font-bold mb-4">
            About the <span className="text-gradient">Author</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl">
            Awokunle M. Kelechi and her mission to inspire lives through faith-based storytelling.
          </p>
        </div>
      </div>

      <div className="container-custom">
        {/* Bio */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <motion.div className="relative" initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <div className="relative z-10 rounded-2xl overflow-hidden shadow-xl">
              <img src="https://imgur.com/erlnoGm.png" alt="Awokunle M. Kelechi" className="w-full h-auto object-cover" />
            </div>
            <div className="absolute -left-4 -bottom-4 w-full h-full border-2 border-primary-400 rounded-2xl z-0" />
            <div className="absolute top-4 -right-4 w-24 h-24 bg-accent-400/30 rounded-full z-0 blur-lg" />
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <h2 className="text-3xl font-heading font-bold mb-2">Awokunle M. Kelechi</h2>
            <h3 className="text-lg text-primary-600 dark:text-primary-400 mb-6">
              Award-winning Writer &amp; Faith-based Storyteller
            </h3>
            <div className="space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
              <p>
                Awokunle M. Kelechi is an award-winning writer, storyteller, public speaker,
                and teenage coach dedicated to inspiring lives through faith-based storytelling
                and transformational messages.
              </p>
              <p>
                She is the visionary behind Hearts and Purpose, an event designed to empower
                individuals in discovering their purpose, deepening their faith, and embracing
                personal growth.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 mt-6">
              {roles.map((r) => (
                <span key={r.label} className={`px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium ${r.cls}`}>
                  {r.icon} {r.label}
                </span>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Hearts and Purpose */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <span className="badge badge-new mb-4 inline-flex items-center gap-1"><Sparkles size={14} /> Hearts and Purpose</span>
            <h2 className="text-2xl md:text-3xl font-heading font-bold mb-3">A Vision to Empower</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Hearts and Purpose is built around three commitments at the heart of Awokunle's work.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pillars.map((p, i) => (
              <motion.div
                key={p.title}
                className="card p-8 flex flex-col items-center text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className="text-primary-500 mb-4">{p.icon}</div>
                <h3 className="text-xl font-heading font-bold mb-2">{p.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{p.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Speaking CTA */}
        <div className="bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-2xl p-10 text-center">
          <h2 className="text-2xl md:text-3xl font-heading font-bold mb-4">Interested in a Speaking Engagement?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto text-white/90">
            Awokunle M. Kelechi is available for speaking engagements, book signings, and workshops.
            Get in touch to discuss how she can inspire your audience.
          </p>
          <Link to="/contact" className="btn bg-white text-primary-700 hover:bg-cream-100 px-8 py-3 font-medium inline-flex items-center gap-2">
            Get in Touch <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default AboutPage;
