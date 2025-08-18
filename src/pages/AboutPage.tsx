import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Book, Award, MessageSquare, Users, Heart } from 'lucide-react';

const AboutPage = () => {
  useEffect(() => {
    // Update page title
    document.title = 'About the Author | KellyInkspired';
    
    // Scroll to top on component mount
    window.scrollTo(0, 0);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="pt-12 pb-20"
    >
      {/* Header Banner */}
      <div className="bg-primary-700 dark:bg-primary-800 text-white py-12 mb-12">
        <div className="container-custom">
          <h1 className="text-3xl md:text-4xl font-heading font-bold mb-4">
            About the Author
          </h1>
          <p className="text-lg text-gray-100 max-w-2xl">
            Learn more about Awokunle M. Kelechi and her mission to inspire 
            through faith-based storytelling.
          </p>
        </div>
      </div>
      
      <div className="container-custom">
        {/* Author Bio */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <motion.div 
            className="relative"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="relative z-10 rounded-lg overflow-hidden shadow-xl">
              <img 
                src="https://imgur.com/rVDO2BX.png" 
                alt="Awokunle M. Kelechi" 
                className="w-full h-auto object-cover"
              />
            </div>
            {/* Decorative elements */}
            <div className="absolute -left-4 -bottom-4 w-full h-full border-2 border-primary-500 dark:border-primary-400 rounded-lg z-0" />
            <div className="absolute top-4 -right-4 w-24 h-24 bg-accent-500/20 rounded-full z-0 blur-lg" />
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-3xl font-heading font-bold mb-6 text-gray-800 dark:text-gray-100">
              Awokunle M. Kelechi
            </h2>
            <h3 className="text-xl text-primary-600 dark:text-primary-400 mb-4">
              Award-winning Writer & Faith-based Storyteller
            </h3>
            
            <div className="prose prose-lg dark:prose-invert mb-6">
              <p>
                Awokunle M. Kelechi is an award-winning writer, storyteller, public speaker, 
                and teenage coach dedicated to inspiring lives through faith-based storytelling 
                and transformational messages.
              </p>
              <p>
                With five published books to her name, she has collaborated with numerous 
                authors and writers in bringing impactful stories to life. She is the visionary 
                behind Hearts and Purpose, an event designed to empower individuals in discovering 
                their purpose, deepening their faith, and embracing personal growth.
              </p>
              <p>
                Her passion for helping teenagers navigate life's challenges has led her to develop 
                specialized coaching programs that combine spiritual guidance with practical life skills. 
                Through her writing and speaking engagements, she has touched countless lives, offering 
                wisdom, encouragement, and inspiration.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <div className="bg-primary-50 dark:bg-primary-900/20 px-4 py-2 rounded-full text-primary-700 dark:text-primary-300 flex items-center">
                <Book size={16} className="mr-2" />
                <span>Author</span>
              </div>
              <div className="bg-secondary-50 dark:bg-secondary-900/20 px-4 py-2 rounded-full text-secondary-700 dark:text-secondary-300 flex items-center">
                <MessageSquare size={16} className="mr-2" />
                <span>Speaker</span>
              </div>
              <div className="bg-accent-50 dark:bg-accent-900/20 px-4 py-2 rounded-full text-accent-700 dark:text-accent-300 flex items-center">
                <Users size={16} className="mr-2" />
                <span>Mentor</span>
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-full text-gray-700 dark:text-gray-300 flex items-center">
                <Heart size={16} className="mr-2" />
                <span>Visionary</span>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Author Achievements */}
        <div className="mb-16">
          <h2 className="text-2xl font-heading font-bold mb-8 text-center text-gray-800 dark:text-gray-100">
            Achievements & Impact
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <Book size={32} />,
                title: '5+ Published Books',
                description: 'Author of multiple impactful books that have touched the lives of readers worldwide.',
              },
              {
                icon: <Award size={32} />,
                title: 'Award-Winning Writer',
                description: 'Recognized for excellence in faith-based storytelling and transformational writing.',
              },
              {
                icon: <Users size={32} />,
                title: 'Youth Mentorship',
                description: 'Dedicated to guiding teenagers through life\'s challenges with faith and purpose.',
              },
              { 
                icon: <Heart size={32} />,
                title: 'Hearts and Purpose',
                description: 'Founder of an event dedicated to helping people discover their divine purpose.',
              },
            ].map((item, index) => (
              <motion.div 
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 flex flex-col items-center text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="text-primary-600 dark:text-primary-400 mb-4">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-100">
                  {item.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Timeline */}
        <div className="mb-16">
          <h2 className="text-2xl font-heading font-bold mb-8 text-center text-gray-800 dark:text-gray-100">
            Writing Journey
          </h2>
          
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-primary-200 dark:bg-primary-800"></div>
            
            {/* Timeline events */}
            <div className="space-y-12">
              {[
                {
                  year: '2018',
                  title: 'First Book Published',
                  description: 'Published debut book "Walking in Divine Wisdom" to critical acclaim.',
                },
                {
                  year: '2020',
                  title: 'Hearts and Purpose Founded',
                  description: 'Established the Hearts and Purpose event to help individuals discover their purpose.',
                },
                {
                  year: '2021',
                  title: 'Writing Award',
                  description: 'Received prestigious award for contributions to faith-based literature.',
                },
                {
                  year: '2022',
                  title: 'Youth Mentorship Program',
                  description: 'Launched specialized coaching program for teenagers seeking guidance.',
                },
                {
                  year: '2023',
                  title: 'Fifth Book Released',
                  description: 'Released fifth book "Stories of Grace" exploring divine intervention in everyday life.',
                },
              ].map((event, index) => (
                <motion.div 
                  key={index}
                  className={`flex items-center ${index % 2 === 0 ? 'flex-row-reverse' : ''}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <div className="w-1/2"></div>
                  
                  {/* Timeline marker */}
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-primary-500 dark:bg-primary-600 z-10 flex items-center justify-center text-white">
                      {index + 1}
                    </div>
                  </div>
                  
                  <div className={`w-1/2 ${index % 2 === 0 ? 'text-right pr-8' : 'pl-8'}`}>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md inline-block">
                      <span className="text-accent-500 dark:text-accent-400 font-bold">
                        {event.year}
                      </span>
                      <h3 className="text-lg font-bold mb-2 text-gray-800 dark:text-gray-100">
                        {event.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {event.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Contact for Speaking */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white rounded-xl p-8 text-center">
          <h2 className="text-2xl font-heading font-bold mb-4">
            Interested in a Speaking Engagement?
          </h2>
          <p className="text-lg mb-6 max-w-2xl mx-auto">
            Awokunle M. Kelechi is available for speaking engagements, book signings, 
            and workshops. Get in touch to discuss how she can inspire your audience.
          </p>
          <a
               href="https://wa.me/message/6UKR5DLZVOFWH1"
              className="btn bg-white text-primary-700 hover:bg-gray-100 px-8 py-3 rounded-lg font-medium inline-block"
                        >
                    Contact for Speaking
              </a>

        </div>
      </div>
    </motion.div>
  );
};

export default AboutPage;