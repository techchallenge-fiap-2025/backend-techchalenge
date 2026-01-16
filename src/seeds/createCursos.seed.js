require("dotenv").config({
  path: require("path").resolve(__dirname, "../../.env"),
});
const mongoose = require("mongoose");
const User = require("../models/user.model.js");
const Curso = require("../models/curso.model.js");
const Teacher = require("../models/teacher.model.js");
const Materia = require("../models/materia.model.js");
const Turma = require("../models/turma.model.js");
const env = require("../config/env.js");

async function createCursos() {
  try {
    console.log("⚙️ Conectando ao MongoDB...");
    await mongoose.connect(env.mongoUrl);

    const cursosExistentes = await Curso.countDocuments();

    if (cursosExistentes > 0) {
      console.log("💥 Cursos já existem");
      process.exit();
    }

    const professores = await Teacher.find().populate("userId", "name");
    const materias = await Materia.find();
    const turmas = await Turma.find();

    if (professores.length === 0 || materias.length === 0) {
      console.log("❌ Crie professores e matérias primeiro!");
      process.exit(1);
    }

    const matematica = materias.find((m) => m.nome === "Matemática");
    const fisica = materias.find((m) => m.nome === "Física");
    const joao = professores.find((p) => p.userId.name === "João Silva");
    const pedro = professores.find((p) => p.userId.name === "Pedro Oliveira");

    if (!matematica || !fisica || !joao || !pedro) {
      console.log("❌ Professores ou matérias não encontrados!");
      process.exit(1);
    }

    const cursos = [
      {
        titulo: "Matemática Básica - Álgebra",
        descricao: "Curso completo de álgebra para iniciantes",
        materiaId: matematica._id,
        professorId: joao._id,
        turmasPermitidas: turmas.map((t) => t._id),
        capitulos: [
          {
            titulo: "Introdução à Álgebra",
            ordem: 1,
            aulas: [
              {
                tipo: "video",
                titulo: "O que é álgebra?",
                conteudo: "https://exemplo.com/video1",
                duracaoMinutos: 15,
                ordem: 1,
              },
              {
                tipo: "texto",
                titulo: "Conceitos fundamentais",
                conteudo: "Álgebra é o ramo da matemática que estuda...",
                ordem: 2,
              },
            ],
          },
          {
            titulo: "Equações de Primeiro Grau",
            ordem: 2,
            aulas: [
              {
                tipo: "video",
                titulo: "Resolvendo equações simples",
                conteudo: "https://exemplo.com/video2",
                duracaoMinutos: 20,
                ordem: 1,
              },
            ],
          },
        ],
        status: "ativo",
      },
      {
        titulo: "Física Moderna - Mecânica Quântica",
        descricao: "Introdução à mecânica quântica",
        materiaId: fisica._id,
        professorId: pedro._id,
        turmasPermitidas: [turmas.find((t) => t.nome === "3º Ano A")._id],
        capitulos: [
          {
            titulo: "Fundamentos da Mecânica Quântica",
            ordem: 1,
            aulas: [
              {
                tipo: "video",
                titulo: "Princípio da incerteza",
                conteudo: "https://exemplo.com/video3",
                duracaoMinutos: 25,
                ordem: 1,
              },
              {
                tipo: "texto",
                titulo: "Equação de Schrödinger",
                conteudo: "A equação de Schrödinger descreve...",
                ordem: 2,
              },
            ],
          },
        ],
        status: "ativo",
      },
    ];

    for (const cursoData of cursos) {
      await Curso.create(cursoData);
      console.log(`✅ Curso ${cursoData.titulo} criado`);
    }

    console.log(`✅ ${cursos.length} cursos criados com sucesso`);
    process.exit();
  } catch (error) {
    console.log("❌ Erro ao criar cursos:", error.message);
    process.exit(1);
  }
}

createCursos();
