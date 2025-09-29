const { body, validationResult } = require("express-validator");

const validatePost = [
  body("title")
    .notEmpty()
    .withMessage("Título é obrigatório")
    .isLength({ min: 3, max: 200 })
    .withMessage("Título deve ter entre 3 e 200 caracteres")
    .trim(),

  body("excerpt")
    .notEmpty()
    .withMessage("Resumo é obrigatório")
    .isLength({ min: 10, max: 500 })
    .withMessage("Resumo deve ter entre 10 e 500 caracteres")
    .trim(),

  body("content")
    .notEmpty()
    .withMessage("Conteúdo é obrigatório")
    .isLength({ min: 50 })
    .withMessage("Conteúdo deve ter pelo menos 50 caracteres")
    .trim(),

  body("imageSrc").notEmpty().withMessage("Imagem é obrigatória").trim(),

  body("tags").optional().isArray().withMessage("Tags devem ser um array"),

  body("tags.*")
    .optional()
    .isString()
    .withMessage("Cada tag deve ser uma string")
    .trim()
    .isLength({ min: 2, max: 20 })
    .withMessage("Cada tag deve ter entre 2 e 20 caracteres"),

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

module.exports = validatePost;
