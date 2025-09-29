const { body, validationResult } = require("express-validator");

// Validação para registro de usuário
const validateUserRegistration = [
  body("name")
    .notEmpty()
    .withMessage("Nome completo é obrigatório")
    .isLength({ min: 2, max: 100 })
    .withMessage("Nome deve ter entre 2 e 100 caracteres")
    .trim(),

  body("email")
    .notEmpty()
    .withMessage("Email é obrigatório")
    .isEmail()
    .withMessage("Email deve ter um formato válido")
    .normalizeEmail()
    .trim(),

  body("password")
    .notEmpty()
    .withMessage("Senha é obrigatória")
    .isLength({ min: 6, max: 50 })
    .withMessage("Senha deve ter entre 6 e 50 caracteres"),

  body("school")
    .notEmpty()
    .withMessage("Escola é obrigatória")
    .isLength({ min: 2, max: 100 })
    .withMessage("Escola deve ter entre 2 e 100 caracteres")
    .trim(),

  body("age")
    .notEmpty()
    .withMessage("Idade é obrigatória")
    .isInt({ min: 5, max: 100 })
    .withMessage("Idade deve ser entre 5 e 100 anos"),

  body("userType")
    .notEmpty()
    .withMessage("Tipo de usuário é obrigatório")
    .isIn(["professor", "aluno"])
    .withMessage("Tipo de usuário deve ser 'professor' ou 'aluno'"),

  // Validações condicionais para aluno
  body("guardian")
    .if(body("userType").equals("aluno"))
    .notEmpty()
    .withMessage("Responsável é obrigatório para alunos")
    .isLength({ min: 2, max: 100 })
    .withMessage("Nome do responsável deve ter entre 2 e 100 caracteres")
    .trim(),

  body("class")
    .if(body("userType").equals("aluno"))
    .notEmpty()
    .withMessage("Turma é obrigatória para alunos")
    .isLength({ min: 1, max: 20 })
    .withMessage("Turma deve ter entre 1 e 20 caracteres")
    .trim(),

  // Validações condicionais para professor
  body("subjects")
    .if(body("userType").equals("professor"))
    .optional()
    .isArray()
    .withMessage("Matérias devem ser um array"),

  body("subjects.*")
    .if(body("userType").equals("professor"))
    .optional()
    .isString()
    .withMessage("Cada matéria deve ser uma string")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Cada matéria deve ter entre 2 e 50 caracteres"),

  body("profileImage")
    .optional()
    .isString()
    .withMessage("Imagem de perfil deve ser uma string")
    .trim(),

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

// Validação para login
const validateUserLogin = [
  body("email")
    .notEmpty()
    .withMessage("Email é obrigatório")
    .isEmail()
    .withMessage("Email deve ter um formato válido")
    .normalizeEmail()
    .trim(),

  body("password").notEmpty().withMessage("Senha é obrigatória"),

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

// Validação para atualização de usuário
const validateUserUpdate = [
  body("name")
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage("Nome deve ter entre 2 e 100 caracteres")
    .trim(),

  body("email")
    .optional()
    .isEmail()
    .withMessage("Email deve ter um formato válido")
    .normalizeEmail()
    .trim(),

  body("school")
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage("Escola deve ter entre 2 e 100 caracteres")
    .trim(),

  body("age")
    .optional()
    .isInt({ min: 5, max: 100 })
    .withMessage("Idade deve ser entre 5 e 100 anos"),

  body("guardian")
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage("Nome do responsável deve ter entre 2 e 100 caracteres")
    .trim(),

  body("class")
    .optional()
    .isLength({ min: 1, max: 20 })
    .withMessage("Turma deve ter entre 1 e 20 caracteres")
    .trim(),

  body("subjects")
    .optional()
    .isArray()
    .withMessage("Matérias devem ser um array"),

  body("subjects.*")
    .optional()
    .isString()
    .withMessage("Cada matéria deve ser uma string")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Cada matéria deve ter entre 2 e 50 caracteres"),

  body("profileImage")
    .optional()
    .isString()
    .withMessage("Imagem de perfil deve ser uma string")
    .trim(),

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

// Validação para alteração de senha
const validatePasswordChange = [
  body("currentPassword").notEmpty().withMessage("Senha atual é obrigatória"),

  body("newPassword")
    .notEmpty()
    .withMessage("Nova senha é obrigatória")
    .isLength({ min: 6, max: 50 })
    .withMessage("Nova senha deve ter entre 6 e 50 caracteres"),

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

module.exports = {
  validateUserRegistration,
  validateUserLogin,
  validateUserUpdate,
  validatePasswordChange,
};
