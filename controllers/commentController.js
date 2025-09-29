const Comment = require("../models/Comment");
const Post = require("../models/Post");
const CommentLike = require("../models/CommentLike");

// POST /api/comments - Criar novo comentário
const createComment = async (req, res) => {
  try {
    const { content, postId, parentCommentId } = req.body;
    const author = req.user.userId;

    // Verificar se o post existe
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post não encontrado",
      });
    }

    // Se for uma resposta, verificar se o comentário pai existe
    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId);
      if (!parentComment) {
        return res.status(404).json({
          success: false,
          message: "Comentário pai não encontrado",
        });
      }
    }

    const comment = new Comment({
      content,
      author,
      post: postId,
      parentComment: parentCommentId || null,
    });

    await comment.save();

    // Popular dados do autor
    await comment.populate("author", "name email profileImage userType");

    res.status(201).json({
      success: true,
      message: "Comentário criado com sucesso",
      data: comment,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Erro ao criar comentário",
      error: error.message,
    });
  }
};

// GET /api/comments/post/:postId - Buscar comentários de um post
const getCommentsByPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const {
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Verificar se o post existe
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post não encontrado",
      });
    }

    // Configuração de ordenação
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    let comments = await Comment.find({ post: postId, parentComment: null })
      .populate("author", "name email profileImage userType")
      .populate({
        path: "replies",
        populate: {
          path: "author",
          select: "name email profileImage userType",
        },
        options: { sort: { createdAt: 1 } },
      })
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // Adicionar informação se o usuário curtiu cada comentário (se estiver autenticado)
    const commentsWithLikes = [];
    for (let comment of comments) {
      const commentObj = comment.toObject();

      if (req.user) {
        const userId = req.user.userId;
        const userLike = await CommentLike.findOne({
          user: userId,
          comment: comment._id,
        });
        commentObj.userLiked = !!userLike;
      } else {
        commentObj.userLiked = false;
      }

      commentsWithLikes.push(commentObj);
    }

    comments = commentsWithLikes;

    const total = await Comment.countDocuments({
      post: postId,
      parentComment: null,
    });

    res.json({
      success: true,
      data: comments,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalComments: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erro ao buscar comentários",
      error: error.message,
    });
  }
};

// PUT /api/comments/:id - Atualizar comentário
const updateComment = async (req, res) => {
  try {
    const { content } = req.body;
    const commentId = req.params.id;
    const userId = req.user.userId;

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comentário não encontrado",
      });
    }

    // Verificar se o usuário é o autor do comentário
    if (comment.author.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Você só pode editar seus próprios comentários",
      });
    }

    comment.content = content;
    comment.isEdited = true;
    comment.editedAt = new Date();

    await comment.save();

    res.json({
      success: true,
      message: "Comentário atualizado com sucesso",
      data: comment,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Erro ao atualizar comentário",
      error: error.message,
    });
  }
};

// DELETE /api/comments/:id - Deletar comentário
const deleteComment = async (req, res) => {
  try {
    const commentId = req.params.id;
    const userId = req.user.userId;

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comentário não encontrado",
      });
    }

    // Verificar se o usuário é o autor do comentário
    if (comment.author.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Você só pode deletar seus próprios comentários",
      });
    }

    // Deletar comentário e suas respostas
    await Comment.deleteMany({
      $or: [{ _id: commentId }, { parentComment: commentId }],
    });

    res.json({
      success: true,
      message: "Comentário deletado com sucesso",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erro ao deletar comentário",
      error: error.message,
    });
  }
};

// PUT /api/comments/:id/like - Curtir/descurtir comentário
const toggleCommentLike = async (req, res) => {
  try {
    const commentId = req.params.id;
    const userId = req.user.userId;

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comentário não encontrado",
      });
    }

    // Verificar se o usuário já curtiu o comentário
    const existingLike = await CommentLike.findOne({
      user: userId,
      comment: commentId,
    });

    console.log("Verificando like existente:", {
      userId,
      commentId,
      existingLike: existingLike ? existingLike._id : null,
    });

    if (existingLike) {
      // Se já curtiu, remover o like
      await CommentLike.findByIdAndDelete(existingLike._id);
      comment.likes = Math.max(0, comment.likes - 1);
      await comment.save();

      console.log("Like removido. Novos likes:", comment.likes);

      res.json({
        success: true,
        message: "Like removido com sucesso",
        data: { likes: comment.likes, liked: false },
      });
    } else {
      // Se não curtiu, adicionar o like
      await CommentLike.create({
        user: userId,
        comment: commentId,
      });
      comment.likes += 1;
      await comment.save();

      console.log("Like adicionado. Novos likes:", comment.likes);

      res.json({
        success: true,
        message: "Comentário curtido com sucesso",
        data: { likes: comment.likes, liked: true },
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erro ao curtir comentário",
      error: error.message,
    });
  }
};

module.exports = {
  createComment,
  getCommentsByPost,
  updateComment,
  deleteComment,
  toggleCommentLike,
};
