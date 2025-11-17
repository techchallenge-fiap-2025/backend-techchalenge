const mongoose = require("mongoose");
require("dotenv").config();

// Importar modelos
const User = require("./models/User");
const Post = require("./models/Post");
const Comment = require("./models/Comment");

const connectDB = async () => {
  try {
    const mongoURI =
      process.env.MONGODB_URI || "mongodb://localhost:27017/blog-edc";
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB Local conectado para seed!");
  } catch (error) {
    console.error("❌ Erro ao conectar:", error.message);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    // Limpar dados existentes
    await User.deleteMany({});
    await Post.deleteMany({});
    await Comment.deleteMany({});

    // Criar usuário de teste (Professor)
    const testUser = new User({
      name: "José Matos",
      email: "jose@exemplo.com",
      password: "password123", // Será hasheada automaticamente
      userType: "professor",
      school: "Escola Seu Manuel",
      age: 35,
      subjects: ["Inglês", "Gramática"],
    });

    // Criar usuário aluno de teste
    const testStudent = new User({
      name: "Maria Silva",
      email: "maria@exemplo.com",
      password: "password123",
      userType: "aluno",
      school: "Escola Seu Manuel",
      age: 11,
      class: "6 A",
      guardian: ["Geovanna Lucas"], // Array de responsáveis
    });

    // Criar usuário admin de teste
    const testAdmin = new User({
      name: "Admin Sistema",
      email: "admin@exemplo.com",
      password: "admin123",
      userType: "admin",
      school: "Escola Seu Manuel",
      age: 30,
      subjects: ["Administração", "Sistema"],
    });

    await testUser.save();
    console.log("✅ Usuário Professor criado:", testUser.name);

    await testStudent.save();
    console.log("✅ Usuário Aluno criado:", testStudent.name);

    await testAdmin.save();
    console.log("✅ Usuário Admin criado:", testAdmin.name);

    // Criar posts de teste
    const posts = [
      {
        title: "Verbo To Be",
        content:
          "Aqui você encontra conteúdos educativos de qualidade para aprender, revisar e se inspirar. Nosso objetivo é tornar o conhecimento acessível e prático, ajudando estudantes, professores e curiosos a expandir seus horizontes através de materiais didáticos bem estruturados e de fácil compreensão.",
        excerpt:
          "Aqui você encontra conteúdos educativos de qualidade para aprender, revisar e se inspirar. Nosso objetivo é tornar o conhecimento acessível e prático, ajudando estudantes, professores e curiosos a",
        author: testUser._id,
        imageSrc:
          "https://via.placeholder.com/400x200/2C3E50/FFFFFF?text=Desktop+Setup",
        tags: ["Inglês", "Gramática", "Verbos"],
        likes: 50,
        comments: 50,
      },
      {
        title: "Matemática Básica",
        content:
          "Conceitos fundamentais de matemática para estudantes do ensino fundamental.",
        excerpt:
          "Conceitos fundamentais de matemática para estudantes do ensino fundamental.",
        author: testUser._id,
        imageSrc: "https://via.placeholder.com/400x200/3498DB/FFFFFF?text=Math",
        tags: ["Matemática", "Fundamental"],
        likes: 25,
        comments: 15,
      },
    ];

    for (const postData of posts) {
      const post = new Post(postData);
      await post.save();
      console.log("✅ Post criado:", post.title);
    }

    console.log("🎉 Dados iniciais inseridos com sucesso!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Erro ao inserir dados:", error.message);
    process.exit(1);
  }
};

const runSeed = async () => {
  await connectDB();
  await seedData();
};

runSeed();

