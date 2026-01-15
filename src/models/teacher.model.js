const mongoose = require("mongoose");

const TeacherSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    turmas: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Turma",
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
        ref: "Materia",
      },
    ],
    status: {
      type: String,
      enum: ["ativo", "afastado", "desligado"],
      default: "ativo",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Teacher", TeacherSchema);
