// app.js

const express = require("express");
const app = express();
const productRoutes = require("./routes/productRoutes");

// Middleware pentru a putea parsa JSON
app.use(express.json());

// Rute
app.use("/api/products", productRoutes);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

module.exports = app;
