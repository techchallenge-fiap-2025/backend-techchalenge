const { body, validationResult } = require("express-validator");

// Middleware para validar dados do post
const validatePost = [
  body("title")
    .notEmpty()
    .withMessage("Título é obrigatório")
    .isLength({ min: 3, max: 200 })
    .withMessage("Título deve ter entre 3 e 200 caracteres")
    .trim(),

  body("content")
    .notEmpty()
    .withMessage("Conteúdo é obrigatório")
    .isLength({ min: 10 })
    .withMessage("Conteúdo deve ter pelo menos 10 caracteres")
    .trim(),

  body("imageSrc").notEmpty().withMessage("Imagem é obrigatória").trim(),

  // Middleware para verificar erros de validação
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

// Middleware para validar comentário
const validateComment = [
  body("content")
    .notEmpty()
    .withMessage("Conteúdo do comentário é obrigatório")
    .isLength({ min: 1, max: 500 })
    .withMessage("Comentário deve ter entre 1 e 500 caracteres")
    .trim(),

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

module.exports = {
  validatePost,
  validateComment,
};
