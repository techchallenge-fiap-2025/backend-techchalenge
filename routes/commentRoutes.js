const express = require("express");
const router = express.Router();
const {
  createComment,
  getCommentsByPost,
  updateComment,
  deleteComment,
  toggleCommentLike,
} = require("../controllers/commentController");

const { authenticateToken, optionalAuth } = require("../middleware/auth");
const { body, validationResult } = require("express-validator");

// Validação para comentários
const validateComment = [
  body("content")
    .notEmpty()
    .withMessage("Conteúdo do comentário é obrigatório")
    .isLength({ min: 1, max: 1000 })
    .withMessage("Comentário deve ter entre 1 e 1000 caracteres")
    .trim(),

  body("postId")
    .notEmpty()
    .withMessage("ID do post é obrigatório")
    .isMongoId()
    .withMessage("ID do post deve ser válido"),

  body("parentCommentId")
    .optional()
    .isMongoId()
    .withMessage("ID do comentário pai deve ser válido"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Dados inválidos",
        errors: errors.array(),
      });
    }
    next();
  },
];

// Rotas dos comentários
router.post("/", authenticateToken, validateComment, createComment);
router.get("/post/:postId", optionalAuth, getCommentsByPost);
router.put("/:id", authenticateToken, updateComment);
router.delete("/:id", authenticateToken, deleteComment);
router.put("/:id/like", authenticateToken, toggleCommentLike);

module.exports = router;
