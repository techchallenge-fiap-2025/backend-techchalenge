const app = require("./src/app");
const connectDB = require("./src/config/db");
const env = require("./src/config/env.js");

connectDB();

app.listen(env.port, () => {
  console.log("🔥Servidor está rodando");
});
