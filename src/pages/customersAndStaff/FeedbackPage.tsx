import React, { useState } from 'react';
import {
  MessageSquareQuote,
  Star,
  Search,
  Filter,
  Eye,
  MessageCircle,
  CheckCircle2,
  Calendar,
  Send
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Feedback } from '../../types';

export const FeedbackPage: React.FC = () => {
  const { feedback, replyFeedback } = useApp();

  const [ratingFilter, setRatingFilter] = useState('All');
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [replyText, setReplyText] = useState('');

  const filteredFeedback = feedback.filter(f => {
    if (ratingFilter !== 'All' && f.rating !== Number(ratingFilter)) return false;
    return true;
  });

  const handleOpenReply = (f: Feedback) => {
    setSelectedFeedback(f);
    setReplyText(f.managerReply || '');
    setReplyModalOpen(true);
  };

  const handleSendReply = () => {
    if (selectedFeedback && replyText.trim()) {
      replyFeedback(selectedFeedback.id, replyText.trim());
      setReplyModalOpen(false);
      alert('Manager response sent and feedback marked Reviewed.');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
            Customer Feedback & Dining Reviews
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Guest ratings across food quality, hospitality, and ambience with verified manager replies
          </p>
        </div>
      </div>

      {/* Ratings Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex items-center gap-3">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Star className="w-6 h-6 fill-amber-400" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase text-gray-400">Average Dining Score</p>
            <p className="text-2xl font-black text-gray-900">4.8 / 5.0</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex items-center gap-3">
          <div className="p-3 bg-orange-50 text-[#f5764b] rounded-xl">
            <MessageSquareQuote className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase text-gray-400">Total Reviews Logged</p>
            <p className="text-2xl font-black text-gray-900">{feedback.length}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex items-center gap-3">
          <div className="p-3 bg-green-50 text-green-600 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase text-gray-400">Response Rate</p>
            <p className="text-2xl font-black text-green-700">100% Resolved</p>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-xl border border-gray-200 p-3.5 shadow-2xs flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-500">Filter by Star Rating:</span>
          {['All', '5', '4', '3', '2', '1'].map(r => (
            <button
              key={r}
              onClick={() => setRatingFilter(r)}
              className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                ratingFilter === r ? 'bg-[#f5764b] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {r === 'All' ? 'All Ratings' : `${r} ★`}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews Cards List */}
      <div className="space-y-4">
        {filteredFeedback.map(f => (
          <div
            key={f.id}
            className="bg-white rounded-xl border border-gray-200 p-5 shadow-2xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-sm text-gray-900">{f.customerName}</span>
                {f.orderNumber && (
                  <span className="text-xs text-gray-400 font-mono ml-2">Order {f.orderNumber}</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${star <= f.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`}
                  />
                ))}
                <span className="text-xs font-bold text-gray-700 ml-1.5">{f.rating}.0</span>
              </div>
            </div>

            <p className="text-xs text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">
              "{f.comment}"
            </p>

            <div className="flex items-center gap-4 text-[11px] text-gray-500 font-medium">
              <span>Food: <strong className="text-gray-800">{f.foodRating}/5</strong></span>
              <span>Service: <strong className="text-gray-800">{f.serviceRating}/5</strong></span>
              <span>Ambience: <strong className="text-gray-800">{f.ambienceRating}/5</strong></span>
              <span className="ml-auto text-gray-400">{f.createdAt}</span>
            </div>

            {/* Manager Reply Display */}
            {f.managerReply ? (
              <div className="p-3 bg-orange-50/60 rounded-xl border border-orange-200/60 text-xs">
                <span className="font-bold text-orange-950 block mb-0.5">Manager Response:</span>
                <p className="text-orange-950">{f.managerReply}</p>
              </div>
            ) : (
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => handleOpenReply(f)}
                  className="px-3 py-1.5 bg-[#f5764b] hover:bg-[#e05a2b] text-white rounded-lg text-xs font-bold flex items-center gap-1"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Send Manager Reply</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Reply Modal */}
      {replyModalOpen && selectedFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/30 ">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xs border border-gray-200 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-gray-900">
              Reply to {selectedFeedback.customerName}'s Review
            </h3>
            <p className="text-xs text-gray-500 italic">"{selectedFeedback.comment}"</p>

            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={4}
              placeholder="Write a personalized hospitality response..."
              className="w-full p-2.5 border border-gray-300 rounded-xl text-xs outline-none"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setReplyModalOpen(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSendReply}
                className="px-4 py-2 bg-[#f5764b] hover:bg-[#e05a2b] text-white rounded-lg text-xs font-bold flex items-center gap-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Response</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
