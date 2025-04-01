import PostModel from '../models/post.js'


export const getLastTags = async (req, res) => {
  try {
      const { tag } = req.query;

      const posts = await PostModel.find().exec()
      const filteredPosts = tag ? posts.filter(post => post.tags.includes(tag)) : posts;
      const tags = filteredPosts.map(post => post.tags).flat().slice(0, 5)

      res.json({data: tags})
  } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Failed getting tags' });
  }
}


export const getAll = async (req, res) => {
    try {
        const posts = await PostModel.find().populate('user').exec()
        
        res.json(posts)
    } catch (error) {
        console.log(error);
      res.status(500).json({ message: 'Failed getting posts' });
   
    }
}

export const getOne = async (req, res) => {
    try {
      const postId = req.params.id;
  
      const doc = await PostModel.findOneAndUpdate(
        { _id: postId },
        { $inc: { viewsCount: 1 } },
        { returnDocument: 'after' }
      );
  
      if (!doc) {
        return res.status(404).json({
          message: 'The post is not found'
        });
      }
  
      res.json(doc);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Failed getting a post' });
    }
  };

  export const deleteOne = async (req, res) => {
    try {
      const postId = req.params.id;
  
      const deletedPost = await PostModel.findOneAndDelete({ _id: postId });
  
      if (!deletedPost) {
        return res.status(404).json({
          message: 'The post is not found'
        });
      }
  
      res.json({
        message: 'Post deleted successfully',
        deletedPost
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Failed deleting the post' });
    }
  };
  


  

export const create = async (req, res) =>{
    try {
        const doc = new PostModel({
            title: req.body.title,
            text: req.body.text,
            imageURL: req.body.imageURL,
            tags: req.body.tags,
            user: req.userId
        })

        const post = await doc.save()
        res.json(post)
    } catch (error) {
        console.log(error);
      res.status(500).json({ message: 'Postadding failed' });
    }
}

export const updateOne = async (req, res) => {
  try {
    const postId = req.params.id;
    const updateData = {
      title: req.body.title,
      text: req.body.text,
      imageURL: req.body.imageURL,
      tags: req.body.tags,
      user: req.userId
    };

    const updatedPost = await PostModel.findOneAndUpdate(
      { _id: postId },
      updateData,
      { new: true }
    );

    if (!updatedPost) {
      return res.status(404).json({
        message: 'The post is not found'
      });
    }

    res.json({
      message: 'Post updated successfully',
      updatedPost
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Failed updating the post' });
  }
};

