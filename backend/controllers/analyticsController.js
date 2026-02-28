const mongoose = require('mongoose');

exports.getWardrobeAnalytics = async (req, res) => {
  console.log("Analytics request received");
  
  // Lazily load models to avoid circular dependencies or registration issues
  const Clothes = mongoose.models.Clothes || require("../models/clothesModel");
  const Accessories = mongoose.models.Accessories || require("../models/accessoriesModel");
  const Outfit = mongoose.models.Outfit || require("../models/outfitModel");

  try {
    if (mongoose.connection.readyState !== 1) {
        throw new Error("Mongoose is not connected. Ready state: " + mongoose.connection.readyState);
    }

    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const result = {
      totals: { clothes: 0, accessories: 0, outfits: 0 },
      mostUsed: { clothes: [], accessories: [] },
      donationSuggestions: { clothes: [], accessories: [] },
      breakdown: { clothes: [], accessories: [] }
    };

    // Helper to safely run queries
    const safeRun = async (fn, context) => {
      try { return await fn(); } 
      catch (e) { console.error(`Error in ${context}:`, e); return null; }
    };

    // TOTALS
    console.log("Fetching totals...");
    result.totals.clothes = (await safeRun(() => Clothes.countDocuments({ status: { $ne: "donated" } }), "totalClothes")) || 0;
    result.totals.accessories = (await safeRun(() => Accessories.countDocuments({ status: { $ne: "donated" } }), "totalAccessories")) || 0;
    result.totals.outfits = (await safeRun(() => Outfit.countDocuments(), "totalOutfits")) || 0;

    // MOST USED ITEMS
    console.log("Fetching most used...");
    result.mostUsed.clothes = (await safeRun(() => Clothes.find({ status: { $ne: "donated" }, wearCount: { $gt: 0 } }).sort({ wearCount: -1 }).limit(5), "mostUsedClothes")) || [];
    result.mostUsed.accessories = (await safeRun(() => Accessories.find({ status: { $ne: "donated" }, wearCount: { $gt: 0 } }).sort({ wearCount: -1 }).limit(5), "mostUsedAccessories")) || [];

    // DONATION SUGGESTIONS
    console.log("Fetching donation suggestions...");
    result.donationSuggestions.clothes = (await safeRun(() => Clothes.find({ status: "active", wearCount: 0 }).limit(10), "donationClothes")) || [];
    result.donationSuggestions.accessories = (await safeRun(() => Accessories.find({ status: "active", wearCount: 0 }).limit(10), "donationAccessories")) || [];

    // BREAKDOWN BY CATEGORY
    console.log("Running aggregation breakdowns...");
    result.breakdown.clothes = (await safeRun(() => Clothes.aggregate([{ $match: { status: { $ne: "donated" } } }, { $group: { _id: "$category", count: { $sum: 1 } } }]), "clothesBreakdown")) || [];
    result.breakdown.accessories = (await safeRun(() => Accessories.aggregate([{ $match: { status: { $ne: "donated" } } }, { $group: { _id: "$type", count: { $sum: 1 } } }]), "accessoriesBreakdown")) || [];

    console.log("Analytics processing complete.");
    res.json(result);
  } catch (error) {
    console.error("CRITICAL Analytics Error:", error);
    res.status(500).json({ message: "Error getting analytics", error: error.message });
  }
};
