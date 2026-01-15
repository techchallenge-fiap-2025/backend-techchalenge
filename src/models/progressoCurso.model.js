const mongoose = require("mongoose");

const ProgressoCursoSchema = new mongoose.Schema(
  {
    alunoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    cursoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Curso",
      required: true,
    },
    videosAssistidos: [
      {
        cursoId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Curso",
        },
        capituloOrdem: {
          type: Number,
          required: true,
        },
        aulaOrdem: {
          type: Number,
          required: true,
        },
        dataAssistida: {
          type: Date,
          required: Date.now,
        },
      },
    ],
    status: {
      type: String,
      enum: ["em_andamento", "completo"],
      default: "em_andamento",
    },
    dataConclusão: {
      type: Date,
    },
    progressoPercentual: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

//?Indice unico para evitar duplicata de progresso do mesmo aluno no mesmo curso
ProgressoCursoSchema.index({ alunoId: 1, cursoId: 1 }, { unique: true });

module.exports = mongoose.model("ProgressoCurso", ProgressoCursoSchema);
