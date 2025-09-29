const express = require("express");
const router = express.Router();
const {
  uploadImage,
  uploadImages,
  deleteImage,
  listImages,
} = require("../controllers/uploadController");

const {
  uploadSingle,
  uploadMultiple,
  handleUploadError,
} = require("../middleware/upload");
const { authenticateToken } = require("../middleware/auth");

// Rotas de upload (requer autenticação)
router.post(
  "/image",
  authenticateToken,
  uploadSingle,
  handleUploadError,
  uploadImage
);
router.post(
  "/images",
  authenticateToken,
  uploadMultiple,
  handleUploadError,
  uploadImages
);
router.delete("/image/:filename", authenticateToken, deleteImage);
router.get("/images", authenticateToken, listImages);

module.exports = router;
