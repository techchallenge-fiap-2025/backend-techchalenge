const mongoose = require("mongoose");

const AtividadeSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: true,
      trim: true,
    },
    tipo: {
      type: String,
      enum: ["prova", "trabalho"],
      required: true,
    },
    valor: {
      type: Number,
      min: 0,
      max: 10,
    },
    data: {
      type: Date,
      required: true,
    },
    alunoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    professorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
    materiaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Materia",
      required: true,
    },
    turmaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Turma",
      required: true,
    },
    periodo: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["presente", "faltou", "entregue", "nao_entregue", "pendente"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Atividade", AtividadeSchema);
