const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, "Conteúdo do comentário é obrigatório"],
      trim: true,
      maxlength: [1000, "Comentário não pode ter mais de 1000 caracteres"],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Autor é obrigatório"],
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: [true, "Post é obrigatório"],
    },
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null, // Para comentários de resposta
    },
    likes: {
      type: Number,
      default: 0,
      min: [0, "Likes não podem ser negativos"],
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Índices para melhor performance
commentSchema.index({ post: 1, createdAt: -1 });
commentSchema.index({ author: 1 });
commentSchema.index({ parentComment: 1 });
commentSchema.index({ createdAt: -1 });

// Virtual para contar respostas
commentSchema.virtual("replies", {
  ref: "Comment",
  localField: "_id",
  foreignField: "parentComment",
  count: true,
});

// Middleware para atualizar contador de comentários no post
commentSchema.post("save", async function () {
  const Post = mongoose.model("Post");
  const post = await Post.findById(this.post);
  if (post) {
    post.comments = await mongoose.model("Comment").countDocuments({
      post: this.post,
    });
    await post.save();
  }
});

// Middleware para atualizar contador quando comentário é deletado
commentSchema.post("findOneAndDelete", async function () {
  const Post = mongoose.model("Post");
  const post = await Post.findById(this.post);
  if (post) {
    post.comments = await mongoose.model("Comment").countDocuments({
      post: this.post,
    });
    await post.save();
  }
});

module.exports = mongoose.model("Comment", commentSchema);
