const Atividade = require("../models/atividade.model.js");
const Teacher = require("../models/teacher.model.js");
const Student = require("../models/student.model.js");
const Grade = require("../models/grade.model.js");
const GradeController = require("./grade.controller.js");

class AtividadeController {
  // Criar atividade para toda a turma (prova ou trabalho)
  async create(req, res) {
    try {
      const { nome, tipo, data, materiaId, turmaId, periodo } = req.body;
      const { role, id } = req.user;

      if (!["prova", "trabalho"].includes(tipo)) {
        return res
          .status(400)
          .json({ error: "Tipo inválido. Use 'prova' ou 'trabalho'" });
      }

      const teacher = await Teacher.findOne({ userId: id });
      if (!teacher && role !== "admin") {
        return res
          .status(403)
          .json({ error: "Apenas professores podem criar atividades" });
      }

      // Verificar se a turma existe
      const Turma = require("../models/turma.model.js");
      const turma = await Turma.findById(turmaId);
      if (!turma) {
        return res.status(404).json({ error: "Turma não encontrada" });
      }

      // Buscar alunos da turma
      const alunos = await Student.find({ turmaId });

      const atividadesCriadas = [];

      // Criar atividade para cada aluno da turma
      for (const aluno of alunos) {
        const atividade = await Atividade.create({
          nome,
          tipo,
          data: data || new Date(),
          alunoId: aluno._id,
          professorId: teacher._id,
          materiaId,
          turmaId,
          periodo,
          status: "pendente",
        });

        // Buscar ou criar Grade
        let grade = await Grade.findOne({
          alunoId: aluno._id,
          materiaId,
          turmaId,
          periodo,
        });

        if (!grade) {
          grade = await Grade.create({
            alunoId: aluno._id,
            professorId: teacher._id,
            materiaId,
            turmaId,
            periodo,
            atividades: [],
          });
        }

        // Adicionar atividade ao Grade se não estiver lá
        if (!grade.atividades.includes(atividade._id)) {
          grade.atividades.push(atividade._id);
          await grade.save();
        }

        atividadesCriadas.push(atividade);
      }

      return res.status(201).json({
        message: `Atividade criada para ${atividadesCriadas.length} alunos`,
        atividades: atividadesCriadas,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Erro ao criar atividade", details: error.message });
    }
  }

  // Criar atividade individual (para um aluno específico)
  async createIndividual(req, res) {
    try {
      const { nome, tipo, valor, data, alunoId, materiaId, turmaId, periodo } =
        req.body;
      const { role, id } = req.user;

      if (!["prova", "trabalho"].includes(tipo)) {
        return res
          .status(400)
          .json({ error: "Tipo inválido. Use 'prova' ou 'trabalho'" });
      }

      const teacher = await Teacher.findOne({ userId: id });
      if (!teacher && role !== "admin") {
        return res
          .status(403)
          .json({ error: "Apenas professores podem criar atividades" });
      }

      const atividade = await Atividade.create({
        nome,
        tipo,
        valor: valor || null,
        data: data || new Date(),
        alunoId,
        professorId: teacher._id,
        materiaId,
        turmaId,
        periodo,
        status: "pendente",
      });

      // Buscar ou criar Grade
      let grade = await Grade.findOne({
        alunoId,
        materiaId,
        turmaId,
        periodo,
      });

      if (!grade) {
        grade = await Grade.create({
          alunoId,
          professorId: teacher._id,
          materiaId,
          turmaId,
          periodo,
          atividades: [],
        });
      }

      // Adicionar atividade ao Grade se não estiver lá
      if (!grade.atividades.includes(atividade._id)) {
        grade.atividades.push(atividade._id);
        if (valor) {
          await GradeController.recalcularMedia(grade);
        }
        await grade.save();
      }

      return res.status(201).json(atividade);
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Erro ao criar atividade", details: error.message });
    }
  }

  // Listar atividades
  async list(req, res) {
    try {
      const { role, id } = req.user;
      const { alunoId, materiaId, turmaId, periodo, tipo } = req.query;

      let query = {};

      if (role === "professor") {
        const teacher = await Teacher.findOne({ userId: id });
        if (!teacher) {
          return res.status(403).json({ error: "Professor não encontrado" });
        }
        query.professorId = teacher._id;
      } else if (role === "aluno") {
        const student = await Student.findOne({ userId: id });
        if (!student) {
          return res.status(403).json({ error: "Aluno não encontrado" });
        }
        query.alunoId = student._id;
      }

      if (alunoId) query.alunoId = alunoId;
      if (materiaId) query.materiaId = materiaId;
      if (turmaId) query.turmaId = turmaId;
      if (periodo) query.periodo = periodo;
      if (tipo) query.tipo = tipo;

      const atividades = await Atividade.find(query)
        .populate("alunoId", "userId")
        .populate("professorId", "userId")
        .populate("materiaId", "nome")
        .populate("turmaId", "nome")
        .sort({ data: -1 });

      return res.json(atividades);
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Erro ao listar atividades", details: error.message });
    }
  }

  // Visualizar atividade específica
  async getById(req, res) {
    try {
      const atividade = await Atividade.findById(req.params.id)
        .populate("alunoId", "userId")
        .populate("professorId", "userId")
        .populate("materiaId", "nome")
        .populate("turmaId", "nome");

      if (!atividade) {
        return res.status(404).json({ error: "Atividade não encontrada" });
      }

      return res.json(atividade);
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Erro ao buscar atividade", details: error.message });
    }
  }

  // Atualizar atividade
  async update(req, res) {
    try {
      const { role, id } = req.user;
      const atividade = await Atividade.findById(req.params.id);

      if (!atividade) {
        return res.status(404).json({ error: "Atividade não encontrada" });
      }

      // Verificar permissão
      if (role === "professor") {
        const teacher = await Teacher.findOne({ userId: id });
        if (
          !teacher ||
          atividade.professorId.toString() !== teacher._id.toString()
        ) {
          return res.status(403).json({
            error: "Você não tem permissão para editar esta atividade",
          });
        }
      } else if (role !== "admin") {
        return res.status(403).json({ error: "Acesso negado" });
      }

      // Validar status baseado no tipo
      if (req.body.status) {
        if (atividade.tipo === "prova") {
          if (!["presente", "faltou", "pendente"].includes(req.body.status)) {
            return res.status(400).json({
              error:
                "Status inválido para prova. Use 'presente', 'faltou' ou 'pendente'",
            });
          }
        } else if (atividade.tipo === "trabalho") {
          if (
            !["entregue", "nao_entregue", "pendente"].includes(req.body.status)
          ) {
            return res.status(400).json({
              error:
                "Status inválido para trabalho. Use 'entregue', 'nao_entregue' ou 'pendente'",
            });
          }
        }
      }

      const atividadeAtualizada = await Atividade.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
        }
      )
        .populate("alunoId", "userId")
        .populate("professorId", "userId")
        .populate("materiaId", "nome")
        .populate("turmaId", "nome");

      // Recalcular média do Grade se valor foi alterado
      if (req.body.valor !== undefined) {
        const grade = await Grade.findOne({
          alunoId: atividade.alunoId,
          materiaId: atividade.materiaId,
          turmaId: atividade.turmaId,
          periodo: atividade.periodo,
        });

        if (grade) {
          await GradeController.recalcularMedia(grade);
          await grade.save();
        }
      }

      return res.json(atividadeAtualizada);
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Erro ao atualizar atividade", details: error.message });
    }
  }

  // Adicionar nota à atividade
  async adicionarNota(req, res) {
    try {
      const { role, id } = req.user;
      const { valor } = req.body;

      const atividade = await Atividade.findById(req.params.id);

      if (!atividade) {
        return res.status(404).json({ error: "Atividade não encontrada" });
      }

      // Verificar permissão
      if (role === "professor") {
        const teacher = await Teacher.findOne({ userId: id });
        if (
          !teacher ||
          atividade.professorId.toString() !== teacher._id.toString()
        ) {
          return res.status(403).json({
            error: "Você não tem permissão para editar esta atividade",
          });
        }
      } else if (role !== "admin") {
        return res.status(403).json({ error: "Acesso negado" });
      }

      atividade.valor = valor;
      await atividade.save();

      // Recalcular média do Grade
      const grade = await Grade.findOne({
        alunoId: atividade.alunoId,
        materiaId: atividade.materiaId,
        turmaId: atividade.turmaId,
        periodo: atividade.periodo,
      });

      if (grade) {
        await GradeController.recalcularMedia(grade);
        await grade.save();
      }

      return res.json(atividade);
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Erro ao adicionar nota", details: error.message });
    }
  }

  // Marcar presença/falta (para tipo "prova")
  async marcarPresencaFalta(req, res) {
    try {
      const { role, id } = req.user;
      const { status } = req.body; // "presente" ou "faltou"

      if (!["presente", "faltou"].includes(status)) {
        return res
          .status(400)
          .json({ error: "Status inválido. Use 'presente' ou 'faltou'" });
      }

      const atividade = await Atividade.findById(req.params.id);

      if (!atividade) {
        return res.status(404).json({ error: "Atividade não encontrada" });
      }

      if (atividade.tipo !== "prova") {
        return res
          .status(400)
          .json({ error: "Esta funcionalidade é apenas para provas" });
      }

      // Verificar permissão
      if (role === "professor") {
        const teacher = await Teacher.findOne({ userId: id });
        if (
          !teacher ||
          atividade.professorId.toString() !== teacher._id.toString()
        ) {
          return res.status(403).json({
            error: "Você não tem permissão para editar esta atividade",
          });
        }
      } else if (role !== "admin") {
        return res.status(403).json({ error: "Acesso negado" });
      }

      atividade.status = status;
      if (status === "faltou") {
        atividade.valor = null;
      }
      await atividade.save();

      return res.json(atividade);
    } catch (error) {
      return res.status(500).json({
        error: "Erro ao marcar presença/falta",
        details: error.message,
      });
    }
  }

  // Marcar entrega (para tipo "trabalho")
  async marcarEntrega(req, res) {
    try {
      const { role, id } = req.user;
      const { entregue } = req.body; // true ou false

      const atividade = await Atividade.findById(req.params.id);

      if (!atividade) {
        return res.status(404).json({ error: "Atividade não encontrada" });
      }

      if (atividade.tipo !== "trabalho") {
        return res
          .status(400)
          .json({ error: "Esta funcionalidade é apenas para trabalhos" });
      }

      // Verificar permissão
      if (role === "professor") {
        const teacher = await Teacher.findOne({ userId: id });
        if (
          !teacher ||
          atividade.professorId.toString() !== teacher._id.toString()
        ) {
          return res.status(403).json({
            error: "Você não tem permissão para editar esta atividade",
          });
        }
      } else if (role !== "admin") {
        return res.status(403).json({ error: "Acesso negado" });
      }

      atividade.status = entregue ? "entregue" : "nao_entregue";
      if (!entregue) {
        atividade.valor = null;
      }
      await atividade.save();

      return res.json(atividade);
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Erro ao marcar entrega", details: error.message });
    }
  }

  // Deletar atividade
  async delete(req, res) {
    try {
      const { role, id } = req.user;
      const atividade = await Atividade.findById(req.params.id);

      if (!atividade) {
        return res.status(404).json({ error: "Atividade não encontrada" });
      }

      // Verificar permissão
      if (role === "professor") {
        const teacher = await Teacher.findOne({ userId: id });
        if (
          !teacher ||
          atividade.professorId.toString() !== teacher._id.toString()
        ) {
          return res.status(403).json({
            error: "Você não tem permissão para deletar esta atividade",
          });
        }
      } else if (role !== "admin") {
        return res.status(403).json({ error: "Acesso negado" });
      }

      // Remover atividade do Grade
      const grade = await Grade.findOne({
        alunoId: atividade.alunoId,
        materiaId: atividade.materiaId,
        turmaId: atividade.turmaId,
        periodo: atividade.periodo,
      });

      if (grade) {
        grade.atividades = grade.atividades.filter(
          (id) => id.toString() !== atividade._id.toString()
        );
        await GradeController.recalcularMedia(grade);
        await grade.save();
      }

      await Atividade.findByIdAndDelete(req.params.id);

      return res.status(204).send();
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Erro ao deletar atividade", details: error.message });
    }
  }
}

module.exports = new AtividadeController();
