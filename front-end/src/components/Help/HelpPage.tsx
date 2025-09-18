import React, { useState } from 'react';
import { 
  HelpCircle, 
  Search, 
  BookOpen, 
  MessageSquare, 
  Users, 
  Calendar, 
  CreditCard, 
  Shield,
  ChevronDown,
  ChevronRight,
  Mail,
  Phone,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const HelpPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const faqs: FAQ[] = [
    {
      id: '1',
      question: 'How do I create an account?',
      answer: 'To create an account, click the "Get Started" button on the homepage, fill in your details including name, email, and password, and verify your email address.',
      category: 'getting-started'
    },
    {
      id: '2',
      question: 'How do I offer a skill?',
      answer: 'Go to your profile, click "Add Skill", select "Offer a Skill", choose your skill from the list, set your experience level, hourly rate, and provide a description.',
      category: 'skills'
    },
    {
      id: '3',
      question: 'How do I book a session?',
      answer: 'Browse skills on the Discover page, find a skill you want to learn, click "Book Session", select your preferred date and time, and confirm the booking.',
      category: 'sessions'
    },
    {
      id: '4',
      question: 'How does the credit system work?',
      answer: 'Credits are used to book learning sessions. You earn credits by teaching others and spend credits to learn from others. Each skill has a different credit cost per hour.',
      category: 'credits'
    },
    {
      id: '5',
      question: 'Can I cancel a session?',
      answer: 'Yes, you can cancel a session up to 24 hours before the scheduled time. Go to your Sessions page and click "Cancel" on the session you want to cancel.',
      category: 'sessions'
    },
    {
      id: '6',
      question: 'How do I message other users?',
      answer: 'You can message users by going to their profile and clicking "Message", or through the Messages page where you can see all your conversations.',
      category: 'messaging'
    },
    {
      id: '7',
      question: 'How are reviews and ratings calculated?',
      answer: 'After completing a session, both participants can leave reviews and ratings (1-5 stars). Your average rating is calculated from all reviews you receive.',
      category: 'reviews'
    },
    {
      id: '8',
      question: 'Is my personal information secure?',
      answer: 'Yes, we use industry-standard encryption and security measures to protect your personal information. We never share your data with third parties without consent.',
      category: 'security'
    },
    {
      id: '9',
      question: 'How do I add credits to my account?',
      answer: 'You can add credits by going to Settings > Account and clicking "Add Credits". We accept major credit cards and PayPal.',
      category: 'credits'
    },
    {
      id: '10',
      question: 'What if I have a dispute with another user?',
      answer: 'If you have a dispute, please contact our support team immediately. We have a mediation process to help resolve conflicts fairly.',
      category: 'support'
    }
  ];

  const categories = [
    { id: 'all', label: 'All Topics', icon: HelpCircle },
    { id: 'getting-started', label: 'Getting Started', icon: BookOpen },
    { id: 'skills', label: 'Skills', icon: Users },
    { id: 'sessions', label: 'Sessions', icon: Calendar },
    { id: 'messaging', label: 'Messaging', icon: MessageSquare },
    { id: 'credits', label: 'Credits', icon: CreditCard },
    { id: 'reviews', label: 'Reviews', icon: Users },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'support', label: 'Support', icon: HelpCircle }
  ];

  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4 flex items-center justify-center">
              <HelpCircle className="w-10 h-10 mr-3" />
              Help Center
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Find answers to common questions and get support
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search for help..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 text-gray-900 bg-white rounded-xl shadow-lg focus:ring-2 focus:ring-white focus:ring-opacity-50 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-blue-50 text-blue-600 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <category.icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{category.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* FAQ Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Frequently Asked Questions ({filteredFAQs.length})
                </h2>
              </div>

              <div className="p-6">
                {filteredFAQs.length > 0 ? (
                  <div className="space-y-4">
                    {filteredFAQs.map((faq, index) => (
                      <motion.div
                        key={faq.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border border-gray-200 rounded-lg"
                      >
                        <button
                          onClick={() => toggleFAQ(faq.id)}
                          className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                        >
                          <span className="font-medium text-gray-900">{faq.question}</span>
                          {expandedFAQ === faq.id ? (
                            <ChevronDown className="w-5 h-5 text-gray-500" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-gray-500" />
                          )}
                        </button>
                        
                        <AnimatePresence>
                          {expandedFAQ === faq.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="p-4 pt-0 text-gray-600 border-t border-gray-100">
                                {faq.answer}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
                    <p className="text-gray-600">
                      Try adjusting your search terms or browse different categories
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Support */}
            <div className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white overflow-hidden">
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-4">Still need help?</h3>
                <p className="text-blue-100 mb-6">
                  Can't find what you're looking for? Our support team is here to help.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Mail className="w-6 h-6" />
                    </div>
                    <h4 className="font-semibold mb-2">Email Support</h4>
                    <p className="text-sm text-blue-100 mb-3">Get help via email</p>
                    <a
                      href="mailto:support@skillswap.com"
                      className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors inline-block"
                    >
                      Contact Us
                    </a>
                  </div>

                  <div className="text-center">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <h4 className="font-semibold mb-2">Live Chat</h4>
                    <p className="text-sm text-blue-100 mb-3">Chat with our team</p>
                    <button className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors">
                      Start Chat
                    </button>
                  </div>

                  <div className="text-center">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Clock className="w-6 h-6" />
                    </div>
                    <h4 className="font-semibold mb-2">Response Time</h4>
                    <p className="text-sm text-blue-100 mb-3">We typically respond within</p>
                    <span className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium">
                      24 hours
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;