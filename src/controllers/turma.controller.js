const Turma = require("../models/turma.model.js");

class TurmaController {
  async create(req, res) {
    try {
      const turma = await Turma.create(req.body);
      return res.status(201).json(turma);
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Erro ao criar turma", details: error.message });
    }
  }

  async list(req, res) {
    try {
      const turmas = await Turma.find()
        .populate("alunos", "userId")
        .populate("professores", "userId")
        .populate("materias", "nome")
        .sort({ createdAt: -1 });

      return res.json(turmas);
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Erro ao listar turmas", details: error.message });
    }
  }

  async getById(req, res) {
    try {
      const turma = await Turma.findById(req.params.id)
        .populate("alunos", "userId")
        .populate("professores", "userId")
        .populate("materias", "nome");

      if (!turma) {
        return res.status(404).json({ error: "Turma não encontrada" });
      }

      return res.json(turma);
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Erro ao buscar turma", details: error.message });
    }
  }

  async update(req, res) {
    try {
      const turma = await Turma.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      })
        .populate("alunos", "userId")
        .populate("professores", "userId")
        .populate("materias", "nome");

      if (!turma) {
        return res.status(404).json({ error: "Turma não encontrada" });
      }

      return res.json(turma);
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Erro ao atualizar turma", details: error.message });
    }
  }

  async delete(req, res) {
    try {
      const turma = await Turma.findByIdAndDelete(req.params.id);

      if (!turma) {
        return res.status(404).json({ error: "Turma não encontrada" });
      }

      return res.status(204).send();
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Erro ao deletar turma", details: error.message });
    }
  }
}

module.exports = new TurmaController();
