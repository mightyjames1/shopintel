import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Check } from 'lucide-react';

const TermsModal = ({ isOpen, onAccept, onClose }) => {
  const [readAll, setReadAll] = useState(false);

  const termsContent = [
    {
      title: "Data Ownership",
      content: "You retain full ownership of all data you upload to ShopIntel. We do not claim any ownership rights to your data."
    },
    {
      title: "Privacy Commitment",
      content: "Your data is private by default. It is never shared, sold, or used for training models without your explicit consent. Admins can only see metadata (file names, sizes, timestamps)."
    },
    {
      title: "Forecast Disclaimer",
      content: "All sales forecasts are probabilistic estimates based on historical patterns. They are not guarantees of future performance. You are solely responsible for business decisions made using these insights."
    },
    {
      title: "Service Limitations",
      content: "ShopIntel is provided 'AS IS' without warranties. We are not liable for financial losses, inventory decisions, or business outcomes resulting from platform usage."
    },
    {
      title: "Account Management",
      content: "Accounts inactive for 30 days are automatically deactivated. You can request deletion of your data at any time. We comply with data protection regulations."
    },
    {
      title: "Acceptable Use",
      content: "You agree not to upload malicious content, attempt unauthorized access, or use the service for illegal activities. Violations may result in account termination."
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 overflow-y-auto"
        >
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 transition-opacity bg-black bg-opacity-50"
              onClick={onClose}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="inline-block align-bottom bg-white rounded-2xl shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full"
            >
              <div className="px-6 pt-6 pb-4">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <AlertTriangle className="w-8 h-8 text-amber-500 mr-3" />
                    <h3 className="text-2xl font-bold text-gray-900">
                      Terms & Conditions
                    </h3>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Warning Banner */}
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex">
                    <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
                    <p className="text-sm text-red-800">
                      <strong>Important:</strong> You must read and accept these terms to use ShopIntel. 
                      Pay special attention to the forecast disclaimer and privacy sections.
                    </p>
                  </div>
                </div>

                {/* Terms Content */}
                <div className="max-h-96 overflow-y-auto pr-4 space-y-6">
                  {termsContent.map((term, index) => (
                    <div key={index} className="border-b border-gray-200 pb-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                        <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-3">
                          {index + 1}
                        </span>
                        {term.title}
                      </h4>
                      <p className="text-gray-600 ml-11">{term.content}</p>
                    </div>
                  ))}
                </div>

                {/* Scroll to bottom indicator */}
                {!readAll && (
                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-500 animate-pulse">
                      Please scroll to read all terms
                    </p>
                  </div>
                )}

                {/* Acceptance Section */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="accept-terms"
                        type="checkbox"
                        checked={readAll}
                        onChange={(e) => setReadAll(e.target.checked)}
                        className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <label
                        htmlFor="accept-terms"
                        className="ml-3 text-gray-700"
                      >
                        <span className="font-medium">
                          I have read and understand all terms
                        </span>
                        <p className="text-sm text-gray-500 mt-1">
                          You must check this box to proceed
                        </p>
                      </label>
                    </div>

                    <div className="flex space-x-4">
                      <button
                        onClick={onClose}
                        className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={onAccept}
                        disabled={!readAll}
                        className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center ${
                          readAll
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg transform hover:-translate-y-0.5'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <Check className="w-5 h-5 mr-2" />
                        Accept & Continue
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TermsModal;