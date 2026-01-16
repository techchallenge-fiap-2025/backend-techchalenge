const Attendance = require("../models/attendance.model.js");
const Teacher = require("../models/teacher.model.js");
const Student = require("../models/student.model.js");
const Turma = require("../models/turma.model.js");
const AulaSemanal = require("../models/aulaSemanal.model.js");

class AttendanceController {
  // Professor marca presença de alunos em uma aula
  async marcarPresenca(req, res) {
    try {
      const { role, id } = req.user;
      const { turmaId, materiaId, data, alunos } = req.body; // alunos: [{ alunoId, presente }]

      const teacher = await Teacher.findOne({ userId: id });
      if (!teacher) {
        return res
          .status(403)
          .json({ error: "Apenas professores podem marcar presença" });
      }

      // Verificar se a turma existe
      const turma = await Turma.findById(turmaId);
      if (!turma) {
        return res.status(404).json({ error: "Turma não encontrada" });
      }

      // Verificar se o professor leciona nesta turma/matéria
      const aulaSemanal = await AulaSemanal.findOne({
        turmaId,
        materiaId,
        professorId: teacher._id,
        status: "ativa",
      });

      if (!aulaSemanal && role !== "admin") {
        return res
          .status(403)
          .json({ error: "Você não leciona esta turma/matéria" });
      }

      const registros = [];

      // Criar registros de presença para cada aluno
      for (const aluno of alunos) {
        const student = await Student.findById(aluno.alunoId);
        if (!student) {
          continue;
        }

        // Verificar se já existe registro para este aluno nesta data
        const registroExistente = await Attendance.findOne({
          alunoId: aluno.alunoId,
          turmaId,
          materiaId,
          data: new Date(data),
        });

        if (registroExistente) {
          // Atualizar registro existente
          registroExistente.presente = aluno.presente;
          await registroExistente.save();
          registros.push(registroExistente);
        } else {
          // Criar novo registro
          const registro = await Attendance.create({
            alunoId: aluno.alunoId,
            professorId: teacher._id,
            turmaId,
            materiaId,
            data: new Date(data),
            presente: aluno.presente,
          });
          registros.push(registro);
        }
      }

      return res.status(201).json({
        message: "Presença marcada com sucesso",
        registros,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Erro ao marcar presença", details: error.message });
    }
  }

  // Listar presenças (professor vê suas aulas, aluno vê suas presenças, admin vê todas)
  async list(req, res) {
    try {
      const { role, id } = req.user;
      const { turmaId, materiaId, dataInicio, dataFim } = req.query;

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

      if (turmaId) query.turmaId = turmaId;
      if (materiaId) query.materiaId = materiaId;

      if (dataInicio || dataFim) {
        query.data = {};
        if (dataInicio) query.data.$gte = new Date(dataInicio);
        if (dataFim) query.data.$lte = new Date(dataFim);
      }

      const attendances = await Attendance.find(query)
        .populate("alunoId", "userId")
        .populate("professorId", "userId")
        .populate("turmaId", "nome")
        .populate("materiaId", "nome")
        .sort({ data: -1 });

      return res.json(attendances);
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Erro ao listar presenças", details: error.message });
    }
  }

  // Aluno vê suas faltas
  async minhasFaltas(req, res) {
    try {
      const { id } = req.user;
      const student = await Student.findOne({ userId: id });

      if (!student) {
        return res.status(403).json({ error: "Aluno não encontrado" });
      }

      const faltas = await Attendance.find({
        alunoId: student._id,
        presente: false,
      })
        .populate("turmaId", "nome")
        .populate("materiaId", "nome")
        .populate("professorId", "userId")
        .sort({ data: -1 });

      // Agrupar faltas por matéria
      const faltasPorMateria = {};
      faltas.forEach((falta) => {
        const materiaNome = falta.materiaId.nome;
        if (!faltasPorMateria[materiaNome]) {
          faltasPorMateria[materiaNome] = [];
        }
        faltasPorMateria[materiaNome].push(falta);
      });

      return res.json({
        totalFaltas: faltas.length,
        faltasPorMateria,
        faltas,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Erro ao buscar faltas", details: error.message });
    }
  }

  // Visualizar registro específico
  async getById(req, res) {
    try {
      const attendance = await Attendance.findById(req.params.id)
        .populate("alunoId", "userId")
        .populate("professorId", "userId")
        .populate("turmaId", "nome")
        .populate("materiaId", "nome");

      if (!attendance) {
        return res
          .status(404)
          .json({ error: "Registro de presença não encontrado" });
      }

      return res.json(attendance);
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Erro ao buscar registro", details: error.message });
    }
  }

  // Atualizar presença
  async update(req, res) {
    try {
      const { role, id } = req.user;
      const { presente } = req.body;

      const attendance = await Attendance.findById(req.params.id);

      if (!attendance) {
        return res.status(404).json({ error: "Registro não encontrado" });
      }

      // Verificar permissão
      if (role === "professor") {
        const teacher = await Teacher.findOne({ userId: id });
        if (
          !teacher ||
          attendance.professorId.toString() !== teacher._id.toString()
        ) {
          return res.status(403).json({
            error: "Você não tem permissão para editar este registro",
          });
        }
      } else if (role !== "admin") {
        return res.status(403).json({ error: "Acesso negado" });
      }

      attendance.presente = presente;
      await attendance.save();

      return res.json(attendance);
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Erro ao atualizar presença", details: error.message });
    }
  }

  // Deletar registro (apenas admin)
  async delete(req, res) {
    try {
      const attendance = await Attendance.findByIdAndDelete(req.params.id);

      if (!attendance) {
        return res.status(404).json({ error: "Registro não encontrado" });
      }

      return res.status(204).send();
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Erro ao deletar registro", details: error.message });
    }
  }
}

module.exports = new AttendanceController();
