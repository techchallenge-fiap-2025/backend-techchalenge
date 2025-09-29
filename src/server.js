const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();

const connectDB = require("../config/database");
const postRoutes = require("./routes/postRoutes");
const userRoutes = require("../routes/userRoutes");
const commentRoutes = require("../routes/commentRoutes");
const errorHandler = require("../middleware/errorHandler");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3001;

// Conectar ao MongoDB
connectDB();

// Middleware de segurança
app.use(helmet());

// Middleware de CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

// Middleware de logging
app.use(morgan("combined"));

// Middleware para parsing de JSON
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Servir arquivos estáticos (imagens)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Rota de health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "API Blog EDC funcionando!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Rotas da API
app.use("/api/posts", postRoutes);
app.use("/api/users", userRoutes);
app.use("/api/comments", commentRoutes);

// Rota para 404
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Rota não encontrada",
  });
});

// Middleware de tratamento de erros
app.use(errorHandler);

// Iniciar servidor
app.listen(PORT, () => {
  console.log("🚀 Servidor iniciado!");
  console.log(`📡 Porta: ${PORT}`);
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔗 URL: http://localhost:${PORT}`);
  console.log(`📊 Health Check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
