const mongoose = require("mongoose");

const likeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Usuário é obrigatório"],
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: [true, "Post é obrigatório"],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Índice único para garantir que um usuário só pode curtir uma vez cada post
likeSchema.index({ user: 1, post: 1 }, { unique: true });

// Índices para melhor performance
likeSchema.index({ post: 1 });
likeSchema.index({ user: 1 });
likeSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Like", likeSchema);
