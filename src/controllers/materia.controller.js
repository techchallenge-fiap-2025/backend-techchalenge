const Materia = require("../models/materia.model.js");

class MateriaController {
  async create(req, res) {
    try {
      const materia = await Materia.create(req.body);
      return res.status(201).json(materia);
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Erro ao criar matéria", details: error.message });
    }
  }

  async list(req, res) {
    try {
      const materias = await Materia.find().sort({ nome: 1 });
      return res.json(materias);
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Erro ao listar matérias", details: error.message });
    }
  }

  async getById(req, res) {
    try {
      const materia = await Materia.findById(req.params.id);

      if (!materia) {
        return res.status(404).json({ error: "Matéria não encontrada" });
      }

      return res.json(materia);
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Erro ao buscar matéria", details: error.message });
    }
  }

  async update(req, res) {
    try {
      const materia = await Materia.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });

      if (!materia) {
        return res.status(404).json({ error: "Matéria não encontrada" });
      }

      return res.json(materia);
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Erro ao atualizar matéria", details: error.message });
    }
  }

  async delete(req, res) {
    try {
      const materia = await Materia.findByIdAndDelete(req.params.id);

      if (!materia) {
        return res.status(404).json({ error: "Matéria não encontrada" });
      }

      return res.status(204).send();
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Erro ao deletar matéria", details: error.message });
    }
  }
}

module.exports = new MateriaController();
