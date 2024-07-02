// server.js

require("dotenv").config();
const mongoose = require("mongoose");
const colors = require("colors");
const app = require("./app");

const PORT = process.env.PORT || 3000;

// Conectare la MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log(colors.bgBlue.italic.bold("Connected to MongoDB"));
  })
  .catch((err) => {
    console.error("Could not connect to MongoDB", err);
  });

app.listen(PORT, () => {
  console.log(
    colors.bgBlue.italic.bold(`Server is running. Use our API on port: ${PORT}`)
  );
});
