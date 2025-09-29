const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  changePassword,
  getProfile,
  updateProfile,
} = require("../controllers/userController");

const {
  validateUserRegistration,
  validateUserLogin,
  validateUserUpdate,
  validatePasswordChange,
} = require("../middleware/validateUser");

const { authenticateToken, requireProfessor } = require("../middleware/auth");

// Rotas públicas
router.post("/register", validateUserRegistration, registerUser);
router.post("/login", validateUserLogin, loginUser);

// Rotas protegidas
router.get("/profile", authenticateToken, getProfile);
router.put("/profile", authenticateToken, validateUserUpdate, updateProfile);
router.put(
  "/password",
  authenticateToken,
  validatePasswordChange,
  changePassword
);

// Rotas administrativas (apenas professores)
router.get("/", authenticateToken, requireProfessor, getAllUsers);
// Rota pública para buscar usuário por ID (dados públicos)
router.get("/:id", authenticateToken, getUserById);
router.put(
  "/:id",
  authenticateToken,
  requireProfessor,
  validateUserUpdate,
  updateUser
);
router.delete("/:id", authenticateToken, requireProfessor, deleteUser);

module.exports = router;
