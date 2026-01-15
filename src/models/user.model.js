const mongoose = require("mongoose");

const AddressSchema = new mongoose.Schema({
  cep: {
    type: String,
    trim: true,
    match: /ˆ\d{5}-?\d{3}$/,
  },
  rua: {
    type: String,
    required: true,
  },
  numero: {
    type: String,
    required: true,
  },
  cidade: {
    type: String,
    required: true,
  },
  estado: {
    type: String,
    required: true,
  },
  pais: {
    type: String,
    required: true,
  },
});

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ["admin", "professor", "aluno"],
      required: true,
    },
    idade: {
      type: Number,
      min: 0,
    },
    cpf: {
      type: String,
      unique: true,
    },
    endereco: {
      type: AddressSchema,
    },
    active: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", UserSchema);
