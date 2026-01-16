const router = require("express").Router();
const ProgressoCursoController = require("../controllers/progressoCurso.controller.js");
const authMiddleware = require("../middlewares/auth.middleware.js");
const roleMiddleware = require("../middlewares/role.middleware.js");

// Aluno marca vídeo como assistido
router.post(
  "/marcar-video",
  authMiddleware,
  roleMiddleware("aluno"),
  ProgressoCursoController.marcarVideoAssistido
);

// Listar todos os progressos (admin) - deve vir antes das rotas específicas
router.get(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  ProgressoCursoController.list
);

// Aluno vê seus cursos e progresso
router.get(
  "/meus-cursos",
  authMiddleware,
  roleMiddleware("aluno"),
  ProgressoCursoController.meusCursos
);

// Visualizar progresso específico de um curso
router.get(
  "/curso/:cursoId",
  authMiddleware,
  roleMiddleware("aluno"),
  ProgressoCursoController.getProgresso
);

module.exports = router;
