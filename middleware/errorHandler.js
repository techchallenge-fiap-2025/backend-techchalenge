const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log do erro
  console.error(err);

  // Erro de validação do Mongoose
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
    error = {
      message,
      statusCode: 400,
    };
  }

  // Erro de cast do Mongoose (ID inválido)
  if (err.name === "CastError") {
    const message = "Recurso não encontrado";
    error = {
      message,
      statusCode: 404,
    };
  }

  // Erro de duplicação do Mongoose
  if (err.code === 11000) {
    const message = "Recurso duplicado";
    error = {
      message,
      statusCode: 400,
    };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Erro interno do servidor",
  });
};

module.exports = errorHandler;
