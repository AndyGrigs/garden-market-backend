import Review from '../models/review.js';



export async function getReviews(req, res) {
  try {
   const reviews = await Review.find()
   .populate('user', 'fullname email')
   .sort({createdAt: -1});
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}


export async function createReview(req, res) {
  const { name, rating, comment } = req.body;
  
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required to post reviews' });
  }

  if (!name || !rating) {
    return res.status(400).json({ error: 'Name and rating are required' });
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5' });
  }

  try {
    const review = new Review({ 
      name, 
      rating, 
      comment, 
      user: req.user._id 
    });
    
    await review.save();
    
    req.user.reviews.push(review._id);
    await req.user.save();
    
    const populatedReview = await Review.findById(review._id)
      .populate('user', 'fullName email');
    
    res.status(201).json(populatedReview);
  } catch (e) {
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
    res.status(500).json({ error: e.message });
  }
}

export async function updateReview(req, res) {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'You can only edit your own reviews' });
    }
    
    const { name, rating, comment } = req.body;
    
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
    
    const updatedReview = await Review.findByIdAndUpdate(
      req.params.id,
      { name, rating, comment },
      { new: true, runValidators: true }
    ).populate('user', 'fullName email');
    
    res.json(updatedReview);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}


export async function deleteReview(req, res) {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    // Check if user owns this review or is admin
    const isOwner = review.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'You can only delete your own reviews' });
    }
    
    await Review.findByIdAndDelete(req.params.id);
    
   
    await req.user.updateOne({
      $pull: { reviews: req.params.id }
    });
    
    res.json({ message: 'Review deleted successfully' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}