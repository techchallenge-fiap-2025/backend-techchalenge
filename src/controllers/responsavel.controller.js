const Responsavel = require("../models/responsavel.model.js");
const Student = require("../models/student.model.js");

class ResponsavelController {
  // Criar responsável
  async create(req, res) {
    try {
      const { nome, cpf, telefone, email, parentesco, alunos } = req.body;

      // Verificar se CPF já existe
      const cpfExists = await Responsavel.findOne({ cpf });
      if (cpfExists) {
        return res.status(400).json({ error: "CPF já cadastrado" });
      }

      const responsavel = await Responsavel.create({
        nome,
        cpf,
        telefone,
        email,
        parentesco,
        alunos: alunos || [],
      });

      // Associar responsável aos alunos
      if (alunos && alunos.length > 0) {
        for (const alunoId of alunos) {
          await Student.findByIdAndUpdate(alunoId, {
            $addToSet: { responsaveis: responsavel._id },
          });
        }
      }

      return res.status(201).json(responsavel);
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Erro ao criar responsável", details: error.message });
    }
  }

  // Listar responsáveis
  async list(req, res) {
    try {
      const { alunoId } = req.query;
      let query = {};

      if (alunoId) {
        query.alunos = alunoId;
      }

      const responsaveis = await Responsavel.find(query)
        .populate("alunos", "userId")
        .sort({ nome: 1 });

      return res.json(responsaveis);
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Erro ao listar responsáveis", details: error.message });
    }
  }

  // Visualizar responsável específico
  async getById(req, res) {
    try {
      const responsavel = await Responsavel.findById(req.params.id).populate(
        "alunos",
        "userId turmaId"
      );

      if (!responsavel) {
        return res.status(404).json({ error: "Responsável não encontrado" });
      }

      return res.json(responsavel);
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Erro ao buscar responsável", details: error.message });
    }
  }

  // Atualizar responsável
  async update(req, res) {
    try {
      const responsavel = await Responsavel.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
        }
      ).populate("alunos", "userId");

      if (!responsavel) {
        return res.status(404).json({ error: "Responsável não encontrado" });
      }

      return res.json(responsavel);
    } catch (error) {
      return res.status(500).json({
        error: "Erro ao atualizar responsável",
        details: error.message,
      });
    }
  }

  // Associar responsável a aluno
  async associarAluno(req, res) {
    try {
      const { responsavelId, alunoId } = req.body;

      const responsavel = await Responsavel.findById(responsavelId);
      if (!responsavel) {
        return res.status(404).json({ error: "Responsável não encontrado" });
      }

      const aluno = await Student.findById(alunoId);
      if (!aluno) {
        return res.status(404).json({ error: "Aluno não encontrado" });
      }

      // Adicionar aluno ao responsável
      if (!responsavel.alunos.includes(alunoId)) {
        responsavel.alunos.push(alunoId);
        await responsavel.save();
      }

      // Adicionar responsável ao aluno
      if (!aluno.responsaveis.includes(responsavelId)) {
        aluno.responsaveis.push(responsavelId);
        await aluno.save();
      }

      return res.json({ message: "Associação realizada com sucesso" });
    } catch (error) {
      return res.status(500).json({
        error: "Erro ao associar responsável",
        details: error.message,
      });
    }
  }

  // Remover associação responsável-aluno
  async removerAssociacao(req, res) {
    try {
      const { responsavelId, alunoId } = req.body;

      // Remover do responsável
      await Responsavel.findByIdAndUpdate(responsavelId, {
        $pull: { alunos: alunoId },
      });

      // Remover do aluno
      await Student.findByIdAndUpdate(alunoId, {
        $pull: { responsaveis: responsavelId },
      });

      return res.json({ message: "Associação removida com sucesso" });
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Erro ao remover associação", details: error.message });
    }
  }

  // Deletar responsável
  async delete(req, res) {
    try {
      const responsavel = await Responsavel.findById(req.params.id);

      if (!responsavel) {
        return res.status(404).json({ error: "Responsável não encontrado" });
      }

      // Remover responsável dos alunos
      for (const alunoId of responsavel.alunos) {
        await Student.findByIdAndUpdate(alunoId, {
          $pull: { responsaveis: responsavel._id },
        });
      }

      await Responsavel.findByIdAndDelete(req.params.id);

      return res.status(204).send();
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Erro ao deletar responsável", details: error.message });
    }
  }
}

module.exports = new ResponsavelController();
