import React from 'react';
import { AiOutlineClose, AiOutlineStar, AiOutlineCheckCircle, AiOutlineWarning } from 'react-icons/ai';

const AIReviewModal = ({ reviewData, isOpen, onClose }) => {
  if (!isOpen || !reviewData) return null;

  const { review, score, strengths, improvements } = reviewData;

  const getScoreColor = () => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-auto max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-800">AI Review Feedback</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-transform duration-200 hover:rotate-90"
          >
            <AiOutlineClose size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Score and Overall Review */}
          <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
            <div className="flex items-center gap-4 mb-3">
              <div className={`text-4xl font-extrabold ${getScoreColor()}`}>{score}</div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">Overall Score</h3>
                <p className="text-sm text-gray-500">Based on the submitted content.</p>
              </div>
            </div>
            <p className="text-gray-700 leading-relaxed">{review}</p>
          </div>

          {/* Strengths */}
          {strengths && strengths.length > 0 && (
            <div>
              <h3 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <AiOutlineCheckCircle className="text-green-500" size={20} />
                Strengths
              </h3>
              <ul className="space-y-2 list-inside">
                {strengths.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-600">
                    <span className="text-green-500 mt-1">&#8226;</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Improvements */}
          {improvements && improvements.length > 0 && (
            <div>
              <h3 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <AiOutlineWarning className="text-yellow-500" size={20} />
                Areas for Improvement
              </h3>
              <ul className="space-y-2 list-inside">
                {improvements.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-600">
                    <span className="text-yellow-500 mt-1">&#8226;</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-5 border-t border-gray-200 sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-semibold shadow-md hover:bg-indigo-700 transition-all duration-200"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIReviewModal;
