const server = require("./src/app");

const connectDB = require("./src/db/db");

connectDB();
const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log(`server start ${port} `);
});
