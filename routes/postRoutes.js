const express = require("express");
const router = express.Router();
const {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  toggleLike,
} = require("../controllers/postController");

const validatePost = require("../middleware/validatePost");
const { authenticateToken, optionalAuth } = require("../middleware/auth");
const { uploadSingle, handleUploadError } = require("../middleware/upload");

// Rotas dos posts
router.get("/", optionalAuth, getAllPosts); // Busca pública com auth opcional
router.get("/:id", optionalAuth, getPostById); // Busca pública com auth opcional
router.post(
  "/",
  authenticateToken,
  uploadSingle,
  handleUploadError,
  validatePost,
  createPost
); // Criar requer auth
router.put(
  "/:id",
  authenticateToken,
  uploadSingle,
  handleUploadError,
  validatePost,
  updatePost
); // Atualizar requer auth
router.delete("/:id", authenticateToken, deletePost); // Deletar requer auth
router.put("/:id/like", authenticateToken, toggleLike); // Curtir requer auth

module.exports = router;
