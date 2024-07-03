const express = require("express");
const Product = require("../../models/Product");
const {
  validateAuth,
  authorizeRoles,
} = require("../../middleware/authMiddleware");
const router = express.Router();

//! Obține toate produsele (public)
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//! Adaugă un nou produs (numai pentru admini)
router.post("/", validateAuth, authorizeRoles("admin"), async (req, res) => {
  const product = new Product({
    categories: req.body.categories,
    weight: req.body.weight,
    title: req.body.title,
    calories: req.body.calories,
    groupBloodNotAllowed: req.body.groupBloodNotAllowed,
  });

  try {
    const newProduct = await product.save();
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
