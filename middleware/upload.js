const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configuração de armazenamento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads/images");

    // Criar diretório se não existir
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Gerar nome único para o arquivo
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    const filename = `${file.fieldname}-${uniqueSuffix}${extension}`;
    cb(null, filename);
  },
});

// Filtro para tipos de arquivo permitidos
const fileFilter = (req, file, cb) => {
  // Verificar se é uma imagem
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Apenas arquivos de imagem são permitidos!"), false);
  }
};

// Configuração do multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limite
  },
});

// Middleware para upload de uma imagem
const uploadSingle = (req, res, next) => {
  // Se não há arquivo, mas há imageSrc (base64), pular o upload
  if (!req.file && req.body.imageSrc) {
    return next();
  }
  // Caso contrário, usar o multer normal
  return upload.single("image")(req, res, next);
};

// Middleware para upload de múltiplas imagens
const uploadMultiple = upload.array("images", 5); // máximo 5 imagens

// Middleware para tratar erros de upload
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "Arquivo muito grande. Tamanho máximo: 5MB",
      });
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        message: "Muitos arquivos. Máximo: 5 imagens",
      });
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        success: false,
        message: "Campo de arquivo inesperado",
      });
    }
  }

  if (err.message === "Apenas arquivos de imagem são permitidos!") {
    return res.status(400).json({
      success: false,
      message: "Apenas arquivos de imagem são permitidos!",
    });
  }

  next(err);
};

// Função para deletar arquivo
const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Erro ao deletar arquivo:", error);
    return false;
  }
};

// Função para gerar URL do arquivo
const getFileUrl = (req, filename) => {
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  return `${baseUrl}/uploads/images/${filename}`;
};

module.exports = {
  uploadSingle,
  uploadMultiple,
  handleUploadError,
  deleteFile,
  getFileUrl,
};
