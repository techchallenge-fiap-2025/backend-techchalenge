const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    turmaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Turma",
      required: true,
    },
    responsaveis: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Responsaveis",
      },
    ],

    materias: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Materia",
      },
    ],
    cursos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Curso",
      },
    ],
    status: {
      type: String,
      enum: ["ativo", "transferido", "trancado", "concluido"],
      default: "ativo",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Student", StudentSchema);
