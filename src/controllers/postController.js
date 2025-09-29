const Post = require("../../models/Post");
const User = require("../../models/User");
const Comment = require("../../models/Comment");
const Like = require("../../models/Like");

// GET /api/posts - Buscar todos os posts
const getPosts = async (req, res) => {
  try {
    const { page = 1, limit, search = "" } = req.query;

    // Construir filtro de busca
    const filter = {};
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ];
    }

    let queryBuilder = Post.find(filter)
      .populate("author", "name profileImage userType")
      .sort({ createdAt: -1 });

    // Aplicar paginação apenas se limite for especificado
    if (limit) {
      const skip = (page - 1) * limit;
      queryBuilder = queryBuilder.skip(skip).limit(parseInt(limit));
    }

    const posts = await queryBuilder;

    const total = await Post.countDocuments(filter);

    const response = {
      success: true,
      data: posts,
    };

    // Incluir paginação apenas se limite for especificado
    if (limit) {
      response.pagination = {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
      };
    } else {
      response.totalPosts = total;
    }

    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erro ao buscar posts",
      error: error.message,
    });
  }
};

// GET /api/posts/popular - Buscar posts mais populares
const getPopularPosts = async (req, res) => {
  try {
    const { limit = 3 } = req.query;

    const posts = await Post.find()
      .populate("author", "name profileImage userType")
      .sort({ likes: -1, createdAt: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: posts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erro ao buscar posts populares",
      error: error.message,
    });
  }
};

// GET /api/posts/:id - Buscar post por ID
const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      "author",
      "name profileImage userType"
    );

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post não encontrado",
      });
    }

    res.json({
      success: true,
      data: post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erro ao buscar post",
      error: error.message,
    });
  }
};

// POST /api/posts - Criar novo post
const createPost = async (req, res) => {
  try {
    const { title, content, excerpt, imageSrc } = req.body;
    const authorId = req.user.userId;

    // Verificar se o usuário é professor
    const user = await User.findById(authorId);
    if (!user || user.userType !== "professor") {
      return res.status(403).json({
        success: false,
        message: "Apenas professores podem criar posts",
      });
    }

    const post = new Post({
      title,
      content,
      excerpt,
      imageSrc,
      author: authorId,
    });

    await post.save();
    await post.populate("author", "name profileImage userType");

    res.status(201).json({
      success: true,
      message: "Post criado com sucesso",
      data: post,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Erro ao criar post",
      error: error.message,
    });
  }
};

// PUT /api/posts/:id - Atualizar post
const updatePost = async (req, res) => {
  try {
    const { title, content, excerpt, imageSrc } = req.body;
    const postId = req.params.id;
    const userId = req.user.userId;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post não encontrado",
      });
    }

    // Verificar se o usuário é o autor do post ou é professor
    if (
      post.author.toString() !== userId &&
      req.user.userType !== "professor"
    ) {
      return res.status(403).json({
        success: false,
        message: "Você só pode editar seus próprios posts",
      });
    }

    // Atualizar apenas campos fornecidos
    if (title) post.title = title;
    if (content) post.content = content;
    if (excerpt) post.excerpt = excerpt;
    if (imageSrc) post.imageSrc = imageSrc;

    await post.save();
    await post.populate("author", "name profileImage userType");

    res.json({
      success: true,
      message: "Post atualizado com sucesso",
      data: post,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Erro ao atualizar post",
      error: error.message,
    });
  }
};

// DELETE /api/posts/:id - Deletar post
const deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.userId;
    const userType = req.user.userType;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post não encontrado",
      });
    }

    // Verificar se o usuário é o autor do post ou é professor
    const isAuthor = String(post.author) === String(userId);
    const isProfessor = userType === "professor";

    if (!isAuthor && !isProfessor) {
      return res.status(403).json({
        success: false,
        message: "Você só pode deletar seus próprios posts",
      });
    }

    await Post.findByIdAndDelete(postId);

    res.json({
      success: true,
      message: "Post deletado com sucesso",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erro ao deletar post",
      error: error.message,
    });
  }
};

// POST /api/posts/:id/like - Curtir/descurtir post
const toggleLike = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.userId;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post não encontrado",
      });
    }

    // Verificar se o usuário já curtiu o post
    const existingLike = await Like.findOne({ user: userId, post: postId });

    if (existingLike) {
      // Remover o like
      await Like.findByIdAndDelete(existingLike._id);
      post.likes = Math.max(0, (post.likes || 0) - 1);
      await post.save();

      res.json({
        success: true,
        message: "Curtida removida",
        data: {
          liked: false,
          likesCount: post.likes,
        },
      });
    } else {
      // Adicionar o like
      const newLike = new Like({
        user: userId,
        post: postId,
      });
      await newLike.save();

      post.likes = (post.likes || 0) + 1;
      await post.save();

      res.json({
        success: true,
        message: "Post curtido",
        data: {
          liked: true,
          likesCount: post.likes,
        },
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erro ao curtir post",
      error: error.message,
    });
  }
};

// POST /api/posts/:id/comment - Adicionar comentário
const addComment = async (req, res) => {
  try {
    const { content } = req.body;
    const postId = req.params.id;
    const userId = req.user.userId;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Conteúdo do comentário é obrigatório",
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post não encontrado",
      });
    }

    // Criar comentário usando o modelo Comment
    const comment = new Comment({
      content: content.trim(),
      author: userId,
      post: postId,
    });

    await comment.save();

    // Popular dados do autor
    await comment.populate("author", "name profileImage userType");

    // Atualizar contador de comentários do post
    post.comments = (post.comments || 0) + 1;
    await post.save();

    res.status(201).json({
      success: true,
      message: "Comentário adicionado com sucesso",
      data: comment,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Erro ao adicionar comentário",
      error: error.message,
    });
  }
};

module.exports = {
  getPosts,
  getPopularPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  toggleLike,
  addComment,
};
