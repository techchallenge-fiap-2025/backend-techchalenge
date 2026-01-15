const mongoose = require("mongoose");

const AulaSchema = new mongoose.Schema(
  {
    tipo: {
      type: String,
      enum: ["video", "texto"],
      required: true,
    },
    titulo: {
      type: String,
      required: true,
    },
    conteudo: {
      type: String,
      required: true,
    },
    duracaoMinutos: {
      type: Number,
    },
    ordem: {
      type: Number,
    },
  },
  { _id: false }
);

const CapituloSchema = new mongoose.Schema(
  {
    titulo: {
      type: String,
      required: true,
    },
    ordem: {
      type: Number,
    },
    aulas: [AulaSchema],
  },
  { _id: false }
);

const CursoSchema = new mongoose.Schema(
  {
    titulo: {
      type: String,
      required: true,
    },
    descricao: {
      type: String,
    },
    materiaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Materia",
      required: true,
    },
    professorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
    turmasPermitidas: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Turma",
      },
    ],
    alunosInscritos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
    ],
    capitulos: [CapituloSchema],
    status: {
      type: Number,
      enum: ["ativo", "inativo"],
      default: "ativo",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Curso", CursoSchema);
