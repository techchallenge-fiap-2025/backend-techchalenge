const express = require("express");
const router = express.Router();
const {
  getPosts,
  getPopularPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  toggleLike,
  addComment,
} = require("../controllers/postController");
const { authenticateToken } = require("../../middleware/auth");
const { validatePost } = require("../middleware/validatePost");

// Rotas públicas
router.get("/", getPosts);
router.get("/popular", getPopularPosts);
router.get("/:id", getPostById);

// Rotas protegidas
router.post("/", authenticateToken, validatePost, createPost);
router.put("/:id", authenticateToken, validatePost, updatePost);
router.delete("/:id", authenticateToken, deletePost);
router.post("/:id/like", authenticateToken, toggleLike);
router.post("/:id/comment", authenticateToken, addComment);

module.exports = router;
