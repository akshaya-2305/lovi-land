import React, { useState, useEffect } from 'react';
import { X, Sparkles, Ban, Heart, Calendar, Clock, AlertCircle, Flame } from 'lucide-react';

export default function HabitModal({ isOpen, onClose, onSave, initialData = null }) {
  const [formData, setFormData] = useState({
    title: '',
    type: 'build',
    why: '',
    frequency: 'daily',
    startDate: new Date().toISOString().split('T')[0],
    currentStreak: 0,
    longestStreak: 0,
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        type: initialData.type || 'build',
        why: initialData.why || '',
        frequency: initialData.frequency || 'daily',
        startDate: initialData.startDate
          ? new Date(initialData.startDate).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        currentStreak: initialData.currentStreak || 0,
        longestStreak: initialData.longestStreak || 0,
      });
    } else {
      setFormData({
        title: '',
        type: 'build',
        why: '',
        frequency: 'daily',
        startDate: new Date().toISOString().split('T')[0],
        currentStreak: 0,
        longestStreak: 0,
      });
    }
    setErrorMessage('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errorMessage) setErrorMessage('');
  };

  const handleTypeSelect = (type) => {
    setFormData((prev) => ({
      ...prev,
      type,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.title.trim()) {
      setErrorMessage('Please enter a habit title.');
      return;
    }

    if (!formData.why.trim()) {
      setErrorMessage('The "Why" field is required. Explain why this habit is important.');
      return;
    }

    setSubmitting(true);
    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to save habit');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-xl glass-card rounded-2xl border border-slate-700/80 shadow-2xl p-6 sm:p-8 my-8 text-slate-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {initialData ? 'Edit Habit' : 'Track New Habit'}
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Define your habit, select whether to build or quit, and root it in your core motivation.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center space-x-2 text-red-400 text-sm animate-fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Habit Title */}
          <div>
            <label htmlFor="title" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Habit Title <span className="text-emerald-400">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. 20-Minute Morning Jog, Read 10 Pages, No Late Night Snacks"
              className="w-full px-4 py-2.5 bg-slate-900/90 text-white placeholder-slate-500 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-sm"
            />
          </div>

          {/* Habit Type Selection (Required) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Habit Type <span className="text-emerald-400">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Build Type Option */}
              <button
                type="button"
                onClick={() => handleTypeSelect('build')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  formData.type === 'build'
                    ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/30'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center space-x-2 mb-1">
                  <Sparkles className={`w-4 h-4 ${formData.type === 'build' ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span className="font-semibold text-sm">Build Habit</span>
                </div>
                <p className="text-xs text-slate-400">
                  Cultivate a positive daily routine or habit.
                </p>
              </button>

              {/* Quit Type Option */}
              <button
                type="button"
                onClick={() => handleTypeSelect('quit')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  formData.type === 'quit'
                    ? 'bg-rose-500/15 border-rose-500 text-rose-300 ring-2 ring-rose-500/30'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center space-x-2 mb-1">
                  <Ban className={`w-4 h-4 ${formData.type === 'quit' ? 'text-rose-400' : 'text-slate-400'}`} />
                  <span className="font-semibold text-sm">Quit Habit</span>
                </div>
                <p className="text-xs text-slate-400">
                  Break an unwanted pattern or negative vice.
                </p>
              </button>
            </div>
          </div>

          {/* The "Why" Field (Required) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="why" className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Your "Why" (Motivation) <span className="text-emerald-400">*</span>
              </label>
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Heart className="w-3 h-3 text-rose-400" />
                Required for lasting focus
              </span>
            </div>
            <textarea
              id="why"
              name="why"
              rows={3}
              required
              value={formData.why}
              onChange={handleChange}
              placeholder="Why does this habit matter to you? How will staying consistent transform your health, career, or well-being?"
              className="w-full px-4 py-2.5 bg-slate-900/90 text-white placeholder-slate-500 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-sm resize-none"
            />
          </div>

          {/* Frequency & Start Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="frequency" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Frequency
              </label>
              <div className="relative">
                <select
                  id="frequency"
                  name="frequency"
                  value={formData.frequency}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-900 text-white rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-sm appearance-none cursor-pointer"
                >
                  <option value="daily">Daily (Every day)</option>
                  <option value="weekdays">Weekdays (Mon - Fri)</option>
                  <option value="weekly">Weekly (Once a week)</option>
                </select>
                <Clock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label htmlFor="startDate" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Start Date
              </label>
              <div className="relative">
                <input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-900 text-white rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-sm cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* If Editing: Optional streak adjustment */}
          {initialData && (
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-800">
              <div>
                <label htmlFor="currentStreak" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Current Streak
                </label>
                <div className="relative">
                  <input
                    id="currentStreak"
                    name="currentStreak"
                    type="number"
                    min="0"
                    value={formData.currentStreak}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-slate-900 text-white rounded-xl border border-slate-700 text-sm"
                  />
                  <Flame className="w-4 h-4 text-amber-400 absolute right-3 top-2.5 pointer-events-none" />
                </div>
              </div>

              <div>
                <label htmlFor="longestStreak" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Longest Streak
                </label>
                <input
                  id="longestStreak"
                  name="longestStreak"
                  type="number"
                  min="0"
                  value={formData.longestStreak}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-900 text-white rounded-xl border border-slate-700 text-sm"
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-60 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              {submitting ? 'Saving...' : initialData ? 'Save Changes' : 'Create Habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
