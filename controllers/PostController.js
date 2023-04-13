import PostModel from '../models/Post.js';

// export const getLastTags = async (req, res) => {
//   try {
//     const posts = await PostModel.find().limit(5).exec();

//     const tags = posts
//       .map((obj) => obj.tags)
//       .flat()
//       .slice(0, 5);

//     res.json(tags);
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({
//       message: 'get tags error :-(',
//     });
//   }
// };

export const getAllPosts = async (req, res) => {
  try {
    const posts = await PostModel.find().populate('user').exec();
    res.json(posts);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Getting posts error :-(',
    });
  }
};

export const getOnePost = async (req, res) => {
  try {
    const postId = req.params.id;

    const post = await PostModel.findById(postId);

    await PostModel.findOneAndUpdate(
      {
        _id: postId,
      },
      {
        $set: { viewsCount: (post._doc.viewsCount += 1) },
      },
      { new: true, lean: true },
    ).then((doc) => {
      res.json(doc);
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'get posts error :-(',
    });
  }
};

export const removePost = async (req, res) => {
  try {
    const postId = req.params.id;

    PostModel.findOneAndDelete({
      _id: postId,
    })
      .then(() => {
        res.json({
          success: true,
        });
      })
      .catch((err) => {
        console.log(err);
        return res.status(500).json({
          message: 'delete post error :-(',
        });
      });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'get post error :-(',
    });
  }
};

export const createPost = async (req, res) => {
  console.log(req.body);
  try {
    const dataPost = new PostModel({
      title: req.body.title,
      text: req.body.text,
      imageUrl: req.body.imageUrl,
      tags: req.body.tags,
      user: req.body.userId,
    });

    const post = await dataPost.save();

    res.json(post);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'create post error :-(',
    });
  }
};

export const updatePost = async (req, res) => {
  try {
    const postId = req.params.id;

    await PostModel.updateOne(
      {
        _id: postId,
      },
      {
        title: req.body.title,
        text: req.body.text,
        imageUrl: req.body.imageUrl,
        user: req.userId,
        tags: req.body.tags,
      },
    );

    res.json({
      success: true,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'update post error :-(',
    });
  }
};
