import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import HabitModal from '../components/HabitModal';
import {
  Sparkles,
  Ban,
  Plus,
  Flame,
  CheckCircle2,
  Calendar,
  Clock,
  Pencil,
  Trash2,
  Search,
  Trophy,
  Target,
  Quote,
  RotateCcw,
  Loader2,
  AlertCircle,
} from 'lucide-react';

export default function Habits() {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all'); // 'all', 'build', 'quit'
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);

  // Notification Toast State
  const [feedback, setFeedback] = useState(null);

  // Delete Confirmation State
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const fetchHabits = async () => {
    try {
      setLoading(true);
      const res = await api.get('/habits');
      setHabits(res.data.habits || []);
    } catch (err) {
      console.error('Failed to load habits:', err);
      showFeedback('error', err.response?.data?.message || 'Failed to fetch habits');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  const showFeedback = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleOpenCreate = () => {
    setEditingHabit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (habit) => {
    setEditingHabit(habit);
    setIsModalOpen(true);
  };

  const handleSaveHabit = async (formData) => {
    try {
      if (editingHabit) {
        const res = await api.put(`/habits/${editingHabit._id}`, formData);
        setHabits((prev) =>
          prev.map((h) => (h._id === editingHabit._id ? res.data.habit : h))
        );
        showFeedback('success', 'Habit updated successfully!');
      } else {
        const res = await api.post('/habits', formData);
        setHabits((prev) => [res.data.habit, ...prev]);
        showFeedback('success', 'New habit created successfully!');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save habit';
      showFeedback('error', msg);
      throw new Error(msg);
    }
  };

  const handleDeleteHabit = async (id) => {
    try {
      await api.delete(`/habits/${id}`);
      setHabits((prev) => prev.filter((h) => h._id !== id));
      setDeleteConfirmId(null);
      showFeedback('success', 'Habit removed successfully.');
    } catch (err) {
      showFeedback('error', err.response?.data?.message || 'Failed to delete habit');
    }
  };

  const handleStreakAction = async (id, action) => {
    try {
      const res = await api.patch(`/habits/${id}/streak`, { action });
      setHabits((prev) =>
        prev.map((h) => (h._id === id ? res.data.habit : h))
      );
      if (action === 'increment') {
        showFeedback('success', 'Streak checked in! Keep the momentum going! 🔥');
      } else if (action === 'reset') {
        showFeedback('info', 'Streak reset. Every day is a fresh opportunity!');
      }
    } catch (err) {
      showFeedback('error', err.response?.data?.message || 'Failed to update streak');
    }
  };

  // Filtered Habits
  const filteredHabits = habits.filter((habit) => {
    const matchesType = filterType === 'all' || habit.type === filterType;
    const matchesSearch =
      habit.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      habit.why.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Calculate Metrics
  const buildHabitsCount = habits.filter((h) => h.type === 'build').length;
  const quitHabitsCount = habits.filter((h) => h.type === 'quit').length;
  const bestStreak = habits.reduce(
    (max, h) => Math.max(max, h.longestStreak || 0, h.currentStreak || 0),
    0
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Feedback Toast */}
      {feedback && (
        <div
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl shadow-2xl flex items-center space-x-3 text-sm font-medium animate-slide-up border ${
            feedback.type === 'success'
              ? 'bg-emerald-950/95 border-emerald-500/50 text-emerald-300'
              : feedback.type === 'info'
              ? 'bg-blue-950/95 border-blue-500/50 text-blue-300'
              : 'bg-rose-950/95 border-rose-500/50 text-rose-300'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
            <Target className="w-3.5 h-3.5" />
            <span>Habit Tracking System</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            My Habits & Routines
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Build empowering habits, quit unwanted vices, and stay anchored in your "Why".
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 active:scale-[0.99] transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          <span>New Habit</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Total Habits
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white">{habits.length}</span>
            <Target className="w-5 h-5 text-slate-500" />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block">
            Habits to Build
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white">{buildHabitsCount}</span>
            <Sparkles className="w-5 h-5 text-emerald-400" />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider block">
            Habits to Quit
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white">{quitHabitsCount}</span>
            <Ban className="w-5 h-5 text-rose-400" />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider block">
            Longest Record
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white">{bestStreak} <span className="text-sm font-normal text-slate-400">days</span></span>
            <Trophy className="w-5 h-5 text-amber-400" />
          </div>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="glass-card rounded-2xl p-4 mb-8 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Type Filter Tabs */}
        <div className="flex items-center space-x-1 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800 w-full sm:w-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filterType === 'all'
                ? 'bg-slate-800 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({habits.length})
          </button>
          <button
            onClick={() => setFilterType('build')}
            className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filterType === 'build'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-emerald-400'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Build ({buildHabitsCount})</span>
          </button>
          <button
            onClick={() => setFilterType('quit')}
            className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filterType === 'quit'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                : 'text-slate-400 hover:text-rose-400'
            }`}
          >
            <Ban className="w-3.5 h-3.5" />
            <span>Quit ({quitHabitsCount})</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search title or motivation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900/90 text-sm text-white placeholder-slate-500 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>
      </div>

      {/* Habit List Content */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mb-3" />
          <p className="text-sm font-medium">Loading your habits...</p>
        </div>
      ) : filteredHabits.length === 0 ? (
        /* Empty State */
        <div className="glass-card rounded-3xl p-12 text-center border border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400 mb-4">
            <Target className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">No habits found</h2>
          <p className="mt-2 text-sm text-slate-400 max-w-md mx-auto">
            {searchQuery || filterType !== 'all'
              ? 'No habits match your active filter. Try resetting your search or filter options.'
              : 'You haven’t created any habits yet. Start tracking your first habit to build momentum!'}
          </p>
          <button
            onClick={handleOpenCreate}
            className="mt-6 inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Habit</span>
          </button>
        </div>
      ) : (
        /* Habits Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHabits.map((habit) => {
            const isBuild = habit.type === 'build';
            const isDeleting = deleteConfirmId === habit._id;

            return (
              <div
                key={habit._id}
                className="glass-card glass-card-hover rounded-2xl p-6 border border-slate-800 flex flex-col justify-between relative overflow-hidden group"
              >
                {/* Background accent glow */}
                <div
                  className={`absolute -top-16 -right-16 w-32 h-32 rounded-full blur-2xl pointer-events-none transition-opacity ${
                    isBuild ? 'bg-emerald-500/10' : 'bg-rose-500/10'
                  }`}
                />

                <div>
                  {/* Top Bar: Type Badge & Action Buttons */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    {/* Badge */}
                    <span
                      className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                        isBuild
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                      }`}
                    >
                      {isBuild ? (
                        <>
                          <Sparkles className="w-3 h-3" />
                          <span>Build Habit</span>
                        </>
                      ) : (
                        <>
                          <Ban className="w-3 h-3" />
                          <span>Quit Habit</span>
                        </>
                      )}
                    </span>

                    {/* Card Actions */}
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleOpenEdit(habit)}
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Edit Habit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(habit._id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Delete Habit"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Habit Title */}
                  <h3 className="text-lg font-bold text-white tracking-tight group-hover:text-emerald-300 transition-colors">
                    {habit.title}
                  </h3>

                  {/* Required "Why" Callout Box */}
                  <div className="mt-3.5 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 relative">
                    <div className="flex items-center space-x-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      <Quote className="w-3 h-3 text-emerald-400" />
                      <span>The "Why" Behind This:</span>
                    </div>
                    <p className="text-xs text-slate-300 italic leading-relaxed">
                      "{habit.why}"
                    </p>
                  </div>

                  {/* Metadata: Frequency & Start Date */}
                  <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                    <span className="inline-flex items-center space-x-1 capitalize">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{habit.frequency}</span>
                    </span>

                    <span className="inline-flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>
                        {new Date(habit.startDate).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Bottom Section: Streak Counter & Actions */}
                <div className="mt-6 pt-4 border-t border-slate-800/80">
                  <div className="flex items-center justify-between mb-4">
                    {/* Current Streak */}
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                          habit.currentStreak > 0
                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        <Flame className={`w-5 h-5 ${habit.currentStreak > 0 ? 'animate-pulse' : ''}`} />
                      </div>
                      <div>
                        <div className="text-lg font-bold text-white leading-tight">
                          {habit.currentStreak}{' '}
                          <span className="text-xs font-normal text-slate-400">days</span>
                        </div>
                        <div className="text-[11px] text-slate-500">Current Streak</div>
                      </div>
                    </div>

                    {/* Best Streak */}
                    <div className="text-right">
                      <div className="text-sm font-semibold text-slate-300 leading-tight">
                        {habit.longestStreak || habit.currentStreak || 0} d
                      </div>
                      <div className="text-[11px] text-slate-500">Personal Best</div>
                    </div>
                  </div>

                  {/* Streak Increment / Reset Controls */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleStreakAction(habit._id, 'increment')}
                      className={`flex-1 flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isBuild
                          ? 'bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300'
                          : 'bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Check In (+1 Day)</span>
                    </button>

                    <button
                      onClick={() => handleStreakAction(habit._id, 'reset')}
                      className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                      title="Reset Streak to 0"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Delete Confirmation Overlay */}
                  {isDeleting && (
                    <div className="mt-3 p-3 rounded-xl bg-red-950/90 border border-red-500/40 text-xs text-red-200 animate-fade-in">
                      <p className="font-semibold mb-2">Delete this habit and all streak history?</p>
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleDeleteHabit(habit._id)}
                          className="px-2.5 py-1 rounded bg-red-600 text-white font-semibold hover:bg-red-500"
                        >
                          Confirm Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Habit Create / Edit Modal */}
      <HabitModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveHabit}
        initialData={editingHabit}
      />
    </div>
  );
}
