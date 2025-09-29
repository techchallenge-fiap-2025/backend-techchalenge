const mongoose = require("mongoose");

const commentLikeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Índice único para evitar likes duplicados
commentLikeSchema.index({ user: 1, comment: 1 }, { unique: true });

module.exports = mongoose.model("CommentLike", commentLikeSchema);

