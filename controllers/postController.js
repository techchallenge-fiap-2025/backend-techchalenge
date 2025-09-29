const Post = require("../models/Post");
const Like = require("../models/Like");
const Comment = require("../models/Comment");
const CommentLike = require("../models/CommentLike");

// GET /api/posts - Buscar todos os posts
const getAllPosts = async (req, res) => {
  try {
    const {
      page = 1,
      limit,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const query = {};

    // Busca por texto
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    // Configuração de ordenação
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    let queryBuilder = Post.find(query)
      .populate("author", "name email profileImage userType")
      .sort(sort);

    // Aplicar paginação apenas se limite for especificado
    if (limit) {
      queryBuilder = queryBuilder.limit(limit * 1).skip((page - 1) * limit);
    }

    const posts = await queryBuilder.exec();

    // Adicionar informação se o usuário curtiu cada post (se estiver autenticado)
    if (req.user) {
      const userId = req.user.userId;
      for (let post of posts) {
        const userLike = await Like.findOne({ user: userId, post: post._id });
        post = post.toObject();
        post.userLiked = !!userLike;
      }
    }

    const total = await Post.countDocuments(query);

    const response = {
      success: true,
      data: posts,
    };

    // Incluir paginação apenas se limite for especificado
    if (limit) {
      response.pagination = {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalPosts: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
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

// GET /api/posts/:id - Buscar post por ID
const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      "author",
      "name email profileImage userType"
    );

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post não encontrado",
      });
    }

    // Adicionar informação se o usuário curtiu o post (se estiver autenticado)
    let postData = post.toObject();
    if (req.user) {
      const userId = req.user.userId;
      const userLike = await Like.findOne({ user: userId, post: post._id });
      postData.userLiked = !!userLike;
    }

    res.json({
      success: true,
      data: postData,
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
    const { title, excerpt, content, tags = [] } = req.body;

    // Pegar o author do token de autenticação
    const author = req.user.userId;

    // Verificar se o usuário é professor (apenas professores podem criar posts)
    if (req.user.userType !== "professor") {
      return res.status(403).json({
        success: false,
        message: "Apenas professores podem criar posts",
      });
    }

    // Se houver upload de imagem, usar a URL do arquivo enviado
    let imageSrc = req.body.imageSrc; // URL externa se fornecida

    if (req.file) {
      // Se houve upload, usar a URL do arquivo local
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      imageSrc = `${baseUrl}/uploads/images/${req.file.filename}`;
    }

    if (!imageSrc) {
      return res.status(400).json({
        success: false,
        message: "Imagem é obrigatória. Envie uma imagem ou forneça uma URL.",
      });
    }

    const post = new Post({
      title,
      excerpt,
      content,
      imageSrc,
      tags,
      author,
    });

    await post.save();

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
    const { title, excerpt, content, tags } = req.body;

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post não encontrado",
      });
    }

    // Verificar se o usuário é o autor do post ou é professor
    if (
      post.author.toString() !== req.user.userId &&
      req.user.userType !== "professor"
    ) {
      return res.status(403).json({
        success: false,
        message: "Você só pode editar seus próprios posts",
      });
    }

    // Atualizar apenas campos fornecidos
    if (title) post.title = title;
    if (excerpt) post.excerpt = excerpt;
    if (content) post.content = content;
    if (tags) post.tags = tags;

    // Se houver upload de nova imagem, usar a URL do arquivo enviado
    if (req.file) {
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      post.imageSrc = `${baseUrl}/uploads/images/${req.file.filename}`;
    } else if (req.body.imageSrc) {
      // Se forneceu URL externa, usar ela
      post.imageSrc = req.body.imageSrc;
    }

    await post.save();

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
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post não encontrado",
      });
    }

    // Verificar se o usuário é o autor do post ou é professor
    if (
      post.author.toString() !== req.user.userId &&
      req.user.userType !== "professor"
    ) {
      return res.status(403).json({
        success: false,
        message: "Você só pode deletar seus próprios posts",
      });
    }

    // Deletar post e todos os likes e comentários relacionados
    await Post.findByIdAndDelete(req.params.id);
    await Like.deleteMany({ post: req.params.id });

    // Buscar todos os comentários do post para deletar seus likes
    const comments = await Comment.find({ post: req.params.id });
    const commentIds = comments.map((comment) => comment._id);

    // Deletar likes dos comentários
    await CommentLike.deleteMany({ comment: { $in: commentIds } });

    // Deletar comentários
    await Comment.deleteMany({ post: req.params.id });

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

// PUT /api/posts/:id/like - Curtir/descurtir post
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
      // Se já curtiu, remover o like
      await Like.findByIdAndDelete(existingLike._id);
      post.likes = Math.max(0, post.likes - 1);
      await post.save();

      res.json({
        success: true,
        message: "Like removido com sucesso",
        data: { likes: post.likes, liked: false },
      });
    } else {
      // Se não curtiu, adicionar o like
      await Like.create({ user: userId, post: postId });
      post.likes += 1;
      await post.save();

      res.json({
        success: true,
        message: "Like adicionado com sucesso",
        data: { likes: post.likes, liked: true },
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

module.exports = {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  toggleLike,
};
