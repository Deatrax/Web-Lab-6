const Clothes = require("../models/clothesModel");
const Accessories = require("../models/accessoriesModel");

exports.getWardrobeAnalytics = async (req, res) => {
  try {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    // MOST USED ITEMS
    const mostUsedClothes = await Clothes.find({ wearCount: { $gte: 7 } });
    const mostUsedAccessories = await Accessories.find({ wearCount: { $gte: 7 } });

    // LEAST USED ITEMS
    const leastUsedClothes = await Clothes.find({
      $or: [
        { wearCount: { $lte: 2 } },
        { lastWorn: { $lte: oneYearAgo } },
      ],
    });

    const leastUsedAccessories = await Accessories.find({
      $or: [
        { wearCount: { $lte: 2 } },
        { lastWorn: { $lte: oneYearAgo } },
      ],
    });

    res.json({
      mostUsed: {
        clothes: mostUsedClothes,
        accessories: mostUsedAccessories,
      },
      donationSuggestions: {
        clothes: leastUsedClothes,
        accessories: leastUsedAccessories,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
