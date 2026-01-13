const express = require("express");
const cors = require("cors");

const healthRoutes = require("./routes/health.route.js");

const app = express();

//?Middlewares globais
app.use(cors());
app.use(express.json());

//?Rotas
app.use("/api/health", healthRoutes);

module.exports = app;
