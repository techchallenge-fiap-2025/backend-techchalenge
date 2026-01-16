const ProgressoCurso = require("../models/progressoCurso.model.js");
const Curso = require("../models/curso.model.js");
const Student = require("../models/student.model.js");

class ProgressoCursoController {
  // Aluno marca vídeo como assistido
  async marcarVideoAssistido(req, res) {
    try {
      const { id } = req.user;
      const { cursoId, capituloOrdem, aulaOrdem } = req.body;

      const student = await Student.findOne({ userId: id });
      if (!student) {
        return res.status(403).json({ error: "Aluno não encontrado" });
      }

      // Verificar se o curso existe
      const curso = await Curso.findById(cursoId);
      if (!curso) {
        return res.status(404).json({ error: "Curso não encontrado" });
      }

      // Verificar se o aluno está inscrito
      if (!curso.alunosInscritos.includes(student._id)) {
        return res
          .status(403)
          .json({ error: "Aluno não está inscrito neste curso" });
      }

      // Buscar ou criar progresso
      let progresso = await ProgressoCurso.findOne({
        alunoId: student._id,
        cursoId,
      });

      if (!progresso) {
        progresso = await ProgressoCurso.create({
          alunoId: student._id,
          cursoId,
          videosAssistidos: [],
          status: "em_andamento",
        });
      }

      // Verificar se o vídeo já foi assistido
      const jaAssistido = progresso.videosAssistidos.some(
        (video) =>
          video.capituloOrdem === capituloOrdem && video.aulaOrdem === aulaOrdem
      );

      if (!jaAssistido) {
        progresso.videosAssistidos.push({
          cursoId,
          capituloOrdem,
          aulaOrdem,
          dataAssistida: new Date(),
        });

        // Recalcular progresso
        await ProgressoCursoController.recalcularProgresso(progresso, curso);
        await progresso.save();
      }

      return res.json(progresso);
    } catch (error) {
      return res.status(500).json({
        error: "Erro ao marcar vídeo como assistido",
        details: error.message,
      });
    }
  }

  // Aluno vê seus cursos e progresso
  async meusCursos(req, res) {
    try {
      const { id } = req.user;
      const student = await Student.findOne({ userId: id });

      if (!student) {
        return res.status(403).json({ error: "Aluno não encontrado" });
      }

      const progressos = await ProgressoCurso.find({ alunoId: student._id })
        .populate("cursoId", "titulo descricao materiaId capitulos status")
        .sort({ updatedAt: -1 });

      // Buscar cursos completos
      const cursosCompletos = progressos.filter((p) => p.status === "completo");

      // Buscar cursos em andamento
      const cursosEmAndamento = progressos.filter(
        (p) => p.status === "em_andamento"
      );

      return res.json({
        totalCursos: progressos.length,
        cursosCompletos: cursosCompletos.length,
        cursosEmAndamento: cursosEmAndamento.length,
        progressos,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Erro ao buscar cursos", details: error.message });
    }
  }

  // Visualizar progresso específico de um curso
  async getProgresso(req, res) {
    try {
      const { id } = req.user;
      const { cursoId } = req.params;

      const student = await Student.findOne({ userId: id });
      if (!student) {
        return res.status(403).json({ error: "Aluno não encontrado" });
      }

      const progresso = await ProgressoCurso.findOne({
        alunoId: student._id,
        cursoId,
      }).populate("cursoId", "titulo descricao capitulos");

      if (!progresso) {
        return res.status(404).json({ error: "Progresso não encontrado" });
      }

      const curso = await Curso.findById(cursoId);

      // Detalhar progresso por capítulo
      const progressoPorCapitulo = curso.capitulos.map((capitulo) => {
        const aulasAssistidas = progresso.videosAssistidos.filter(
          (video) => video.capituloOrdem === capitulo.ordem
        );

        return {
          capitulo: capitulo.titulo,
          ordem: capitulo.ordem,
          totalAulas: capitulo.aulas.length,
          aulasAssistidas: aulasAssistidas.length,
          progresso:
            capitulo.aulas.length > 0
              ? (aulasAssistidas.length / capitulo.aulas.length) * 100
              : 0,
          aulas: capitulo.aulas.map((aula) => {
            const assistida = aulasAssistidas.some(
              (video) => video.aulaOrdem === aula.ordem
            );
            return {
              ...aula,
              assistida,
            };
          }),
        };
      });

      return res.json({
        progresso,
        progressoPorCapitulo,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Erro ao buscar progresso", details: error.message });
    }
  }

  // Recalcular progresso percentual e status
  static async recalcularProgresso(progresso, curso) {
    try {
      if (!curso || !curso.capitulos) return;

      // Contar total de vídeos no curso
      let totalVideos = 0;
      curso.capitulos.forEach((capitulo) => {
        const videosNoCapitulo = capitulo.aulas.filter(
          (aula) => aula.tipo === "video"
        );
        totalVideos += videosNoCapitulo.length;
      });

      // Contar vídeos assistidos
      const videosAssistidos = progresso.videosAssistidos.length;

      // Calcular percentual
      progresso.progressoPercentual =
        totalVideos > 0
          ? Math.round((videosAssistidos / totalVideos) * 100)
          : 0;

      // Verificar se completou todos os vídeos
      if (videosAssistidos >= totalVideos && totalVideos > 0) {
        progresso.status = "completo";
        progresso.dataConclusao = new Date();
      } else {
        progresso.status = "em_andamento";
      }
    } catch (error) {
      console.error("Erro ao recalcular progresso:", error);
    }
  }

  // Listar todos os progressos (admin ou professor)
  async list(req, res) {
    try {
      const { cursoId, alunoId } = req.query;
      let query = {};

      if (cursoId) query.cursoId = cursoId;
      if (alunoId) query.alunoId = alunoId;

      const progressos = await ProgressoCurso.find(query)
        .populate("alunoId", "userId")
        .populate("cursoId", "titulo descricao")
        .sort({ updatedAt: -1 });

      return res.json(progressos);
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Erro ao listar progressos", details: error.message });
    }
  }
}

module.exports = new ProgressoCursoController();
