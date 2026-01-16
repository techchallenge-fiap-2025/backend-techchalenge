const router = require("express").Router();
const MateriaController = require("../controllers/materia.controller.js");
const authMiddleware = require("../middlewares/auth.middleware.js");
const roleMiddleware = require("../middlewares/role.middleware.js");

router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  MateriaController.create
);
router.get(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  MateriaController.list
);
router.get(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  MateriaController.getById
);
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  MateriaController.update
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  MateriaController.delete
);

module.exports = router;
