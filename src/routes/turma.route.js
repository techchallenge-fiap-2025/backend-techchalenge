const router = require("express").Router();
const TurmaController = require("../controllers/turma.controller.js");
const authMiddleware = require("../middlewares/auth.middleware.js");
const roleMiddleware = require("../middlewares/role.middleware.js");

router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  TurmaController.create
);
router.get("/", authMiddleware, roleMiddleware("admin"), TurmaController.list);
router.get(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  TurmaController.getById
);
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  TurmaController.update
);
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  TurmaController.delete
);

module.exports = router;
