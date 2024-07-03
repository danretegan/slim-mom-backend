const express = require("express");
const Product = require("../../models/Product");
const ConsumedProduct = require("../../models/ConsumedProduct");
const DailyIntake = require("../../models/DailyIntake");
const calculateCalories = require("../../utils/calculateCalories");
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

//! Endpoint public pentru aportul zilnic de kcal și lista de produse nerecomandate
router.get("/daily-intake", async (req, res) => {
  try {
    const { weight, height, age, groupBloodNotAllowed } = req.query;

    const dailyKcal = calculateCalories(weight, height, age);
    if (dailyKcal === null) {
      return res
        .status(400)
        .json({ message: "Please provide valid weight, height, and age" });
    }

    const products = await Product.find({
      groupBloodNotAllowed: groupBloodNotAllowed === "true",
    });

    res.json({
      dailyKcal,
      notRecommendedProducts: products,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//! Endpoint privat pentru aportul zilnic de kcal și lista de produse nerecomandate, și înregistrarea în baza de date
router.post("/daily-intake", validateAuth, async (req, res) => {
  try {
    const { weight, height, age, groupBloodNotAllowed } = req.body;
    const userId = req.user._id;

    const dailyKcal = calculateCalories(weight, height, age);
    if (dailyKcal === null) {
      return res
        .status(400)
        .json({ message: "Please provide valid weight, height, and age" });
    }

    const products = await Product.find({
      groupBloodNotAllowed: groupBloodNotAllowed === "true",
    });

    const notRecommendedProducts = products.map((product) => product.title);

    const dailyIntake = new DailyIntake({
      userId,
      weight,
      height,
      age,
      dailyKcal,
      notRecommendedProducts,
    });

    await dailyIntake.save();

    res.json({
      dailyKcal,
      notRecommendedProducts,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//! Endpoint pentru căutarea produselor
router.get("/search", async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ message: "Query string is required" });
    }

    // Căutare produse pe baza titlului sau categoriilor
    const products = await Product.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { categories: { $regex: query, $options: "i" } },
      ],
    });

    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//! Endpoint privat pentru a adăuga un produs consumat într-o anumită zi
router.post("/consumed", validateAuth, async (req, res) => {
  try {
    const { productId, date, quantity } = req.body;
    const userId = req.user._id;

    // Verificăm dacă produsul există
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const consumedProduct = new ConsumedProduct({
      userId,
      productId,
      date: new Date(date),
      quantity,
    });

    await consumedProduct.save();

    res.status(201).json(consumedProduct);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//! Endpoint privat pentru a șterge un produs consumat într-o anumită zi
router.delete("/consumed/:id", validateAuth, async (req, res) => {
  try {
    const consumedProductId = req.params.id;
    const userId = req.user._id;

    // Verificăm dacă înregistrarea produsului consumat există și aparține utilizatorului
    const consumedProduct = await ConsumedProduct.findOne({
      _id: consumedProductId,
      userId,
    });
    if (!consumedProduct) {
      return res.status(404).json({ message: "Consumed product not found" });
    }

    await ConsumedProduct.deleteOne({ _id: consumedProductId });

    res.status(200).json({ message: "Consumed product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//! Endpoint privat pentru a primi toate informațiile despre o anumită zi
router.get("/day-info", validateAuth, async (req, res) => {
  try {
    const { date } = req.query;
    const userId = req.user._id;

    // Verificăm dacă data este furnizată
    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    // Convertim data la formatul corect
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    // Găsim toate produsele consumate în acea zi de către utilizator
    const consumedProducts = await ConsumedProduct.find({
      userId,
      date: { $gte: startDate, $lte: endDate },
    }).populate("productId");

    // Calculăm totalul caloriilor consumate
    let totalCalories = 0;
    consumedProducts.forEach((consumedProduct) => {
      const productCaloriesPerGram =
        consumedProduct.productId.calories / consumedProduct.productId.weight;
      totalCalories += productCaloriesPerGram * consumedProduct.quantity;
    });

    res.json({
      date: startDate,
      totalCalories,
      consumedProducts,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
