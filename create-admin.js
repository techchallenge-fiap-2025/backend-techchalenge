const mongoose = require("mongoose");
require("dotenv").config();

// Importar modelo
const User = require("./models/User");

const connectDB = async () => {
  try {
    const mongoURI =
      process.env.MONGODB_URI || "mongodb://localhost:27017/blog-edc";
    await mongoose.connect(mongoURI);
    const isAtlas = mongoURI.includes("mongodb+srv");
    console.log(`✅ MongoDB ${isAtlas ? "Atlas" : "Local"} conectado!`);
  } catch (error) {
    console.error("❌ Erro ao conectar:", error.message);
    process.exit(1);
  }
};

const createAdmin = async () => {
  try {
    // Verificar se já existe um admin com esse email
    const existingAdmin = await User.findOne({ email: "admin@exemplo.com" });
    
    if (existingAdmin) {
      console.log("⚠️  Usuário admin já existe com o email admin@exemplo.com");
      console.log("📧 Email:", existingAdmin.email);
      console.log("👤 Nome:", existingAdmin.name);
      console.log("🔑 Tipo:", existingAdmin.userType);
      process.exit(0);
    }

    // Criar usuário admin
    const admin = new User({
      name: "Admin Sistema",
      email: "admin@exemplo.com",
      password: "admin123",
      userType: "admin",
      school: "Sistema",
      age: 30,
    });

    await admin.save();
    console.log("✅ Usuário Admin criado com sucesso!");
    console.log("📧 Email: admin@exemplo.com");
    console.log("🔑 Senha: admin123");
    console.log("👤 Nome: Admin Sistema");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Erro ao criar admin:", error.message);
    if (error.errors) {
      console.error("Detalhes:", error.errors);
    }
    process.exit(1);
  }
};

const run = async () => {
  await connectDB();
  await createAdmin();
  await mongoose.connection.close();
};

run();


