const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Título é obrigatório"],
      trim: true,
      maxlength: [200, "Título não pode ter mais de 200 caracteres"],
    },
    excerpt: {
      type: String,
      required: [true, "Resumo é obrigatório"],
      trim: true,
      maxlength: [500, "Resumo não pode ter mais de 500 caracteres"],
    },
    content: {
      type: String,
      required: [true, "Conteúdo é obrigatório"],
      trim: true,
    },
    imageSrc: {
      type: String,
      required: [true, "Imagem é obrigatória"],
      trim: true,
    },
    likes: {
      type: Number,
      default: 0,
      min: [0, "Likes não podem ser negativos"],
    },
    comments: {
      type: Number,
      default: 0,
      min: [0, "Comentários não podem ser negativos"],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Autor é obrigatório"],
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Adiciona createdAt e updatedAt automaticamente
    versionKey: false,
  }
);

// Índices para melhor performance
postSchema.index({ title: "text", content: "text" });
postSchema.index({ createdAt: -1 });
postSchema.index({ likes: -1 });

module.exports = mongoose.model("Post", postSchema);
