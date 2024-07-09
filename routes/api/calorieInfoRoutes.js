// routes/api/calorieInfoRoutes.js
const express = require("express");
const router = express.Router();
const User = require("../../models/User");
const { validateAuth } = require("../../middleware/authMiddleware");

router.post("/save-calorie-info", validateAuth, async (req, res) => {
  const {
    height,
    age,
    currentWeight,
    desireWeight,
    bloodType,
    dailyRate,
    notRecommendedFoods,
  } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.calorieInfo = {
      height,
      age,
      currentWeight,
      desireWeight,
      bloodType,
      dailyRate,
      notRecommendedFoods,
    };

    await user.save();
    res.status(200).json({ message: "Calorie info saved successfully" });
  } catch (error) {
    console.log(error); // Adaugă acest log pentru debugging
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
