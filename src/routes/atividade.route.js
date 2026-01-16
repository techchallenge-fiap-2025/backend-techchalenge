const router = require("express").Router();
const AtividadeController = require("../controllers/atividade.controller.js");
const authMiddleware = require("../middlewares/auth.middleware.js");
const roleMiddleware = require("../middlewares/role.middleware.js");
const roleMultipleMiddleware = require("../middlewares/roleMultiple.middleware.js");

// Criar atividade para toda a turma (professor)
router.post(
  "/",
  authMiddleware,
  roleMiddleware("professor"),
  AtividadeController.create
);

// Criar atividade individual (professor)
router.post(
  "/individual",
  authMiddleware,
  roleMiddleware("professor"),
  AtividadeController.createIndividual
);

// Listar atividades (professor vê suas atividades, aluno vê suas atividades, admin vê todas)
router.get("/", authMiddleware, AtividadeController.list);

// Visualizar atividade específica
router.get("/:id", authMiddleware, AtividadeController.getById);

// Adicionar nota à atividade (professor ou admin)
router.post(
  "/:id/nota",
  authMiddleware,
  roleMultipleMiddleware("professor", "admin"),
  AtividadeController.adicionarNota
);

// Marcar presença/falta (para tipo "prova") (professor ou admin)
router.post(
  "/:id/presenca",
  authMiddleware,
  roleMultipleMiddleware("professor", "admin"),
  AtividadeController.marcarPresencaFalta
);

// Marcar entrega (para tipo "trabalho") (professor ou admin)
router.post(
  "/:id/entrega",
  authMiddleware,
  roleMultipleMiddleware("professor", "admin"),
  AtividadeController.marcarEntrega
);

// Atualizar atividade (professor ou admin)
router.put(
  "/:id",
  authMiddleware,
  roleMultipleMiddleware("professor", "admin"),
  AtividadeController.update
);

// Deletar atividade (professor ou admin)
router.delete(
  "/:id",
  authMiddleware,
  roleMultipleMiddleware("professor", "admin"),
  AtividadeController.delete
);

module.exports = router;
