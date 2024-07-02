// models/Product.js

const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  calories: {
    type: Number,
    required: true,
  },
  // Adaugă alte câmpuri relevante pentru produsele tale
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
