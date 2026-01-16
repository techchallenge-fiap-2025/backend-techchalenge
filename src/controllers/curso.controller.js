const Curso = require("../models/curso.model.js");
const Teacher = require("../models/teacher.model.js");
const Student = require("../models/student.model.js");
const ProgressoCurso = require("../models/progressoCurso.model.js");

class CursoController {
  // Professor cria curso
  async create(req, res) {
    try {
      const { titulo, descricao, materiaId, turmasPermitidas, capitulos } =
        req.body;
      const professorId = req.user.id; // ID do professor logado

      // Verificar se o usuário é professor
      const teacher = await Teacher.findOne({ userId: professorId });
      if (!teacher) {
        return res
          .status(403)
          .json({ error: "Apenas professores podem criar cursos" });
      }

      const curso = await Curso.create({
        titulo,
        descricao,
        materiaId,
        professorId: teacher._id,
        turmasPermitidas,
        capitulos,
      });

      // Adicionar curso ao array de cursos do professor
      await Teacher.findByIdAndUpdate(teacher._id, {
        $push: { cursos: curso._id },
      });

      return res.status(201).json(curso);
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Erro ao criar curso", details: error.message });
    }
  }

  // Listar cursos (professor vê seus cursos, aluno vê cursos disponíveis, admin vê todos)
  async list(req, res) {
    try {
      const { role, id } = req.user;
      let cursos;

      if (role === "professor") {
        const teacher = await Teacher.findOne({ userId: id });
        if (!teacher) {
          return res.status(403).json({ error: "Professor não encontrado" });
        }

        cursos = await Curso.find({ professorId: teacher._id })
          .populate("materiaId", "nome")
          .populate("turmasPermitidas", "nome")
          .populate("alunosInscritos", "userId")
          .sort({ createdAt: -1 });
      } else if (role === "aluno") {
        const student = await Student.findOne({ userId: id });
        if (!student) {
          return res.status(403).json({ error: "Aluno não encontrado" });
        }

        // Cursos disponíveis para a turma do aluno ou cursos em que está inscrito
        cursos = await Curso.find({
          $or: [
            { turmasPermitidas: student.turmaId },
            { alunosInscritos: student._id },
          ],
          status: "ativo",
        })
          .populate("materiaId", "nome")
          .populate("professorId", "userId")
          .sort({ createdAt: -1 });
      } else {
        // Admin vê todos
        cursos = await Curso.find()
          .populate("materiaId", "nome")
          .populate("professorId", "userId")
          .populate("turmasPermitidas", "nome")
          .sort({ createdAt: -1 });
      }

      return res.json(cursos);
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Erro ao listar cursos", details: error.message });
    }
  }

  // Visualizar curso específico
  async getById(req, res) {
    try {
      const curso = await Curso.findById(req.params.id)
        .populate("materiaId", "nome")
        .populate("professorId", "userId")
        .populate("turmasPermitidas", "nome")
        .populate("alunosInscritos", "userId");

      if (!curso) {
        return res.status(404).json({ error: "Curso não encontrado" });
      }

      return res.json(curso);
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Erro ao buscar curso", details: error.message });
    }
  }

  // Professor edita curso
  async update(req, res) {
    try {
      const { role, id } = req.user;
      const curso = await Curso.findById(req.params.id);

      if (!curso) {
        return res.status(404).json({ error: "Curso não encontrado" });
      }

      // Verificar se é o dono do curso (professor) ou admin
      if (role === "professor") {
        const teacher = await Teacher.findOne({ userId: id });
        if (
          !teacher ||
          curso.professorId.toString() !== teacher._id.toString()
        ) {
          return res
            .status(403)
            .json({ error: "Você não tem permissão para editar este curso" });
        }
      } else if (role !== "admin") {
        return res.status(403).json({ error: "Acesso negado" });
      }

      const cursoAtualizado = await Curso.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
        }
      )
        .populate("materiaId", "nome")
        .populate("professorId", "userId")
        .populate("turmasPermitidas", "nome");

      return res.json(cursoAtualizado);
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Erro ao atualizar curso", details: error.message });
    }
  }

  // Professor adiciona capítulo ao curso
  async addCapitulo(req, res) {
    try {
      const { role, id } = req.user;
      const { titulo, ordem, aulas } = req.body;

      const curso = await Curso.findById(req.params.id);

      if (!curso) {
        return res.status(404).json({ error: "Curso não encontrado" });
      }

      // Verificar se é o dono do curso
      if (role === "professor") {
        const teacher = await Teacher.findOne({ userId: id });
        if (
          !teacher ||
          curso.professorId.toString() !== teacher._id.toString()
        ) {
          return res
            .status(403)
            .json({ error: "Você não tem permissão para editar este curso" });
        }
      } else if (role !== "admin") {
        return res.status(403).json({ error: "Acesso negado" });
      }

      curso.capitulos.push({ titulo, ordem, aulas });
      await curso.save();

      return res.json(curso);
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Erro ao adicionar capítulo", details: error.message });
    }
  }

  // Aluno se inscreve no curso
  async inscrever(req, res) {
    try {
      const { id } = req.user;
      const student = await Student.findOne({ userId: id });

      if (!student) {
        return res.status(403).json({ error: "Aluno não encontrado" });
      }

      const curso = await Curso.findById(req.params.id);

      if (!curso) {
        return res.status(404).json({ error: "Curso não encontrado" });
      }

      if (curso.status !== "ativo") {
        return res.status(400).json({ error: "Curso não está ativo" });
      }

      // Verificar se o aluno já está inscrito
      if (curso.alunosInscritos.includes(student._id)) {
        return res
          .status(400)
          .json({ error: "Aluno já está inscrito neste curso" });
      }

      // Verificar se a turma do aluno está permitida
      if (
        curso.turmasPermitidas.length > 0 &&
        !curso.turmasPermitidas.includes(student.turmaId)
      ) {
        return res
          .status(403)
          .json({ error: "Sua turma não tem acesso a este curso" });
      }

      // Adicionar aluno ao curso
      curso.alunosInscritos.push(student._id);
      await curso.save();

      // Adicionar curso ao aluno
      student.cursos.push(curso._id);
      await student.save();

      // Criar registro de progresso
      await ProgressoCurso.create({
        alunoId: student._id,
        cursoId: curso._id,
        status: "em_andamento",
      });

      return res
        .status(201)
        .json({ message: "Inscrição realizada com sucesso" });
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Erro ao inscrever no curso", details: error.message });
    }
  }

  // Professor ou admin deleta curso
  async delete(req, res) {
    try {
      const { role, id } = req.user;
      const curso = await Curso.findById(req.params.id);

      if (!curso) {
        return res.status(404).json({ error: "Curso não encontrado" });
      }

      // Verificar permissão
      if (role === "professor") {
        const teacher = await Teacher.findOne({ userId: id });
        if (
          !teacher ||
          curso.professorId.toString() !== teacher._id.toString()
        ) {
          return res
            .status(403)
            .json({ error: "Você não tem permissão para deletar este curso" });
        }
      } else if (role !== "admin") {
        return res.status(403).json({ error: "Acesso negado" });
      }

      // Remover curso do professor
      await Teacher.findByIdAndUpdate(curso.professorId, {
        $pull: { cursos: curso._id },
      });

      // Remover curso dos alunos
      await Student.updateMany(
        { cursos: curso._id },
        { $pull: { cursos: curso._id } }
      );

      // Deletar progressos relacionados
      await ProgressoCurso.deleteMany({ cursoId: curso._id });

      await Curso.findByIdAndDelete(req.params.id);

      return res.status(204).send();
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Erro ao deletar curso", details: error.message });
    }
  }
}

module.exports = new CursoController();
