import Review from '../models/review.js';
import { t } from '../localisation.js';
import { getUserLanguage } from '../utils/langDetector.js';
import UserModel from '../models/user.js';
import logger from '../config/logger.js';



export async function getReviews(req, res) {
  try {
   const reviews = await Review.find()
   .populate('user', 'fullname email')
   .sort({createdAt: -1});
   res.json(reviews)
  } catch (e) {
    logger.error("Помилка отримання відгуків", {
      error: e.message,
      stack: e.stack
    });
    res.status(500).json({ error: e.message });
  }
}


export async function createReview(req, res) {
  const { rating, comment } = req.body;
  const userLang = getUserLanguage(req);
  
  if (!req.userId) {
    return res.status(401).json({ error: t(userLang, "errors.review.auth_required") });
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: t(userLang, "errors.review.rating_range") });
  }

  try {
    const review = new Review({
      rating, 
      comment, 
      user: req.userId
    });
    
    await review.save();
    
    // 👈 ВИПРАВЛЕННЯ: Спочатку перевіряємо чи існує користувач
    const user = await UserModel.findById(req.userId);
    if (user) {
      // Перевіряємо чи існує масив reviews, якщо ні - створюємо
      if (!user.reviews) {
        user.reviews = [];
      }
      user.reviews.push(review._id);
      await user.save();
    }
    
    const populatedReview = await Review.findById(review._id)
      .populate('user', 'fullName email');
    
    // 👈 ВАЖЛИВО: Повертаємо успішну відповідь з повідомленням
    res.status(201).json({
      ...populatedReview._doc,
      message: t(userLang, "success.review.created")
    });
  } catch (e) {
    logger.error('Помилка створення відгуку', {
      error: e.message,
      stack: e.stack,
      userId: req.userId,
      rating: req.body.rating
    });
    res.status(400).json({ error: e.message });
  }
}

export async function getUserReviews(req, res) {
  try {
    const reviews = await Review.find({ user: req.params.userId })
      .populate('user', 'fullName email')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (e) {
    logger.error("Помилка отримання відгуків користувача", {
      error: e.message,
      stack: e.stack,
      userId: req.params.userId
    });
    res.status(500).json({ error: e.message });
  }
}

export async function updateReview(req, res) {
  const userLang = getUserLanguage(req);
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ error: t(userLang, 'error.review.not_found') });
    }
    
    
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: t(userLang, 'error.review.edit_own_only') });
    }
    
    const { name, rating, comment } = req.body;
    
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ error: t(userLang, 'error.review.rating_range') });
    }
    
    const updatedReview = await Review.findByIdAndUpdate(
      req.params.id,
      { name, rating, comment },
      { new: true, runValidators: true }
    ).populate('user', 'fullName email');
    
    res.json(updatedReview);
  } catch (e) {
    logger.error("Помилка оновлення відгуку", {
      error: e.message,
      stack: e.stack,
      reviewId: req.params.id,
      userId: req.user?._id
    });
    res.status(400).json({ error: e.message });
  }
}


export async function deleteReview(req, res) {
  const userLang = getUserLanguage(req);

  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ error: t(userLang, 'error.review.not_found')});
    }
    
    // Check if user owns this review or is admin
    const isOwner = review.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: t(userLang, 'error.review.delete_own_only') });
    }
    
    await Review.findByIdAndDelete(req.params.id);
    
   
    await req.user.updateOne({
      $pull: { reviews: req.params.id }
    });

    res.json({ message: t(userLang, 'success.review.deleted') });
  } catch (e) {
    logger.error("Помилка видалення відгуку", {
      error: e.message,
      stack: e.stack,
      reviewId: req.params.id,
      userId: req.user?._id
    });
    res.status(500).json({ error: e.message });
  }
}