const { getFileUrl, deleteFile } = require("../middleware/upload");
const path = require("path");

// POST /api/upload/image - Upload de uma imagem
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Nenhum arquivo foi enviado",
      });
    }

    const imageUrl = getFileUrl(req, req.file.filename);

    res.json({
      success: true,
      message: "Imagem enviada com sucesso",
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        url: imageUrl,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erro ao fazer upload da imagem",
      error: error.message,
    });
  }
};

// POST /api/upload/images - Upload de múltiplas imagens
const uploadImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Nenhum arquivo foi enviado",
      });
    }

    const uploadedFiles = req.files.map((file) => ({
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      url: getFileUrl(req, file.filename),
    }));

    res.json({
      success: true,
      message: `${req.files.length} imagem(ns) enviada(s) com sucesso`,
      data: uploadedFiles,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erro ao fazer upload das imagens",
      error: error.message,
    });
  }
};

// DELETE /api/upload/image/:filename - Deletar imagem
const deleteImage = async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, "../uploads/images", filename);

    const deleted = deleteFile(filePath);

    if (deleted) {
      res.json({
        success: true,
        message: "Imagem deletada com sucesso",
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Arquivo não encontrado",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erro ao deletar imagem",
      error: error.message,
    });
  }
};

// GET /api/upload/images - Listar imagens disponíveis
const listImages = async (req, res) => {
  try {
    const fs = require("fs");
    const uploadPath = path.join(__dirname, "../uploads/images");

    if (!fs.existsSync(uploadPath)) {
      return res.json({
        success: true,
        data: [],
        message: "Nenhuma imagem encontrada",
      });
    }

    const files = fs.readdirSync(uploadPath);
    const images = files
      .filter((file) => {
        const ext = path.extname(file).toLowerCase();
        return [".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext);
      })
      .map((file) => ({
        filename: file,
        url: getFileUrl(req, file),
        size: fs.statSync(path.join(uploadPath, file)).size,
      }));

    res.json({
      success: true,
      data: images,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erro ao listar imagens",
      error: error.message,
    });
  }
};

module.exports = {
  uploadImage,
  uploadImages,
  deleteImage,
  listImages,
};
