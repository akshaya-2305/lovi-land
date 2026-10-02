const express = require('express');
const router = express.Router();
const {
  getHabits,
  getHabitById,
  createHabit,
  updateHabit,
  deleteHabit,
  updateStreak,
} = require('../controllers/habitController');
const { protect } = require('../middleware/authMiddleware');

// All habit routes are protected by JWT authentication
router.use(protect);

router.route('/')
  .get(getHabits)
  .post(createHabit);

router.route('/:id')
  .get(getHabitById)
  .put(updateHabit)
  .delete(deleteHabit);

router.patch('/:id/streak', updateStreak);

module.exports = router;
