const Habit = require('../models/Habit');

/**
 * @desc    Get all habits for current authenticated user
 * @route   GET /api/habits
 * @access  Private
 */
const getHabits = async (req, res, next) => {
  try {
    const habits = await Habit.find({ userId: req.user._id }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: habits.length,
      habits,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single habit by ID
 * @route   GET /api/habits/:id
 * @access  Private
 */
const getHabitById = async (req, res, next) => {
  try {
    const habit = await Habit.findById(req.params.id);

    if (!habit) {
      return res.status(404).json({
        success: false,
        message: 'Habit not found',
      });
    }

    // Verify ownership
    if (habit.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this habit',
      });
    }

    return res.status(200).json({
      success: true,
      habit,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new habit
 * @route   POST /api/habits
 * @access  Private
 */
const createHabit = async (req, res, next) => {
  try {
    const { title, type, why, startDate, frequency } = req.body;

    // Validate required fields
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Habit title is required',
      });
    }

    if (!type || !['build', 'quit'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Habit type must be either "build" or "quit"',
      });
    }

    if (!why || !why.trim()) {
      return res.status(400).json({
        success: false,
        message: 'The "Why" field is required. Explain why this habit is important to you.',
      });
    }

    const habit = await Habit.create({
      userId: req.user._id,
      title: title.trim(),
      type,
      why: why.trim(),
      startDate: startDate ? new Date(startDate) : new Date(),
      frequency: frequency || 'daily',
      currentStreak: 0,
      longestStreak: 0,
    });

    return res.status(201).json({
      success: true,
      message: 'Habit created successfully',
      habit,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a habit
 * @route   PUT /api/habits/:id
 * @access  Private
 */
const updateHabit = async (req, res, next) => {
  try {
    const habit = await Habit.findById(req.params.id);

    if (!habit) {
      return res.status(404).json({
        success: false,
        message: 'Habit not found',
      });
    }

    // Verify ownership
    if (habit.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this habit',
      });
    }

    const { title, type, why, startDate, frequency, currentStreak, longestStreak } = req.body;

    if (title !== undefined) habit.title = title.trim();
    if (type !== undefined) {
      if (!['build', 'quit'].includes(type)) {
        return res.status(400).json({
          success: false,
          message: 'Type must be either "build" or "quit"',
        });
      }
      habit.type = type;
    }
    if (why !== undefined) {
      if (!why.trim()) {
        return res.status(400).json({
          success: false,
          message: 'The "Why" field cannot be empty',
        });
      }
      habit.why = why.trim();
    }
    if (startDate !== undefined) habit.startDate = new Date(startDate);
    if (frequency !== undefined) habit.frequency = frequency;
    if (currentStreak !== undefined) {
      habit.currentStreak = Math.max(0, Number(currentStreak) || 0);
      if (habit.currentStreak > habit.longestStreak) {
        habit.longestStreak = habit.currentStreak;
      }
    }
    if (longestStreak !== undefined) {
      habit.longestStreak = Math.max(habit.currentStreak, Number(longestStreak) || 0);
    }

    await habit.save();

    return res.status(200).json({
      success: true,
      message: 'Habit updated successfully',
      habit,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a habit
 * @route   DELETE /api/habits/:id
 * @access  Private
 */
const deleteHabit = async (req, res, next) => {
  try {
    const habit = await Habit.findById(req.params.id);

    if (!habit) {
      return res.status(404).json({
        success: false,
        message: 'Habit not found',
      });
    }

    // Verify ownership
    if (habit.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this habit',
      });
    }

    await habit.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Habit deleted successfully',
      id: req.params.id,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Quick increment or reset streak for a habit
 * @route   PATCH /api/habits/:id/streak
 * @access  Private
 */
const updateStreak = async (req, res, next) => {
  try {
    const habit = await Habit.findById(req.params.id);

    if (!habit) {
      return res.status(404).json({
        success: false,
        message: 'Habit not found',
      });
    }

    // Verify ownership
    if (habit.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this habit',
      });
    }

    const { action } = req.body; // 'increment', 'decrement', 'reset'

    if (action === 'increment') {
      habit.currentStreak += 1;
      if (habit.currentStreak > habit.longestStreak) {
        habit.longestStreak = habit.currentStreak;
      }
    } else if (action === 'decrement') {
      habit.currentStreak = Math.max(0, habit.currentStreak - 1);
    } else if (action === 'reset') {
      habit.currentStreak = 0;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Action must be "increment", "decrement", or "reset"',
      });
    }

    await habit.save();

    return res.status(200).json({
      success: true,
      message: `Streak updated (${action})`,
      habit,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getHabits,
  getHabitById,
  createHabit,
  updateHabit,
  deleteHabit,
  updateStreak,
};
