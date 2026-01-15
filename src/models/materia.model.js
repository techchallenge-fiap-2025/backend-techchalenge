const mongoose = require("mongoose");

const MateriaSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    cargaHoraria: {
      type: Number,
      required: true,
    },
    descricao: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Materia", MateriaSchema);
