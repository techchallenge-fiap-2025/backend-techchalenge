const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Gerar token JWT
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || "blog-edc-secret", {
    expiresIn: "7d",
  });
};

// POST /api/users/register - Registrar novo usuário
const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      profileImage,
      school,
      age,
      userType,
      guardian,
      class: userClass,
      subjects,
    } = req.body;

    // Verificar se email já existe
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email já está em uso",
      });
    }

    // Criar novo usuário
    const userData = {
      name,
      email,
      password,
      profileImage,
      school,
      age,
      userType,
    };

    // Adicionar campos específicos baseado no tipo de usuário
    if (userType === "aluno") {
      userData.guardian = guardian;
      userData.class = userClass;
    } else if (userType === "professor") {
      userData.subjects = subjects || [];
    }

    const user = new User(userData);
    await user.save();

    // Gerar token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "Usuário registrado com sucesso",
      data: {
        user: user.toPublicJSON(),
        token,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Erro ao registrar usuário",
      error: error.message,
    });
  }
};

// POST /api/users/login - Login do usuário
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuário por email incluindo senha
    const user = await User.findByEmail(email).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Credenciais inválidas",
      });
    }

    // Verificar se usuário está ativo
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Conta desativada",
      });
    }

    // Verificar senha
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Credenciais inválidas",
      });
    }

    // Atualizar último login
    user.lastLogin = new Date();
    await user.save();

    // Gerar token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: "Login realizado com sucesso",
      data: {
        user: user.toPublicJSON(),
        token,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erro ao fazer login",
      error: error.message,
    });
  }
};

// GET /api/users - Listar todos os usuários (apenas para admin)
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, userType, school, search } = req.query;

    const query = {};

    // Filtros
    if (userType) query.userType = userType;
    if (school) query.school = { $regex: school, $options: "i" };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: users.map((user) => user.toPublicJSON()),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalUsers: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erro ao buscar usuários",
      error: error.message,
    });
  }
};

// GET /api/users/:id - Buscar usuário por ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuário não encontrado",
      });
    }

    res.json({
      success: true,
      data: user.toPublicJSON(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erro ao buscar usuário",
      error: error.message,
    });
  }
};

// PUT /api/users/:id - Atualizar usuário
const updateUser = async (req, res) => {
  try {
    const {
      name,
      email,
      profileImage,
      school,
      age,
      guardian,
      class: userClass,
      subjects,
    } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuário não encontrado",
      });
    }

    // Verificar se email já existe em outro usuário
    if (email && email !== user.email) {
      const existingUser = await User.findByEmail(email);
      if (existingUser && existingUser._id.toString() !== user._id.toString()) {
        return res.status(400).json({
          success: false,
          message: "Email já está em uso",
        });
      }
    }

    // Atualizar campos
    if (name) user.name = name;
    if (email) user.email = email;
    if (profileImage !== undefined) user.profileImage = profileImage;
    if (school) user.school = school;
    if (age) user.age = age;

    // Atualizar campos específicos baseado no tipo
    if (user.userType === "aluno") {
      if (guardian !== undefined) user.guardian = guardian;
      if (userClass !== undefined) user.class = userClass;
    } else if (user.userType === "professor") {
      if (subjects !== undefined) user.subjects = subjects;
    }

    await user.save();

    res.json({
      success: true,
      message: "Usuário atualizado com sucesso",
      data: user.toPublicJSON(),
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Erro ao atualizar usuário",
      error: error.message,
    });
  }
};

// DELETE /api/users/:id - Deletar usuário (soft delete)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuário não encontrado",
      });
    }

    // Soft delete - desativar usuário
    user.isActive = false;
    await user.save();

    res.json({
      success: true,
      message: "Usuário desativado com sucesso",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erro ao deletar usuário",
      error: error.message,
    });
  }
};

// PUT /api/users/:id/password - Alterar senha
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.params.id).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuário não encontrado",
      });
    }

    // Verificar senha atual
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Senha atual incorreta",
      });
    }

    // Atualizar senha
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: "Senha alterada com sucesso",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Erro ao alterar senha",
      error: error.message,
    });
  }
};

// GET /api/users/profile - Perfil do usuário logado
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuário não encontrado",
      });
    }

    res.json({
      success: true,
      data: user.toPublicJSON(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erro ao buscar perfil",
      error: error.message,
    });
  }
};

// PUT /api/users/profile - Atualizar perfil do usuário logado
const updateProfile = async (req, res) => {
  try {
    const {
      name,
      email,
      profileImage,
      school,
      age,
      guardian,
      class: userClass,
      subjects,
    } = req.body;

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuário não encontrado",
      });
    }

    // Verificar se email já existe em outro usuário
    if (email && email !== user.email) {
      const existingUser = await User.findByEmail(email);
      if (existingUser && existingUser._id.toString() !== user._id.toString()) {
        return res.status(400).json({
          success: false,
          message: "Email já está em uso",
        });
      }
    }

    // Atualizar campos
    if (name) user.name = name;
    if (email) user.email = email;
    if (profileImage !== undefined) user.profileImage = profileImage;
    if (school) user.school = school;
    if (age) user.age = age;

    // Atualizar campos específicos baseado no tipo
    if (user.userType === "aluno") {
      if (guardian !== undefined) user.guardian = guardian;
      if (userClass !== undefined) user.class = userClass;
    } else if (user.userType === "professor") {
      if (subjects !== undefined) user.subjects = subjects;
    }

    await user.save();

    res.json({
      success: true,
      message: "Perfil atualizado com sucesso",
      data: user.toPublicJSON(),
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Erro ao atualizar perfil",
      error: error.message,
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  changePassword,
  getProfile,
  updateProfile,
};
