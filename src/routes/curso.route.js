const router = require("express").Router();
const CursoController = require("../controllers/curso.controller.js");
const authMiddleware = require("../middlewares/auth.middleware.js");
const roleMiddleware = require("../middlewares/role.middleware.js");
const roleMultipleMiddleware = require("../middlewares/roleMultiple.middleware.js");

// Professor cria curso
router.post(
  "/",
  authMiddleware,
  roleMiddleware("professor"),
  CursoController.create
);

// Listar cursos (professor vê seus cursos, aluno vê disponíveis, admin vê todos)
router.get("/", authMiddleware, CursoController.list);

// Visualizar curso específico
router.get("/:id", authMiddleware, CursoController.getById);

// Professor edita curso
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("professor"),
  CursoController.update
);

// Professor adiciona capítulo ao curso
router.post(
  "/:id/capitulos",
  authMiddleware,
  roleMiddleware("professor"),
  CursoController.addCapitulo
);

// Aluno se inscreve no curso
router.post(
  "/:id/inscrever",
  authMiddleware,
  roleMiddleware("aluno"),
  CursoController.inscrever
);

// Professor ou admin deleta curso
router.delete(
  "/:id",
  authMiddleware,
  roleMultipleMiddleware("professor", "admin"),
  CursoController.delete
);

module.exports = router;
