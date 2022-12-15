const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
    commentId: {
        type: Number,
        required: true,
        unique: true,
    },
    postId: {
        type: Number,
        required: true,
    },
    user: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    createdAt: {
        type: String,
        required: true,
  }
});

module.exports = mongoose.model("Comments", commentSchema);