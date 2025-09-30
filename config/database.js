const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoURI =
      process.env.MONGODB_URI ||
      "mongodb+srv://tcfiap:Fiap@2025@cluster0.6fy2vq7.mongodb.net/blog-edc?retryWrites=true&w=majority&appName=Cluster0";

    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ MongoDB Atlas conectado com sucesso! a");
    console.log(`📊 Database: ${mongoose.connection.name}`);
  } catch (error) {
    console.error("❌ Erro ao conectar com MongoDB Atlas:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
