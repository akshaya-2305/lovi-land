const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required for a habit'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a habit title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    type: {
      type: String,
      required: [true, 'Habit type is required'],
      enum: {
        values: ['build', 'quit'],
        message: 'Type must be either "build" or "quit"',
      },
    },
    why: {
      type: String,
      required: [true, 'Please explain your "Why" - why this habit matters to you'],
      trim: true,
      maxlength: [500, 'Your "Why" explanation cannot exceed 500 characters'],
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'weekdays'],
      default: 'daily',
    },
    currentStreak: {
      type: Number,
      default: 0,
      min: [0, 'Current streak cannot be negative'],
    },
    longestStreak: {
      type: Number,
      default: 0,
      min: [0, 'Longest streak cannot be negative'],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Habit', habitSchema);
