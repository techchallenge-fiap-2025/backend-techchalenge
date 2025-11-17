const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoURI =
      process.env.MONGODB_URI || "mongodb://localhost:27017/blog-edc";

    await mongoose.connect(mongoURI);

    const isAtlas = mongoURI.includes("mongodb+srv");
    console.log(`✅ MongoDB ${isAtlas ? "Atlas" : "Local"} conectado com sucesso!`);
    console.log(`📊 Database: ${mongoose.connection.name}`);
    console.log(`🔗 URI: ${mongoURI.replace(/\/\/.*@/, "//***:***@")}`); // Ocultar credenciais no log
  } catch (error) {
    console.error("❌ Erro ao conectar com MongoDB:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
