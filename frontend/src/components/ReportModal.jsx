import React, { useState } from 'react';

const REPORT_REASONS = [
  'Harassment',
  'Inappropriate video',
  'Spam / bot',
  'Underage concern',
  'Other'
];

export function ReportModal({ isOpen, onClose, targetPeerId, onSubmit }) {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!reason) return;
    
    onSubmit({ targetPeerId, reason, details });
    setSubmitted(true);

    setTimeout(() => {
      setReason('');
      setDetails('');
      setSubmitted(false);
      onClose();
    }, 2000);
  };

  if (!isOpen) return null;

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <div className="bg-[#0a0a0f] border border-white/10 rounded-xl p-6 w-96 text-center">
          <h2 className="text-lg font-semibold text-white mb-2">Report Submitted</h2>
          <p className="text-sm text-white/70">
            Thank you. Room will be closed for safety.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-[#0a0a0f] border border-white/10 rounded-xl p-6 w-96">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Report User</h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white text-xl"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {/* Reason dropdown */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Reason
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-white/40"
            >
              <option value="">Select a reason...</option>
              {REPORT_REASONS.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Details textarea */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Additional details (optional)
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value.substring(0, 200))}
              placeholder="Tell us more..."
              maxLength={200}
              className="w-full h-24 bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2 text-sm placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-white/40 resize-none"
            />
            <p className="text-xs text-white/50 mt-1">
              {details.length}/200
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!reason}
            className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            Submit Report
          </button>
        </div>
      </div>
    </div>
  );
}
