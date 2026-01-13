const app = require("./src/app.js");
const connectDB = require("./src/config/db.js");
const env = require("./src/config/env.js");

connectDB();

app.listen(env.port, () => {
  console.log(" ⚙️ Servidor está rodando corretamente");
});
