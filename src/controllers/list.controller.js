const Student = require("../models/student.model.js");
const Teacher = require("../models/teacher.model.js");

class ListController {
  async students(req, res) {
    try {
      const students = await Student.find()
        .populate("userId", "name email idade cpf")
        .populate("turmaId", "nome anoLetivo periodo")
        .populate("materias", "nome cargaHoraria")
        .populate("responsaveis", "nome telefone parentesco")
        .sort({ createdAt: -1 });

      return res.json(students);
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Erro ao listar alunos", details: error.message });
    }
  }

  async teacher(req, res) {
    try {
      const teachers = await Teacher.find()
        .populate("userId", "name email")
        .populate("materias", "nome cargaHoraria")
        .populate("turmas", "nome anoLetivo")
        .sort({ createdAt: -1 });

      return res.json(teachers);
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Erro ao listar professores", details: error.message });
    }
  }
}

module.exports = new ListController();
