import Review from './models/review.js';
import GuestReview from './models/guestReview.js';

/**
 * Повертає всі рев’ю: і від користувачів, і від гостей
 */
export async function getReviews(req, res) {
  try {
    const userReviews = await Review.find().populate('user', 'username email');
    const guestReviews = await GuestReview.find();
    res.json([...userReviews, ...guestReviews]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

/**
 * Створює рев’ю. Якщо req.user — прив’язує до нього,
 * інакше — зберігає в колекцію GuestReview.
 */
export async function createReview(req, res) {
  const { name, rating, comment } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  try {
    if (req.user) {
      const r = new Review({ name, rating, comment, user: req.user._id });
      await r.save();
      req.user.reviews.push(r._id);
      await req.user.save();
      return res.status(201).json(r);
    }
    const guest = new GuestReview({ name, rating, comment });
    await guest.save();
    res.status(201).json(guest);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

/**
 * Повертає тільки рев’ю конкретного користувача —
 * захищений маршрутом authenticate
 */
export async function getUserReviews(req, res) {
  try {
    const reviews = await Review.find({ user: req.params.userId }).populate('user', 'username');
    res.json(reviews);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}