const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.route.js");
const userRoutes = require("./routes/user.route.js");
const listRoutes = require("./routes/list.route.js");
const materiaRoutes = require("./routes/materia.routes.js");
const turmaRoutes = require("./routes/turma.route.js");
const cursoRoutes = require("./routes/curso.route.js");
const attendanceRoutes = require("./routes/attendance.route.js");
const gradeRoutes = require("./routes/grade.route.js");
const atividadeRoutes = require("./routes/atividade.route.js");
const aulaSemanalRoutes = require("./routes/aulaSemanal.route.js");
const progressoCursoRoutes = require("./routes/progressoCurso.route.js");
const responsavelRoutes = require("./routes/responsavel.route.js");
const healthRoutes = require("./routes/health.route.js");

const app = express();

//?Moddlewares globais
app.use(cors());
app.use(express.json());

//Rotas
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/list", listRoutes);
app.use("/api/materia", materiaRoutes);
app.use("/api/turma", turmaRoutes);
app.use("/api/curso", cursoRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/grade", gradeRoutes);
app.use("/api/atividade", atividadeRoutes);
app.use("/api/aula-semanal", aulaSemanalRoutes);
app.use("/api/progresso-curso", progressoCursoRoutes);
app.use("/api/responsavel", responsavelRoutes);
app.use("/api/health", healthRoutes);

module.exports = app;
