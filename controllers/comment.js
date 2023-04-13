const Post = require('../models/post');
const resourceNotFound = require('../util/resourceNotFound');

// Post new comment
exports.postComment = async (req,res,next) => {     // body(postId, content)
    try {
        const post = await Post.findById(req.body.postId);
        if (!post) {
            resourceNotFound(`No post found with ID = ${req.body.postId}`);
        }

        post.comments.push({
            user: req.userId,
            content: req.body.content
        });

        let newPost = await post.save();
        newPost = await Post.findById(newPost._id).populate('user comments.user', '-password');

        res.status(201).json({message: "Comment Created Successfully" , post: newPost});
    } catch (err) {
        next(err);
    }
}


// Edit comment
exports.editComment = async (req,res,next) => {     // params(id) - body(postId, content)
    try {
        const post = await Post.findById(req.body.postId);
        if (!post) {
            resourceNotFound(`No post found with ID = ${req.body.postId}`);
        }

        const comment = await post.comments.id(req.params.id);
        if (!comment) {
            resourceNotFound(`No comment found with ID = ${req.params.id}`);
        }

        // CHECK IF UNAUTHORIZED USER
        if (post.user.toString() !== req.userId && comment.user.toString() !== req.userId) {
            const error = new Error("Not Authorized User");
            error.statusCode = 403;
            throw error;
        }

        comment.content = req.body.content;
        let editedPost = await post.save();
        editedPost = await Post.findById(editedPost._id).populate('user comments.user', '-password');


        res.status(200).json({message: "Comment Updated Successfully", post: editedPost});

    } catch (err) {
        next(err);
    }
}



// Delete comment
exports.deleteComment = async (req,res,next) => {     // params(id) - body(postId)
    try {
        const post = await Post.findById(req.body.postId);
        if (!post) {
            resourceNotFound(`No post found with ID = ${req.body.postId}`);
        }

        const comment = await post.comments.id(req.params.id);
        if (!comment) {
            resourceNotFound(`No comment found with ID = ${req.params.id}`);
        }

        // CHECK IF UNAUTHORIZED USER
        if (post.user.toString() !== req.userId && comment.user.toString() !== req.userId) {
            const error = new Error("Not Authorized User");
            error.statusCode = 403;
            throw error;
        }

        await comment.remove();
        let newPost = await post.save();
        newPost = await Post.findById(newPost._id).populate('user comments.user', '-password');



        res.status(200).json({message: "Comment deleted successfully", post: newPost});

    } catch (err) {
        next(err);
    }
}


