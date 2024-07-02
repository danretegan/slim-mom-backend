// routes/productRoutes.js

const express = require('express');
const Product = require('../models/Product');
const router = express.Router();

// Obține toate produsele
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Adaugă un nou produs
router.post('/', async (req, res) => {
  const product = new Product({
    name: req.body.name,
    calories: req.body.calories,
    // Adaugă alte câmpuri relevante
  });

  try {
    const newProduct = await product.save();
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
