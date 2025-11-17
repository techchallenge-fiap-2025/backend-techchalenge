const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware de autenticação
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token de acesso necessário",
      });
    }

    // Verificar token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "blog-edc-secret"
    );

    // Buscar usuário
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Token inválido ou usuário inativo",
      });
    }

    // Adicionar dados do usuário à requisição
    req.user = {
      userId: user._id.toString(), // Garantir que seja string
      userType: user.userType,
      email: user.email,
    };

    console.log("🔍 Auth middleware - Usuário autenticado:", {
      userId: req.user.userId,
      userType: req.user.userType,
      email: req.user.email,
      userIdType: typeof req.user.userId,
    });

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Token inválido",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expirado",
      });
    }

    res.status(500).json({
      success: false,
      message: "Erro na autenticação",
      error: error.message,
    });
  }
};

// Middleware para verificar se é professor
const requireProfessor = (req, res, next) => {
  if (req.user.userType !== "professor") {
    return res.status(403).json({
      success: false,
      message: "Acesso negado. Apenas professores podem realizar esta ação.",
    });
  }
  next();
};

// Middleware para verificar se é aluno
const requireStudent = (req, res, next) => {
  if (req.user.userType !== "aluno") {
    return res.status(403).json({
      success: false,
      message: "Acesso negado. Apenas alunos podem realizar esta ação.",
    });
  }
  next();
};

// Middleware para verificar se é admin
const requireAdmin = (req, res, next) => {
  console.log("🔍 requireAdmin - Verificando acesso:", {
    userId: req.user?.userId,
    userType: req.user?.userType,
    email: req.user?.email,
  });
  
  if (!req.user || req.user.userType !== "admin") {
    console.log("❌ requireAdmin - Acesso negado. UserType:", req.user?.userType);
    return res.status(403).json({
      success: false,
      message:
        "Acesso negado. Apenas administradores podem realizar esta ação.",
    });
  }
  
  console.log("✅ requireAdmin - Acesso permitido");
  next();
};

// Middleware opcional - não falha se não houver token
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (token) {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "blog-edc-secret"
      );
      const user = await User.findById(decoded.userId);

      if (user && user.isActive) {
        req.user = {
          userId: user._id.toString(), // Garantir que seja string
          userType: user.userType,
          email: user.email,
        };
      }
    }

    next();
  } catch (error) {
    // Em caso de erro, continua sem usuário autenticado
    next();
  }
};

module.exports = {
  authenticateToken,
  requireProfessor,
  requireStudent,
  requireAdmin,
  optionalAuth,
};
