'use client';

import { ChevronLeft, Mail, Phone, MessageCircle, FileText, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FAQS = [
  {
    q: "How do I cancel my booking?",
    a: "You can cancel your booking from the 'My Bookings' section up to 24 hours before the scheduled time for a full refund."
  },
  {
    q: "When will I get my refund?",
    a: "Refunds are processed immediately but may take 3-5 business days to reflect in your original payment method."
  },
  {
    q: "How does the referral program work?",
    a: "Share your invite code with friends. When they sign up and complete their first booking, both of you will receive ₹200 off your next booking."
  },
  {
    q: "What happens if it rains?",
    a: "For outdoor turfs, bookings are generally non-refundable unless the turf owner officially closes the ground due to severe weather. Please contact the turf directly."
  }
];

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="min-h-dvh bg-gray-50 pb-safe">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="flex items-center px-4 h-14 md:h-16 max-w-2xl mx-auto">
          <Link href="/profile" className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
            <ChevronLeft className="w-6 h-6 text-gray-900" />
          </Link>
          <h1 className="text-lg font-bold text-gray-900 ml-2">Help & Support</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-6">
        {/* Contact Options */}
        <section>
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">Contact Us</h2>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <a href="mailto:support@playfield.app" className="flex items-center gap-4 p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">Email Support</h3>
                <p className="text-sm text-gray-500">support@playfield.app</p>
              </div>
            </a>
            <a href="tel:+919876543210" className="flex items-center gap-4 p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">Phone Support</h3>
                <p className="text-sm text-gray-500">+91 98765 43210 (10 AM - 7 PM)</p>
              </div>
            </a>
            <button className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors text-left">
              <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
                <MessageCircle className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">Live Chat</h3>
                <p className="text-sm text-gray-500">Typically replies in 5 minutes</p>
              </div>
            </button>
          </div>
        </section>

        {/* FAQs */}
        <section>
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">Frequently Asked Questions</h2>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className={`border-b border-gray-100 last:border-0`}>
                  <button 
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full text-left p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-sm font-semibold text-gray-900 pr-4">{faq.q}</span>
                    <ChevronDown className={`w-5 h-5 text-gray-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 text-sm text-gray-600 leading-relaxed">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>

        {/* Links */}
        <section>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <Link href="#" className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors border-b border-gray-100">
              <FileText className="w-5 h-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-900">Terms & Conditions</span>
            </Link>
            <Link href="#" className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors">
              <FileText className="w-5 h-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-900">Privacy Policy</span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
