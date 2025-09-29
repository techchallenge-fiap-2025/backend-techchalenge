const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Nome completo é obrigatório"],
      trim: true,
      maxlength: [100, "Nome não pode ter mais de 100 caracteres"],
    },
    email: {
      type: String,
      required: [true, "Email é obrigatório"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Email deve ter um formato válido",
      ],
    },
    password: {
      type: String,
      required: [true, "Senha é obrigatória"],
      minlength: [6, "Senha deve ter pelo menos 6 caracteres"],
      select: false, // Não retorna senha por padrão
    },
    profileImage: {
      type: String,
      default: null,
      trim: true,
    },
    school: {
      type: String,
      required: [true, "Escola é obrigatória"],
      trim: true,
      maxlength: [100, "Nome da escola não pode ter mais de 100 caracteres"],
    },
    age: {
      type: Number,
      required: [true, "Idade é obrigatória"],
      min: [5, "Idade deve ser pelo menos 5 anos"],
      max: [100, "Idade deve ser no máximo 100 anos"],
    },
    userType: {
      type: String,
      required: [true, "Tipo de usuário é obrigatório"],
      enum: {
        values: ["professor", "aluno"],
        message: "Tipo de usuário deve ser 'professor' ou 'aluno'",
      },
    },
    // Campos específicos para Aluno
    guardian: {
      type: String,
      required: function () {
        return this.userType === "aluno";
      },
      trim: true,
      maxlength: [
        100,
        "Nome do responsável não pode ter mais de 100 caracteres",
      ],
    },
    class: {
      type: String,
      required: function () {
        return this.userType === "aluno";
      },
      trim: true,
      maxlength: [20, "Turma não pode ter mais de 20 caracteres"],
    },
    // Campos específicos para Professor
    subjects: [
      {
        type: String,
        trim: true,
        maxlength: [50, "Matéria não pode ter mais de 50 caracteres"],
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Índices para melhor performance
userSchema.index({ email: 1 });
userSchema.index({ userType: 1 });
userSchema.index({ school: 1 });
userSchema.index({ name: "text" });

// Middleware para hash da senha antes de salvar
userSchema.pre("save", async function (next) {
  // Só faz hash se a senha foi modificada
  if (!this.isModified("password")) return next();

  try {
    // Hash da senha com salt de 12 rounds
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Middleware para hash da senha antes de atualizar
userSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();

  if (update.password) {
    try {
      const salt = await bcrypt.genSalt(12);
      update.password = await bcrypt.hash(update.password, salt);
    } catch (error) {
      next(error);
    }
  }

  next();
});

// Método para comparar senhas
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Método para retornar dados públicos do usuário
userSchema.methods.toPublicJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.__v;
  return userObject;
};

// Método estático para buscar por email
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Virtual para nome completo formatado
userSchema.virtual("fullName").get(function () {
  return this.name;
});

// Virtual para idade em anos
userSchema.virtual("ageInYears").get(function () {
  return this.age;
});

module.exports = mongoose.model("User", userSchema);
